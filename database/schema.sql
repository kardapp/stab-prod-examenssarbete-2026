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

CREATE TABLE production_rows (
  id SERIAL PRIMARY KEY,
  production_plan_id INTEGER NOT NULL REFERENCES production_plans(id),
  role_category TEXT NOT NULL,
  visits_per_week INTEGER NOT NULL,
  average_minutes_per_visit INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
DROP TABLE IF EXISTS outpatient_production_rows;

CREATE TABLE outpatient_production_rows (
  id SERIAL PRIMARY KEY,

  row_label TEXT NOT NULL,

  kombika_pf_id TEXT,
  kombika_pf TEXT,
  section TEXT,
  cost_center TEXT,
  site TEXT,
  assignment TEXT,

  acute_percentage NUMERIC(5,2),
  elective_percentage NUMERIC(5,2),

  sll_percentage NUMERIC(5,2),
  uulp_percentage NUMERIC(5,2),

  doctor_percentage NUMERIC(5,2),
  nurse_percentage NUMERIC(5,2),
  health_professional_percentage NUMERIC(5,2),
  other_staff_percentage NUMERIC(5,2),

  periodization_key_id TEXT,
  periodization_key_description TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);