import type {
  CareType,
  CompetenceLevel,
  DayCareMethod,
  DimensioningRowState,
  PeriodizationType,
} from "../types/outpatient-dimensioning.types";

export const competenceLevelOptions: CompetenceLevel[] = [
  "ÖL",
  "BÖL",
  "SPEC",
  "ST/LEG",
  "UL",
];

export const initialDimensioningRows: DimensioningRowState[] = [
  createInitialDimensioningRow("ÖL", "10"),
  createInitialDimensioningRow("BÖL", "15"),
  createInitialDimensioningRow("SPEC", "45"),
  createInitialDimensioningRow("ST/LEG", "25"),
  createInitialDimensioningRow("UL", "5"),
];

export const careTypeOptions: Array<{
  value: CareType;
  label: string;
}> = [
  { value: "mottagning", label: "Mottagning" },
  { value: "dagvard", label: "Dagvård" },
];

export const dayCareMethodOptions: Array<{
  value: DayCareMethod;
  label: string;
}> = [
  {
    value: "calculate_as_outpatient",
    label: "Som mottagning",
  },
  {
    value: "key_ratio",
    label: "Enligt nyckeltal",
  },
  {
    value: "manual_presence",
    label: "Manuell bemanning",
  },
];

export const periodizationTypeOptions: Array<{
  value: PeriodizationType;
  label: string;
}> = [
  { value: "day", label: "Dag" },
  { value: "week", label: "Vecka" },
  { value: "month", label: "Månad" },
];

function createInitialDimensioningRow(
  competenceLevel: CompetenceLevel,
  productionSharePercentage: string
): DimensioningRowState {
  return {
    competenceLevel,
    careType: "mottagning",
    productionSharePercentage,
    weeklyWorkHours: "40",
    dayCareCalculationMethod: "calculate_as_outpatient",
    keyRatio: "",
    manualPresence: "",
    nonContributingStPresence: competenceLevel === "ST/LEG" ? "0" : "",
    adminOtherPresence: "0",
    salaryCostPerPresence: "",
    comment: "",
    periodizationType: "day",
  };
}
