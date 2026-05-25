export type CareType = "mottagning" | "dagvard";

export type DayCareMethod =
  | "calculate_as_outpatient"
  | "key_ratio"
  | "manual_presence";

export type PeriodizationType = "year" | "day" | "week" | "month";

export type CompetenceLevel = "ÖL" | "BÖL" | "SPEC" | "ST/LEG" | "UL";

export type DimensioningSelection = {
  productionPlanId: string;
  kombikaId: string;
  year: string;
  careType: CareType;
};

export type DimensioningRowState = {
  id?: number;
  productionRowId?: number | null;
  competenceLevel: CompetenceLevel;
  careType: CareType;
  productionSharePercentage: string;
  weeklyWorkHours: string;
  dayCareCalculationMethod: DayCareMethod;
  keyRatio: string;
  manualPresence: string;
  nonContributingStPresence: string;
  adminOtherPresence: string;
  salaryCostPerPresence: string;
  comment: string;
  periodizationType: PeriodizationType;
};

export type DimensioningRowField = keyof Pick<
  DimensioningRowState,
  | "productionSharePercentage"
  | "weeklyWorkHours"
  | "dayCareCalculationMethod"
  | "keyRatio"
  | "manualPresence"
  | "nonContributingStPresence"
  | "adminOtherPresence"
  | "salaryCostPerPresence"
  | "comment"
  | "periodizationType"
>;

export type ProductionBasisSummary = {
  productionPlanId: number | null;
  year: number | null;
  organizationName: string;
  kombikaIds: string[];
  kombikaNames: string[];
  sections: string[];
  costCenters: string[];
  careType: CareType;
  visitTypes: string[];
  roleCategories: string[];
  totalVisits: number;
  totalVisitMinutes: number;
  averageMinutesPerVisit: number;
  r12Outcome: number;
  r12PresenceFouu: number;
  r12PresenceProduction: number;
  r12SalaryCostPerPresence: number;
  previousYearPlan: number;
  previousYearOutcome: number;
  previousDimensioningPresence: number;
};

export type DimensioningRowCalculation = {
  row: DimensioningRowState;
  visitsFromProductionPlan: number;
  averageMinutesPerVisit: number;
  totalVisitMinutes: number;
  calculatedPresence: number;
  productionPresence: number;
  adminOtherPresence: number;
  nonContributingPresence: number;
  totalPresence: number;
  staffingCost: number;
};

export type DimensioneringSummary = {
  calculatedPresence: number;
  productionPresence: number;
  adminOtherPresence: number;
  nonContributingStPresence: number;
  totalPresence: number;
  staffingCost: number;
};

export type DimensioningSavePayload = {
  productionPlanId: number;
  kombikaId: string;
  careType: CareType;
  rows: DimensioningRowState[];
};
