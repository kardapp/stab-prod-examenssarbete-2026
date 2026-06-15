"use client";

import { useEffect, useMemo, useState } from "react";
import type { OutpatientProductionRow } from "@/shared/types/production";
import type { SavedOoDistributionRow } from "@/features/outpatient-production/types/outpatient-oo-distribution.types";
import {
  CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID,
  filterCurrentOoDistributionRows,
  filterCurrentOutpatientProductionRows,
  readCurrentOutpatientProductionRowIds,
} from "@/features/outpatient-production/utils/current-outpatient-production-session";
import {
  buildOoProductionRows,
  buildOoDimensioningResultRows,
  buildOoPeriodizationRows,
  calculateOoDimensioningBasis,
  calculateOoDimensioningSummary,
  calculateSalaryCostPerPresence,
  DEFAULT_WEEKLY_WORKING_HOURS,
} from "./calculations";
import type {
  OoAdminOtherTimeState,
  OoCareSupportRow,
  OoDimensioningProductionRow,
  OoDimensioningSettings,
  WeekdayField,
} from "./types";

export function useOutpatientOoDimensioning() {
  const [productionRows, setProductionRows] = useState<
    OoDimensioningProductionRow[]
  >([]);
  const [rawProductionRows, setRawProductionRows] = useState<
    OutpatientProductionRow[]
  >([]);
  const [careSupportRows, setCareSupportRows] = useState<OoCareSupportRow[]>([
    {
      id: "support-farmaceut",
      careSupportRole: "Farmaceut",
      careSupportHoursPerWeek: 0,
      careSupportComment: "",
    },
    {
      id: "support-other",
      careSupportRole: "Annan stödresurs",
      careSupportHoursPerWeek: 0,
      careSupportComment: "",
    },
  ]);
  const [adminOtherTime, setAdminOtherTime] = useState<OoAdminOtherTimeState>({
    adminHoursPerWeek: 0,
    trainingHoursPerWeek: 0,
    competenceDevelopmentHoursPerWeek: 0,
    otherHoursPerWeek: 0,
  });
  const [settings, setSettings] = useState<OoDimensioningSettings>({
    weeklyWorkingHours: DEFAULT_WEEKLY_WORKING_HOURS,
    salaryCostPerPresence: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDimensioningBasis() {
      try {
        const currentRowIds = readCurrentOutpatientProductionRowIds();

        if (currentRowIds.length === 0) {
          setProductionRows([]);
          setRawProductionRows([]);
          setErrorMessage("");
          return;
        }

        const [productionResponse, distributionResponse] = await Promise.all([
          fetch(
            `/api/outpatient-production-rows?productionPlanId=${CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID}`,
            { signal: controller.signal }
          ),
          fetch(
            `/api/outpatient-oo-distributions?productionPlanId=${CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID}`,
            { signal: controller.signal }
          ),
        ]);

        if (!productionResponse.ok || !distributionResponse.ok) {
          throw new Error("Could not fetch OO dimensioning basis.");
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

        setRawProductionRows(currentProductionRows);
        setProductionRows(
          buildOoProductionRows(currentProductionRows, currentDistributionRows)
        );
        setSettings((current) => ({
          ...current,
          salaryCostPerPresence:
            current.salaryCostPerPresence ||
            calculateSalaryCostPerPresence(currentProductionRows),
        }));
        setErrorMessage("");
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setErrorMessage(
            "Något gick fel vid hämtning av OO-dimensioneringsunderlag."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchDimensioningBasis();

    return () => controller.abort();
  }, []);

  const basis = useMemo(
    () => calculateOoDimensioningBasis(productionRows),
    [productionRows]
  );
  const summary = useMemo(
    () =>
      calculateOoDimensioningSummary({
        productionRows,
        careSupportRows,
        adminOtherTime,
        settings,
      }),
    [adminOtherTime, careSupportRows, productionRows, settings]
  );
  const periodizationRows = useMemo(
    () =>
      buildOoPeriodizationRows({
        productionRows,
        careSupportRows,
        adminOtherTime,
      }),
    [adminOtherTime, careSupportRows, productionRows]
  );

  function updateProductionRow(
    rowId: string,
    field:
      | "supportVisitsForOtherRoles"
      | "averageMinutesPerVisit"
      | WeekdayField,
    value: number
  ) {
    setSaveMessage("");
    setProductionRows((current) =>
      current.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
  }

  function updateCareSupportRow(
    rowId: string,
    field: keyof Omit<OoCareSupportRow, "id">,
    value: string | number
  ) {
    setSaveMessage("");
    setCareSupportRows((current) =>
      current.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
  }

  function addCareSupportRow() {
    setSaveMessage("");
    setCareSupportRows((current) => [
      ...current,
      {
        id: `support-${Date.now()}`,
        careSupportRole: "",
        careSupportHoursPerWeek: 0,
        careSupportComment: "",
      },
    ]);
  }

  function removeCareSupportRow(rowId: string) {
    setSaveMessage("");
    setCareSupportRows((current) =>
      current.length > 1 ? current.filter((row) => row.id !== rowId) : current
    );
  }

  function updateAdminOtherTime(
    field: keyof OoAdminOtherTimeState,
    value: number
  ) {
    setSaveMessage("");
    setAdminOtherTime((current) => ({ ...current, [field]: value }));
  }

  function updateSettings(
    field: keyof OoDimensioningSettings,
    value: number
  ) {
    setSaveMessage("");
    setSettings((current) => ({ ...current, [field]: value }));
  }

  async function saveDimensioning() {
    if (productionRows.length === 0) {
      setSaveMessage("Det finns ingen OO-dimensionering att spara.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      const response = await fetch("/api/outpatient-dimensioning-oo-results", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productionPlanId: CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID,
          rows: buildOoDimensioningResultRows({
            productionRows,
            rawProductionRows,
            careSupportRows,
            adminOtherTime,
            settings,
          }),
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save OO dimensioning results.");
      }

      setSaveMessage("Dimensionering OO ÖPV är sparad.");
    } catch (error) {
      console.error(error);
      setSaveMessage("Dimensionering OO ÖPV kunde inte sparas.");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    addCareSupportRow,
    adminOtherTime,
    basis,
    careSupportRows,
    errorMessage,
    isLoading,
    isSaving,
    periodizationRows,
    productionRows,
    rawProductionRows,
    removeCareSupportRow,
    saveDimensioning,
    saveMessage,
    settings,
    summary,
    updateAdminOtherTime,
    updateCareSupportRow,
    updateProductionRow,
    updateSettings,
  };
}
