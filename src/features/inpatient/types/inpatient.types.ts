export type CareArea = "outpatient" | "inpatient";
export type InpatientCareType = "acute" | "elective";
export type InpatientPayerType = "SLL" | "UULP";

export type BaseProductionRow = {
  id: string;
  planId: number;
  economicKombika: string;
  careType: InpatientCareType;
  payerType: InpatientPayerType;
  plannedCareEvents: number;
  drgAverage: number;
};

export type InpatientKombikaOption = {
  id: string;
  code: string;
  name: string;
  section: string;
  costCenter: string;
  site: string;
};

export type InpatientProductionFormState = {
  selectedKombikaId: string;
  careEvents: number;
  acutePercentage: number;
  electivePercentage: number;
  sllPercentage: number;
  uulpPercentage: number;
  averageLengthOfStay: number;
  drgAverage: number;
};

export type InpatientCalculatedValues = {
  acuteCareEvents: number;
  electiveCareEvents: number;
  sllCareEvents: number;
  uulpCareEvents: number;
  careEventsPerDay: number;
  careDays: number;
  careDaysPerDay: number;
  averageCarePlaces: number;
  drgPoints: number;
  drgPointsPerDay: number;
};

export type InpatientProductionRow = BaseProductionRow & {
  careArea: "inpatient";
  kombikaId: string;
  section: string;
  costCenter: string;
  site: string;
  careEvents: number;
  acutePercentage: number;
  electivePercentage: number;
  sllPercentage: number;
  uulpPercentage: number;
  averageLengthOfStay: number;
  careDays: number;
  averageCarePlaces: number;
  drgPoints: number;
  previousYearPlan: number;
  r12Outcome: number;
  previousYearOutcome: number;
  savedAt: string;
};

export type InpatientProductionHistoryYear = {
  year: number;
  plannedCareEvents: number;
  r12CareEvents: number;
  previousYearOutcome: number;
  averageLengthOfStay: number;
  careDays: number;
  averageCarePlaces: number;
  drgAverage: number;
  sllCareEvents: number;
  uulpCareEvents: number;
  acuteCareEvents: number;
  electiveCareEvents: number;
};

export type InpatientOoDistributionRow = {
  id: string;
  productionRowId: string;
  careProvidingUnit: string;
  percentage: number;
  distributedCareDays: number;
};

export type InpatientOoDimensioningRow = {
  id: string;
  roleCategory: string;
  hoursPerCarePlacePerDay: number;
  weeklyWorkHours: number;
  salaryCostPerPresence: number;
};

export type InpatientOoDimensioningSettings = {
  careSupportHoursPerWeek: number;
  adminHoursPerWeek: number;
  trainingHoursPerWeek: number;
  competenceDevelopmentHoursPerWeek: number;
  otherHoursPerWeek: number;
};

export type InpatientMeDimensioningRow = {
  id: string;
  competenceLevel: string;
  doctorPresence: number;
  doctorsPerTenInpatients?: number;
  weeklyWorkHours: number;
  nonContributingPresence: number;
  adminOtherPresence: number;
  salaryCostPerPresence: number;
};

export type InpatientDimensioningResultRow = {
  id: string;
  source: "ME" | "OO";
  category: string;
  section: string;
  careProvidingUnit: string;
  month: string;
  presence: number;
  staffingCost: number;
};
