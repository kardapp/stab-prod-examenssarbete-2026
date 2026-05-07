export type AssumptionState = {
  weeklyWorkingHours: string;
  dayCareMethod: "calculate_as_outpatient" | "manual_presence";
  manualDayCarePresence: string;
};

export type CompetenceLevel = "ÖL" | "BÖL" | "SPEC" | "ST/LEG" | "UL";

export type CompetenceState = {
  level: CompetenceLevel;
  percentage: string;
};
