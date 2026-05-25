import type {
  CareType,
  CompetenceLevel,
  PeriodizationType,
} from "./outpatient-dimensioning.types";

export type SavedMeDimensioningRow = {
  id: number;
  production_plan_id: number;
  production_row_id: number | null;
  kombika_pf_id: string;
  competence_level: CompetenceLevel;
  care_type: CareType;
  production_share_percentage: string | number | null;
  weekly_work_hours: string | number | null;
  day_care_calculation_method: string | null;
  key_ratio: string | number | null;
  manual_presence: string | number | null;
  non_contributing_st_presence: string | number | null;
  admin_other_presence: string | number | null;
  salary_cost_per_presence: string | number | null;
  comment: string | null;
  periodization_type: string | null;
};

export type DimensioningResultFilters = {
  periodization: PeriodizationType;
  section: string;
  roleCategory: string;
  competenceLevel: string;
  careType: string;
};

export type DimensioningResultRow = {
  id: string;
  productionPlanId: number;
  kombikaId: string;
  careType: CareType;
  roleCategory: string;
  competenceLevel: CompetenceLevel;
  economicSection: string;
  careCostCenter: string;
  sourcePeriod: string;
  period: string;
  productionPresence: number;
  adminOtherPresence: number;
  nonContributingPresence: number;
  totalPresence: number;
  salaryCostPerPresence: number;
  staffingCost: number;
  visits: number;
  drgTotal: number;
  costPerDrg: number;
  costPerCareEvent: number;
};

export type DimensioningResultSummary = {
  productionPresence: number;
  adminOtherPresence: number;
  nonContributingPresence: number;
  totalPresence: number;
  staffingCost: number;
  visits: number;
  drgTotal: number;
  costPerDrg: number;
  costPerCareEvent: number;
};

export type DimensioningResultOptions = {
  sections: string[];
  roleCategories: string[];
  competenceLevels: string[];
  careTypes: Array<{ value: string; label: string }>;
};
