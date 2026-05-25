"use client";

import { useEffect, useMemo, useState } from "react";
import type { OutpatientProductionRow } from "@/types/production";
import type {
  CareUnitOption,
  OoDistributionDraftRow,
  OoDistributionSaveResponse,
  SavedOoDistributionRow,
} from "../types/outpatient-oo-distribution.types";
import {
  careUnitOptions,
  calculateDistributionSummary,
  createEmptyDistributionRow,
  mapSavedDistributionToDraft,
  validateOoDistribution,
} from "../utils/outpatient-oo-distribution-calculations";
import {
  CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID,
  filterCurrentOoDistributionRows,
  filterCurrentOutpatientProductionRows,
  readCurrentOutpatientProductionRowIds,
} from "../utils/current-outpatient-production-session";

type DraftRowsByProductionRowId = Record<number, OoDistributionDraftRow[]>;

export function useOutpatientOoDistribution() {
  const [productionRows, setProductionRows] = useState<OutpatientProductionRow[]>(
    []
  );
  const [draftRowsByProductionRowId, setDraftRowsByProductionRowId] =
    useState<DraftRowsByProductionRowId>({});
  const [selectedProductionRowId, setSelectedProductionRowId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchOoBasis() {
      try {
        const currentRowIds = readCurrentOutpatientProductionRowIds();

        if (currentRowIds.length === 0) {
          setErrorMessage("");
          setProductionRows([]);
          setDraftRowsByProductionRowId({});
          setSelectedProductionRowId("");
          return;
        }

        const [productionResponse, distributionResponse] = await Promise.all([
          fetch(
            `/api/outpatient-production-rows?productionPlanId=${CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID}`,
            {
              signal: controller.signal,
            }
          ),
          fetch(
            `/api/outpatient-oo-distributions?productionPlanId=${CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID}`,
            {
              signal: controller.signal,
            }
          ),
        ]);

        if (!productionResponse.ok || !distributionResponse.ok) {
          throw new Error("Could not fetch OO distribution basis.");
        }

        const [productionData, distributionData] = await Promise.all([
          productionResponse.json() as Promise<OutpatientProductionRow[]>,
          distributionResponse.json() as Promise<SavedOoDistributionRow[]>,
        ]);

        setErrorMessage("");
        const currentProductionRows = filterCurrentOutpatientProductionRows(
          productionData,
          currentRowIds
        );
        const currentDistributionRows = filterCurrentOoDistributionRows(
          distributionData,
          currentRowIds
        );

        setProductionRows(currentProductionRows);
        setDraftRowsByProductionRowId(
          createDraftRowsByProductionRowId(
            currentProductionRows,
            currentDistributionRows
          )
        );
        setSelectedProductionRowId(String(currentProductionRows[0]?.id ?? ""));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setErrorMessage("Något gick fel vid hämtning av OO-underlag.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchOoBasis();

    return () => controller.abort();
  }, []);

  const selectedProductionRow = useMemo(
    () =>
      productionRows.find((row) => row.id === Number(selectedProductionRowId)) ??
      null,
    [productionRows, selectedProductionRowId]
  );

  const selectedDraftRows = useMemo(() => {
    if (!selectedProductionRow) {
      return [];
    }

    return draftRowsByProductionRowId[selectedProductionRow.id] ?? [];
  }, [draftRowsByProductionRowId, selectedProductionRow]);

  const summary = useMemo(
    () => calculateDistributionSummary(selectedProductionRow, selectedDraftRows),
    [selectedDraftRows, selectedProductionRow]
  );

  const validationMessage = useMemo(
    () => validateOoDistribution(selectedProductionRow, selectedDraftRows),
    [selectedDraftRows, selectedProductionRow]
  );

  function handleProductionRowChange(productionRowId: string) {
    setSelectedProductionRowId(productionRowId);
    setSubmitAttempted(false);
    setSaveMessage("");
  }

  function handleDistributionRowChange(
    draftRowId: string,
    changes: Partial<Omit<OoDistributionDraftRow, "id" | "savedId">>
  ) {
    if (!selectedProductionRow) {
      return;
    }

    setSaveMessage("");
    setDraftRowsByProductionRowId((current) => ({
      ...current,
      [selectedProductionRow.id]: selectedDraftRows.map((row) =>
        row.id === draftRowId ? { ...row, ...changes } : row
      ),
    }));
  }

  function handleCareUnitChange(draftRowId: string, option: CareUnitOption) {
    handleDistributionRowChange(draftRowId, {
      careUnitId: option.id,
      careUnit: option.name,
    });
  }

  function addDistributionRow() {
    if (!selectedProductionRow) {
      return;
    }

    setSaveMessage("");
    setDraftRowsByProductionRowId((current) => ({
      ...current,
      [selectedProductionRow.id]: [
        ...selectedDraftRows,
        createEmptyDistributionRow(),
      ],
    }));
  }

  function removeDistributionRow(draftRowId: string) {
    if (!selectedProductionRow) {
      return;
    }

    const nextRows = selectedDraftRows.filter((row) => row.id !== draftRowId);

    setSaveMessage("");
    setDraftRowsByProductionRowId((current) => ({
      ...current,
      [selectedProductionRow.id]: nextRows.length
        ? nextRows
        : [createEmptyDistributionRow("100")],
    }));
  }

  async function saveDistribution() {
    setSubmitAttempted(true);
    setSaveMessage("");
    setErrorMessage("");

    if (!selectedProductionRow || validationMessage) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/outpatient-oo-distributions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productionRowId: selectedProductionRow.id,
          distributions: selectedDraftRows.map((row) => ({
            careUnitId: row.careUnitId,
            careUnit: row.careUnit,
            percentage: row.percentage,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save OO distribution.");
      }

      const data = (await response.json()) as OoDistributionSaveResponse;

      setDraftRowsByProductionRowId((current) => ({
        ...current,
        [selectedProductionRow.id]: data.distributions.length
          ? data.distributions.map(mapSavedDistributionToDraft)
          : [createEmptyDistributionRow("100")],
      }));
      setProductionRows((current) =>
        current.map((row) =>
          row.id === selectedProductionRow.id
            ? { ...row, oo_distribution_status: data.status }
            : row
        )
      );
      setSaveMessage("OO-fördelningen är sparad.");
      setSubmitAttempted(false);
    } catch (error) {
      console.error(error);
      setErrorMessage("Något gick fel när OO-fördelningen skulle sparas.");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    addDistributionRow,
    careUnitOptions,
    errorMessage,
    handleCareUnitChange,
    handleDistributionRowChange,
    handleProductionRowChange,
    isLoading,
    isSaving,
    productionRows,
    removeDistributionRow,
    saveDistribution,
    saveMessage,
    selectedDraftRows,
    selectedProductionRow,
    selectedProductionRowId,
    showValidation: submitAttempted,
    summary,
    validationMessage,
  };
}

function createDraftRowsByProductionRowId(
  productionRows: OutpatientProductionRow[],
  savedRows: SavedOoDistributionRow[]
): DraftRowsByProductionRowId {
  const savedRowsByProductionRowId = savedRows.reduce<
    Record<number, SavedOoDistributionRow[]>
  >((rowsById, row) => {
    const currentRows = rowsById[row.production_row_id] ?? [];

    return {
      ...rowsById,
      [row.production_row_id]: [...currentRows, row],
    };
  }, {});

  return productionRows.reduce<DraftRowsByProductionRowId>(
    (rowsById, productionRow) => {
      const savedDistributionRows =
        savedRowsByProductionRowId[productionRow.id] ?? [];

      return {
        ...rowsById,
        [productionRow.id]: savedDistributionRows.length
          ? savedDistributionRows.map(mapSavedDistributionToDraft)
          : [createEmptyDistributionRow("100")],
      };
    },
    {}
  );
}
