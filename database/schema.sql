DROP TABLE IF EXISTS outpatient_comparison_values;
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

  period_type TEXT DEFAULT 'week',
  period_value TEXT,
  care_type TEXT DEFAULT 'open_care',
  visits INTEGER,
  primary_role_category TEXT,
  secondary_role_category TEXT,
  sll_uulp TEXT,
  acute_elective TEXT,
  average_minutes_per_visit INTEGER,
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

CREATE TABLE outpatient_comparison_values (
  id SERIAL PRIMARY KEY,
  production_plan_id INTEGER REFERENCES production_plans(id),
  kombika_pf_id TEXT NOT NULL,
  period_type TEXT NOT NULL,
  period_value TEXT NOT NULL,
  previous_year_plan INTEGER,
  r12_outcome INTEGER,
  previous_year_outcome INTEGER,
  previous_dimensioning_presence NUMERIC(8,2),
  source TEXT DEFAULT 'Mockdata',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
