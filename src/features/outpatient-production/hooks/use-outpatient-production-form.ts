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

  function saveProductionPlan() {
    setSubmitAttempted(true);

    if (hasValidationErrors(validationErrors) || !selectedKombika) {
      setSaveMessage("");
      return false;
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
    setSaveMessage(
      `Produktionsplan sparad för ${selectedKombika.code} – ${selectedKombika.name}.`
    );

    return true;
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
