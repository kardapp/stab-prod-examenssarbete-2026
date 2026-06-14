export type WeekdayField =
  | "mondayVisits"
  | "tuesdayVisits"
  | "wednesdayVisits"
  | "thursdayVisits"
  | "fridayVisits"
  | "saturdayVisits"
  | "sundayVisits";

export type OoDimensioningProductionRow = {
  id: string;
  productionRowId: number;
  distributionId: number | null;
  roleCategory: string;
  economicKombika: string;
  careUnit: string;
  visitsFromProductionPlan: number;
  supportVisitsForOtherRoles: number;
  averageMinutesPerVisit: number;
  sourceAverageMinutesPerVisit: number;
  visitTimeComment: string;
  mondayVisits: number;
  tuesdayVisits: number;
  wednesdayVisits: number;
  thursdayVisits: number;
  fridayVisits: number;
  saturdayVisits: number;
  sundayVisits: number;
};

export type OoCareSupportRow = {
  id: string;
  careSupportRole: string;
  careSupportHoursPerWeek: number;
  careSupportComment: string;
};

export type OoAdminOtherTimeState = {
  adminHoursPerWeek: number;
  trainingHoursPerWeek: number;
  competenceDevelopmentHoursPerWeek: number;
  otherHoursPerWeek: number;
};

export type OoDimensioningSettings = {
  weeklyWorkingHours: number;
  salaryCostPerPresence: number;
};

export type OoDimensioningSummary = {
  weeklyVisits: number;
  supportVisits: number;
  productionHours: number;
  careSupportHours: number;
  adminHours: number;
  trainingHours: number;
  competenceDevelopmentHours: number;
  otherHours: number;
  totalHours: number;
  productionPresence: number;
  totalPresence: number;
  staffingCost: number;
};

export type OoDimensioningBasis = {
  economicKombika: string;
  careUnits: string[];
  year: string;
  roleCategories: string[];
  totalAnnualVisits: number;
  totalWeeklyVisits: number;
  averageMinutesPerVisit: number;
  visitTimeComments: string[];
};
