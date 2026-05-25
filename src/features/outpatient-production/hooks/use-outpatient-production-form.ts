"use client";

import { useMemo, useState } from "react";
import {
  comparisonValuesByKombikaId,
  initialFormState,
  kombikaOptions,
  roleCategoryOptions,
} from "../constants/outpatient-production-options";
import type {
  DrgAverageInput,
  OutpatientProductionFormState,
  OutpatientProductionSavedPlan,
  RoleDistribution,
  VisitTimeInput,
} from "../types/outpatient-production.types";
import { calculateOutpatientProductionValues } from "../utils/outpatient-production-calculations";
import {
  hasValidationErrors,
  validateOutpatientProductionForm,
} from "../utils/outpatient-production-validation";
import {
  clearCurrentOutpatientProductionRowIds,
  CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID,
  saveCurrentOutpatientProductionRowIds,
} from "../utils/current-outpatient-production-session";

type DistributionPercentageField =
  | "sllPercentage"
  | "uulpPercentage"
  | "acutePercentage"
  | "electivePercentage";

const ANNUAL_PERIOD_TYPE = "year";

export function useOutpatientProductionForm() {
  const [formState, setFormState] =
    useState<OutpatientProductionFormState>(initialFormState);
  const [savedPlan, setSavedPlan] =
    useState<OutpatientProductionSavedPlan | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveSeverity, setSaveSeverity] = useState<"success" | "error">(
    "success"
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const selectedKombika = useMemo(
    () =>
      kombikaOptions.find(
        (option) => option.id === formState.selectedKombikaId
      ) ?? null,
    [formState.selectedKombikaId]
  );

  const calculatedValues = useMemo(
    () => calculateOutpatientProductionValues(formState),
    [formState]
  );

  const validationErrors = useMemo(
    () => validateOutpatientProductionForm(formState),
    [formState]
  );

  const comparisonValues = selectedKombika
    ? comparisonValuesByKombikaId[selectedKombika.id]
    : null;
  const dimensioningHref = useMemo(() => {
    if (!selectedKombika) {
      return "/outpatient/dimensioning";
    }

    const careType = selectedKombika.name.toLowerCase().includes("dagv")
      ? "dagvard"
      : "mottagning";
    const params = new URLSearchParams({
      productionPlanId: String(CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID),
      kombikaId: selectedKombika.id,
      careType,
    });

    return `/outpatient/dimensioning?${params.toString()}`;
  }, [selectedKombika]);

  function updateFormState(
    updater: (
      current: OutpatientProductionFormState
    ) => OutpatientProductionFormState
  ) {
    setSaveMessage("");
    setSaveSeverity("success");
    setFormState(updater);
  }

  function handleKombikaChange(selectedKombikaId: string) {
    updateFormState((current) => ({ ...current, selectedKombikaId }));
  }

  function handleCareEventsChange(careEvents: number) {
    updateFormState((current) => ({ ...current, careEvents }));
  }

  function handleDistributionPercentageChange(
    field: DistributionPercentageField,
    value: number
  ) {
    updateFormState((current) => ({ ...current, [field]: value }));
  }

  function handleRoleDistributionChange(
    roleId: string,
    field: keyof Omit<RoleDistribution, "id">,
    value: string | number
  ) {
    updateFormState((current) => ({
      ...current,
      roleDistributions: current.roleDistributions.map((role) =>
        role.id === roleId ? { ...role, [field]: value } : role
      ),
    }));
  }

  function addRoleDistribution() {
    updateFormState((current) => ({
      ...current,
      roleDistributions: [
        ...current.roleDistributions,
        {
          id: `role-${Date.now()}`,
          primaryRole: roleCategoryOptions[0],
          secondaryRole: "",
          percentage: 0,
        },
      ],
    }));
  }

  function removeRoleDistribution(roleId: string) {
    updateFormState((current) => ({
      ...current,
      roleDistributions: current.roleDistributions.filter(
        (role) => role.id !== roleId
      ),
    }));
  }

  function handleVisitTimeChange(
    field: keyof VisitTimeInput,
    value: string | number
  ) {
    updateFormState((current) => ({
      ...current,
      visitTime: { ...current.visitTime, [field]: value },
    }));
  }

  function handleDrgAverageChange(field: keyof DrgAverageInput, value: number) {
    updateFormState((current) => ({
      ...current,
      drgAverage: { ...current.drgAverage, [field]: value },
    }));
  }

  async function saveProductionPlan(): Promise<void> {
    setSubmitAttempted(true);

    if (hasValidationErrors(validationErrors) || !selectedKombika) {
      setSaveMessage("");
      return;
    }

    const nextSavedPlan: OutpatientProductionSavedPlan = {
      id: `${selectedKombika.id}-${CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID}`,
      kombika: selectedKombika,
      formState,
      calculatedValues,
      savedAt: new Date().toISOString(),
    };

    try {
      clearCurrentOutpatientProductionRowIds();

      await fetch(
        `/api/outpatient-production-rows?productionPlanId=${CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID}`,
        {
          method: "DELETE",
        }
      ).then((response) => {
        if (!response.ok) {
          throw new Error("Failed to reset current production plan.");
        }
      });

      const roleVisits = distributeCareEventsByRole(
        formState.careEvents,
        formState.roleDistributions
      );
      const savedRows = await Promise.all(
        formState.roleDistributions.map(async (role, index) => {
          const response = await fetch("/api/outpatient-production-rows", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              production_plan_id: CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID,
              kombika_pf_id: selectedKombika.id,
              kombika_pf: selectedKombika.name,
              section: selectedKombika.section,
              cost_center: selectedKombika.costCenter,
              site: selectedKombika.site,
              assignment: selectedKombika.assignment,
              period_type: ANNUAL_PERIOD_TYPE,
              care_type: "open_care",
              visit_type: formState.visitTime.visitType,
              visits: roleVisits[index],
              primary_role_category: role.primaryRole,
              secondary_role_category: role.secondaryRole || undefined,
              sll_uulp: formState.sllPercentage > 50 ? "SLL" : "UULP",
              acute_elective:
                formState.acutePercentage > 50 ? "Akut" : "Elektivt",
              average_minutes_per_visit: formState.visitTime.averageMinutes,
              drg_average:
                formState.sllPercentage > 50
                  ? formState.drgAverage.sll
                  : formState.drgAverage.uulp,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to save outpatient production row.");
          }

          return (await response.json()) as { id: number };
        })
      );

      saveCurrentOutpatientProductionRowIds(savedRows.map((row) => row.id));
      setSavedPlan(nextSavedPlan);
      setSaveSeverity("success");
      setSaveMessage(
        `Produktionsplan sparad för året: ${selectedKombika.code} – ${selectedKombika.name}.`
      );
    } catch (error) {
      console.error("Failed to save production plan to database:", error);
      clearCurrentOutpatientProductionRowIds();
      setSavedPlan(null);
      setSaveSeverity("error");
      setSaveMessage("Produktionsplanen kunde inte sparas. Försök igen.");
    }
  }

  return {
    formState,
    selectedKombika,
    calculatedValues,
    comparisonValues,
    validationErrors,
    showValidation: submitAttempted || hasValidationErrors(validationErrors),
    savedPlan,
    saveMessage,
    saveSeverity,
    dimensioningHref,
    handleKombikaChange,
    handleCareEventsChange,
    handleDistributionPercentageChange,
    handleRoleDistributionChange,
    addRoleDistribution,
    removeRoleDistribution,
    handleVisitTimeChange,
    handleDrgAverageChange,
    saveProductionPlan,
  };
}

function distributeCareEventsByRole(
  careEvents: number,
  roleDistributions: RoleDistribution[]
): number[] {
  const totalCareEvents = Math.round(Number(careEvents) || 0);
  let allocatedCareEvents = 0;

  return roleDistributions.map((role, index) => {
    if (index === roleDistributions.length - 1) {
      return Math.max(0, totalCareEvents - allocatedCareEvents);
    }

    const roleCareEvents = Math.round(
      (totalCareEvents * Number(role.percentage || 0)) / 100
    );

    allocatedCareEvents += roleCareEvents;

    return roleCareEvents;
  });
}
