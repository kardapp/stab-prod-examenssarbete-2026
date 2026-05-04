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