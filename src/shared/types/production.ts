export type OutpatientProductionRow = {
  id: number;
  production_plan_id: number | null;
  production_plan_year: number | null;
  production_plan_care_type: string | null;
  organization_name: string | null;

  row_label: string;

  kombika_pf_id: string | null;
  kombika_pf: string | null;
  section: string | null;
  cost_center: string | null;
  site: string | null;
  assignment: string | null;

  period_type: string | null;
  period_value: string | null;
  care_type: string | null;
  visit_type: string | null;
  visits: number | null;
  primary_role_category: string | null;
  secondary_role_category: string | null;
  sll_uulp: string | null;
  acute_elective: string | null;
  average_minutes_per_visit: number | null;
  visit_time_comment: string | null;
  drg_average: string | null;

  annual_volume: number | null;

  acute_percentage: string | null;
  elective_percentage: string | null;

  sll_percentage: string | null;
  uulp_percentage: string | null;

  drg_average_sll: string | null;
  drg_average_uulp: string | null;

  doctor_percentage: string | null;
  nurse_percentage: string | null;
  health_professional_percentage: string | null;
  other_staff_percentage: string | null;

  periodization_key_id: string | null;
  periodization_key_description: string | null;

  oo_distribution_status: string | null;

  previous_year_plan: number | null;
  r12_outcome: number | null;
  r12_presence_fouu: number | null;
  r12_presence_production: number | null;
  r12_salary_cost_per_presence: number | null;
  previous_year_outcome: number | null;
  previous_dimensioning_presence: string | null;
  comparison_source: string | null;
};

export type DimensioningInputSummary = {
  roleCategory: string;
  totalVisits: number;
  totalMinutes: number;
  presenceNeed: number;
};
