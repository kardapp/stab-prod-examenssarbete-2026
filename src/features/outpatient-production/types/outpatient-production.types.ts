export type KombikaOption = {
  id: string;
  code: string;
  name: string;
  section: string;
  costCenter: string;
  site: string;
  assignment: string;
};

export type RoleDistribution = {
  id: string;
  primaryRole: string;
  secondaryRole?: string;
  percentage: number;
};

export type VisitTimeInput = {
  visitType: string;
  averageMinutes: number;
};

export type DrgAverageInput = {
  sll: number;
  uulp: number;
};

export type OutpatientProductionFormState = {
  selectedKombikaId: string;
  date: string;
  careEvents: number;

  sllPercentage: number;
  uulpPercentage: number;

  acutePercentage: number;
  electivePercentage: number;

  roleDistributions: RoleDistribution[];

  visitTime: VisitTimeInput;

  drgAverage: DrgAverageInput;
};

export type RoleDistributionResult = {
  id: string;
  label: string;
  percentage: number;
  careEvents: number;
};

export type OutpatientProductionCalculatedValues = {
  sllCareEvents: number;
  uulpCareEvents: number;
  acuteCareEvents: number;
  electiveCareEvents: number;
  roleDistributionResults: RoleDistributionResult[];
  totalVisitMinutes: number;
  drgSll: number;
  drgUulp: number;
  totalDrg: number;
};

export type ComparisonValues = {
  previousYearPlan: number;
  r12Outcome: number;
  previousYearOutcome: number;
};

export type OutpatientProductionValidationErrors = {
  kombika?: string;
  volume?: string;
  sllUulp?: string;
  acuteElective?: string;
  roleDistribution?: string;
  visitTime?: string;
  drgAverage?: string;
};

export type OutpatientProductionSavedPlan = {
  id: string;
  kombika: KombikaOption;
  formState: OutpatientProductionFormState;
  calculatedValues: OutpatientProductionCalculatedValues;
  savedAt: string;
};
