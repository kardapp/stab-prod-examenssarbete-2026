DROP TABLE IF EXISTS outpatient_comparison_values;
DROP TABLE IF EXISTS dimensionering_me_opv_rows;
DROP TABLE IF EXISTS outpatient_production_rows;
DROP TABLE IF EXISTS production_rows;
DROP TABLE IF EXISTS production_plans;
DROP TABLE IF EXISTS organization_units;

CREATE TABLE organization_units (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  unit_type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE production_plans (
  id SERIAL PRIMARY KEY,
  organization_unit_id INTEGER NOT NULL REFERENCES organization_units(id),
  year INTEGER NOT NULL,
  care_type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE outpatient_production_rows (
  id SERIAL PRIMARY KEY,

  production_plan_id INTEGER REFERENCES production_plans(id),

  row_label TEXT NOT NULL,

  kombika_pf_id TEXT,
  kombika_pf TEXT,
  section TEXT,
  cost_center TEXT,
  site TEXT,
  assignment TEXT,

  period_type TEXT DEFAULT 'year',
  period_value TEXT,
  care_type TEXT DEFAULT 'open_care',
  visit_type TEXT,
  visits INTEGER,
  primary_role_category TEXT,
  secondary_role_category TEXT,
  sll_uulp TEXT,
  acute_elective TEXT,
  average_minutes_per_visit INTEGER,
  visit_time_comment TEXT,
  drg_average NUMERIC(8,2),

  annual_volume INTEGER,

  acute_percentage NUMERIC(5,2),
  elective_percentage NUMERIC(5,2),

  sll_percentage NUMERIC(5,2),
  uulp_percentage NUMERIC(5,2),

  drg_average_sll NUMERIC(8,2),
  drg_average_uulp NUMERIC(8,2),

  doctor_percentage NUMERIC(5,2),
  nurse_percentage NUMERIC(5,2),
  health_professional_percentage NUMERIC(5,2),
  other_staff_percentage NUMERIC(5,2),

  periodization_key_id TEXT,
  periodization_key_description TEXT,

  oo_distribution_status TEXT DEFAULT 'Ej fördelad',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE outpatient_oo_distributions (
  id SERIAL PRIMARY KEY,
  production_row_id INTEGER NOT NULL REFERENCES outpatient_production_rows(id) ON DELETE CASCADE,
  distribution_order INTEGER NOT NULL DEFAULT 0,
  care_unit_id TEXT,
  care_unit TEXT NOT NULL,
  distribution_percentage NUMERIC(5,2) DEFAULT 0,
  visits NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE outpatient_oo_distribution_role_allocations (
  id SERIAL PRIMARY KEY,
  distribution_id INTEGER NOT NULL REFERENCES outpatient_oo_distributions(id) ON DELETE CASCADE,
  primary_role_category TEXT NOT NULL,
  secondary_role_category TEXT,
  role_percentage NUMERIC(5,2) DEFAULT 0,
  role_visits NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dimensionering_me_opv_rows (
  id SERIAL PRIMARY KEY,
  production_plan_id INTEGER NOT NULL REFERENCES production_plans(id),
  production_row_id INTEGER REFERENCES outpatient_production_rows(id),
  kombika_pf_id TEXT NOT NULL DEFAULT '',
  competence_level TEXT NOT NULL,
  care_type TEXT NOT NULL,
  production_share_percentage NUMERIC(5,2) DEFAULT 0,
  weekly_work_hours NUMERIC(6,2) DEFAULT 40,
  day_care_calculation_method TEXT DEFAULT 'calculate_as_outpatient',
  key_ratio NUMERIC(10,2),
  manual_presence NUMERIC(10,2),
  non_contributing_st_presence NUMERIC(10,2) DEFAULT 0,
  admin_other_presence NUMERIC(10,2) DEFAULT 0,
  salary_cost_per_presence NUMERIC(12,2) DEFAULT 0,
  comment TEXT,
  periodization_type TEXT DEFAULT 'year',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (production_plan_id, kombika_pf_id, care_type, competence_level)
);

CREATE TABLE outpatient_comparison_values (
  id SERIAL PRIMARY KEY,
  production_plan_id INTEGER REFERENCES production_plans(id),
  kombika_pf_id TEXT NOT NULL,
  period_type TEXT NOT NULL,
  period_value TEXT NOT NULL,
  previous_year_plan INTEGER,
  r12_outcome INTEGER,
  r12_presence_fouu NUMERIC(8,2),
  r12_presence_production NUMERIC(8,2),
  r12_salary_cost_per_presence NUMERIC(12,2),
  previous_year_outcome INTEGER,
  previous_dimensioning_presence NUMERIC(8,2),
  source TEXT DEFAULT 'Mockdata',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (production_plan_id, kombika_pf_id, period_type, period_value)
);
