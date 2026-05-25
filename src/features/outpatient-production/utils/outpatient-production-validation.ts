import type {
  OutpatientProductionFormState,
  OutpatientProductionValidationErrors,
} from "../types/outpatient-production.types";
import { toNumber } from "./outpatient-production-calculations";

const PERCENTAGE_TARGET = 100;
const PERCENTAGE_TOLERANCE = 0.01;

export function validateOutpatientProductionForm(
  formState: OutpatientProductionFormState
): OutpatientProductionValidationErrors {
  const errors: OutpatientProductionValidationErrors = {};

  if (!formState.selectedKombikaId) {
    errors.kombika = "Ekonomisk kombika måste vara vald.";
  }

  if (toNumber(formState.careEvents) <= 0) {
    errors.volume = "Antal vårdtillfällen måste vara ett positivt tal.";
  }

  if (
    hasNegativePercentage(formState.sllPercentage) ||
    hasNegativePercentage(formState.uulpPercentage) ||
    !isValidPercentageSum([
      formState.sllPercentage,
      formState.uulpPercentage,
    ])
  ) {
    errors.sllUulp = "Andelarna för SLL/UULP måste summera till 100 %.";
  }

  if (
    hasNegativePercentage(formState.acutePercentage) ||
    hasNegativePercentage(formState.electivePercentage) ||
    !isValidPercentageSum([
      formState.acutePercentage,
      formState.electivePercentage,
    ])
  ) {
    errors.acuteElective =
      "Andelarna för akut/elektivt måste summera till 100 %.";
  }

  if (
    formState.roleDistributions.length === 0 ||
    formState.roleDistributions.some(
      (role) => !role.primaryRole || hasNegativePercentage(role.percentage)
    ) ||
    !isValidPercentageSum(
      formState.roleDistributions.map((role) => role.percentage)
    )
  ) {
    errors.roleDistribution =
      "Yrkeskategoriernas andelar måste summera till 100 %.";
  }

  if (toNumber(formState.visitTime.averageMinutes) <= 0) {
    errors.visitTime = "Snitt-tid per besök måste vara ett positivt tal.";
  }

  if (
    toNumber(formState.drgAverage.sll) <= 0 ||
    toNumber(formState.drgAverage.uulp) <= 0
  ) {
    errors.drgAverage = "DRG-snitt SLL och UULP måste vara positiva tal.";
  }

  return errors;
}

export function hasValidationErrors(
  errors: OutpatientProductionValidationErrors
): boolean {
  return Object.values(errors).some(Boolean);
}

function isValidPercentageSum(percentages: number[]): boolean {
  return (
    Math.abs(
      percentages.reduce((sum, percentage) => sum + toNumber(percentage), 0) -
        PERCENTAGE_TARGET
    ) <= PERCENTAGE_TOLERANCE
  );
}

function hasNegativePercentage(percentage: number): boolean {
  return toNumber(percentage) < 0;
}
