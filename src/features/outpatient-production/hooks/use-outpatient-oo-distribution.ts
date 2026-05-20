"use client";

import { useEffect, useMemo, useState } from "react";
import type { OutpatientProductionRow } from "@/types/production";
import type {
  OoDistributionDraftRow,
  OoDistributionSaveResponse,
  SavedOoDistributionRow,
} from "../types/outpatient-oo-distribution.types";
import {
  calculateDistributionSummary,
  createEmptyDistributionRow,
  mapSavedDistributionToDraft,
  validateOoDistribution,
} from "../utils/outpatient-oo-distribution-calculations";

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
        const [productionResponse, distributionResponse] = await Promise.all([
          fetch("/api/outpatient-production-rows", {
            signal: controller.signal,
          }),
          fetch("/api/outpatient-oo-distributions", {
            signal: controller.signal,
          }),
        ]);

        if (!productionResponse.ok || !distributionResponse.ok) {
          throw new Error("Could not fetch OO distribution basis.");
        }

        const [productionData, distributionData] = await Promise.all([
          productionResponse.json() as Promise<OutpatientProductionRow[]>,
          distributionResponse.json() as Promise<SavedOoDistributionRow[]>,
        ]);

        setErrorMessage("");
        setProductionRows(productionData);
        setDraftRowsByProductionRowId(
          createDraftRowsByProductionRowId(productionData, distributionData)
        );
        setSelectedProductionRowId(String(productionData[0]?.id ?? ""));
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
    field: keyof Omit<OoDistributionDraftRow, "id" | "savedId">,
    value: string
  ) {
    if (!selectedProductionRow) {
      return;
    }

    setSaveMessage("");
    setDraftRowsByProductionRowId((current) => ({
      ...current,
      [selectedProductionRow.id]: selectedDraftRows.map((row) =>
        row.id === draftRowId ? { ...row, [field]: value } : row
      ),
    }));
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
            ooName: row.ooName,
            careUnit: row.careUnit,
            careUnitCostCenter: row.careUnitCostCenter,
            percentage: row.percentage,
            comment: row.comment,
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
    errorMessage,
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
