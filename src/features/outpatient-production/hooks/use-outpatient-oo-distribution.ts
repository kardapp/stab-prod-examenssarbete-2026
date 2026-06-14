"use client";

import { useEffect, useMemo, useState } from "react";
import type { OutpatientProductionRow } from "@/shared/types/production";
import type {
  CareUnitOption,
  OoDistributionDraftRow,
  OoDistributionSaveResponse,
  SavedOoDistributionRow,
} from "../types/outpatient-oo-distribution.types";
import {
  careUnitOptions,
  createEmptyDistributionRow,
  mapSavedDistributionToDraft,
  toNumber,
  validateOoDistributionForAllRoles,
} from "../utils/outpatient-oo-distribution-calculations";
import { getAnnualVisits } from "../utils/outpatient-production-calculations";
import {
  CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID,
  filterCurrentOoDistributionRows,
  filterCurrentOutpatientProductionRows,
  readCurrentOutpatientProductionRowIds,
} from "../utils/current-outpatient-production-session";

export function useOutpatientOoDistribution() {
  const [productionRows, setProductionRows] = useState<OutpatientProductionRow[]>(
    []
  );
  const [draftRows, setDraftRows] = useState<OoDistributionDraftRow[]>([]);
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
          setDraftRows([]);
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
        const currentProductionRows = filterCurrentOutpatientProductionRows(
          productionData,
          currentRowIds
        );
        const currentDistributionRows = filterCurrentOoDistributionRows(
          distributionData,
          currentRowIds
        );

        setErrorMessage("");
        setProductionRows(currentProductionRows);
        setDraftRows(
          createDraftRowsForCurrentProduction(
            currentProductionRows,
            currentDistributionRows
          )
        );
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

  // Return ALL production rows, not just first one for role allocations display
  const selectedProductionRow = productionRows[0] ?? null;
  const summary = useMemo(
    () => calculateAggregateDistributionSummary(productionRows, draftRows),
    [draftRows, productionRows]
  );

  const validationMessage = useMemo(
    () => validateOoDistributionForAllRoles(draftRows, productionRows),
    [draftRows, productionRows]
  );

  function handleDistributionRowChange(
    draftRowId: string,
    changes: Partial<Omit<OoDistributionDraftRow, "id" | "savedId">>
  ) {
    if (productionRows.length === 0) {
      return;
    }

    setSaveMessage("");
    setDraftRows((current) =>
      current.map((row) =>
        row.id === draftRowId ? { ...row, ...changes } : row
      )
    );
  }

  function handleCareUnitChange(draftRowId: string, option: CareUnitOption) {
    handleDistributionRowChange(draftRowId, {
      careUnitId: option.id,
      careUnit: option.name,
    });
  }

  function addDistributionRow() {
    if (productionRows.length === 0) {
      return;
    }

    setSaveMessage("");
    setDraftRows((current) => [
      ...current,
      createEmptyDistributionRow("0", productionRows),
    ]);
  }

  function removeDistributionRow(draftRowId: string) {
    if (productionRows.length === 0) {
      return;
    }

    const nextRows = draftRows.filter((row) => row.id !== draftRowId);

    setSaveMessage("");
    setDraftRows(
      nextRows.length ? nextRows : [createEmptyDistributionRow("100", productionRows)]
    );
  }

  async function saveDistribution() {
    setSubmitAttempted(true);
    setSaveMessage("");
    setErrorMessage("");

    if (productionRows.length === 0 || validationMessage) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/outpatient-oo-distributions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          distributions: draftRows.map((row) => ({
            productionRowId: row.productionRowId,
            careUnitId: row.careUnitId,
            careUnit: row.careUnit,
            percentage: row.percentage,
            visits: row.visits,
            roleAllocations: row.roleAllocations.map((role) => ({
              primaryRoleCategory: role.primaryRoleCategory,
              secondaryRoleCategory: role.secondaryRoleCategory,
              rolePercentage: role.rolePercentage,
            })),
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save OO distribution.");
      }

      const saveResponse = (await response.json()) as OoDistributionSaveResponse;

      setDraftRows(
        createDraftRowsForCurrentProduction(
          productionRows,
          saveResponse.distributions
        )
      );
      setProductionRows((current) =>
        current.map((row) => ({
          ...row,
          oo_distribution_status: saveResponse.status,
        }))
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
    isLoading,
    isSaving,
    productionRows,
    removeDistributionRow,
    saveDistribution,
    saveMessage,
    selectedDraftRows: draftRows,
    selectedProductionRow,
    showValidation: submitAttempted,
    summary,
    validationMessage,
  };
}

function createDraftRowsForCurrentProduction(
  productionRows: OutpatientProductionRow[],
  savedRows: SavedOoDistributionRow[]
): OoDistributionDraftRow[] {
  if (productionRows.length === 0) {
    return [createEmptyDistributionRow("100", productionRows)];
  }

  const currentProductionRowIds = new Set(productionRows.map((row) => row.id));
  const currentSavedRows = savedRows.filter((row) =>
    currentProductionRowIds.has(row.production_row_id)
  );

  if (currentSavedRows.length > 0) {
    const savedDraftRows = currentSavedRows.map((row) =>
      mapSavedDistributionToDraft(row, productionRows)
    );
    const savedProductionRowIds = new Set(
      savedDraftRows
        .map((row) => row.productionRowId)
        .filter((id): id is number => id !== null)
    );
    const missingDraftRows = productionRows
      .filter((row) => !savedProductionRowIds.has(row.id))
      .map((row) => createEmptyDistributionRow("100", productionRows, row.id));

    return [...savedDraftRows, ...missingDraftRows];
  }

  return productionRows.map((row) =>
    createEmptyDistributionRow("100", productionRows, row.id)
  );
}

function calculateAggregateDistributionSummary(
  productionRows: OutpatientProductionRow[],
  rows: OoDistributionDraftRow[]
) {
  const productionRowsById = new Map(
    productionRows.map((row) => [row.id, row])
  );
  const totalVisits = productionRows.reduce(
    (sum, row) => sum + getAnnualVisits(row),
    0
  );
  const distributedVisits = rows.reduce((sum, row) => {
    const productionRow = row.productionRowId
      ? productionRowsById.get(row.productionRowId)
      : undefined;

    if (!productionRow || !row.careUnitId.trim() || !row.careUnit.trim()) {
      return sum;
    }

    return sum + toNumber(row.visits);
  }, 0);
  const totalPercentage = totalVisits
    ? (distributedVisits / totalVisits) * 100
    : 0;

  return {
    totalVisits,
    totalPercentage,
    distributedVisits,
    remainingPercentage: 100 - totalPercentage,
    remainingVisits: totalVisits - distributedVisits,
  };
}
