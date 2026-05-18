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

type DistributionPercentageField =
  | "sllPercentage"
  | "uulpPercentage"
  | "acutePercentage"
  | "electivePercentage";

const STORAGE_KEY_PREFIX = "outpatient-production-plan";

export function useOutpatientProductionForm() {
  const [formState, setFormState] =
    useState<OutpatientProductionFormState>(initialFormState);
  const [savedPlan, setSavedPlan] =
    useState<OutpatientProductionSavedPlan | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
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
      productionPlanId: "1",
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
    setFormState(updater);
  }

  function handleKombikaChange(selectedKombikaId: string) {
    updateFormState((current) => ({ ...current, selectedKombikaId }));
  }

  function handleDateChange(date: string) {
    updateFormState((current) => ({ ...current, date }));
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
      id: `${selectedKombika.id}-${formState.date}`,
      kombika: selectedKombika,
      formState,
      calculatedValues,
      savedAt: new Date().toISOString(),
    };

    setSavedPlan(nextSavedPlan);
    try {
      window.localStorage.setItem(
        `${STORAGE_KEY_PREFIX}:${nextSavedPlan.id}`,
        JSON.stringify(nextSavedPlan)
      );
    } catch {
      // The saved plan still remains in React state if browser storage is blocked.
    }

    // Save to database via API
    try {
      // Create one row per role distribution
      const savePromises = formState.roleDistributions.map((role) =>
        fetch("/api/outpatient-production-rows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kombika_pf_id: selectedKombika.id,
            kombika_pf: selectedKombika.name,
            section: selectedKombika.section,
            cost_center: selectedKombika.costCenter,
            site: selectedKombika.site,
            assignment: selectedKombika.assignment,
            period_type: "day",
            period_value: formState.date,
            care_type: "open_care",
            visit_type: formState.visitTime.visitType,
            visits: Math.round(
              (formState.careEvents * role.percentage) / 100
            ),
            primary_role_category: role.primaryRole,
            secondary_role_category: role.secondaryRole || undefined,
            sll_uulp:
              formState.sllPercentage > 50 ? "SLL" : "UULP",
            acute_elective:
              formState.acutePercentage > 50 ? "Akut" : "Elektivt",
            average_minutes_per_visit:
              formState.visitTime.averageMinutes,
            drg_average:
              formState.sllPercentage > 50
                ? formState.drgAverage.sll
                : formState.drgAverage.uulp,
          }),
        })
      );

      await Promise.all(savePromises);
    } catch (error) {
      console.error("Failed to save production plan to database:", error);
    }

    setSaveMessage(
      `Produktionsplan sparad för ${selectedKombika.code} – ${selectedKombika.name}.`
    );
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
    dimensioningHref,
    handleKombikaChange,
    handleDateChange,
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
