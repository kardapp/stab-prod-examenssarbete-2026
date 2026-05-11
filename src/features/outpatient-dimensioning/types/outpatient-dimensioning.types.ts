export type DayCareMethod = "calculate_as_outpatient" | "manual_presence";

export type AssumptionState = {
  weeklyWorkingHours: string;
  dayCareMethod: DayCareMethod;
  manualDayCarePresence: string;
};

export type CompetenceLevel = "ÖL" | "BÖL" | "SPEC" | "ST/LEG" | "UL";

export type CompetenceState = {
  level: CompetenceLevel;
  percentage: string;
};

export type DimensioningValues = {
  totalVisitMinutes: number;
  currentYearPlan: number;
  productionPresence: number;
  r12Outcome: number;
  previousYearOutcome: number;
  previousDimensioningPresence: number;
  competencePercentageSum: number;
  hasInvalidCompetenceSplit: boolean;
};

export type CompetenceLevelCalculation = {
  level: CompetenceLevel;
  percentage: string;
  visitMinutes: number;
  presence: number;
};
