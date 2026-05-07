import type { AssumptionState, CompetenceState } from "./dimensioningTypes";

export const initialAssumptions: AssumptionState = {
  weeklyWorkingHours: "40",
  dayCareMethod: "calculate_as_outpatient",
  manualDayCarePresence: "0",
};

export const initialCompetenceLevels: CompetenceState[] = [
  { level: "ÖL", percentage: "10" },
  { level: "BÖL", percentage: "15" },
  { level: "SPEC", percentage: "45" },
  { level: "ST/LEG", percentage: "25" },
  { level: "UL", percentage: "5" },
];
