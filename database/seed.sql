INSERT INTO organization_units (name, unit_type)
VALUES
('Exempelverksamhet Öppenvård', 'ME'),
('Exempelverksamhet Slutenvård', 'ME');

INSERT INTO production_plans (organization_unit_id, year, care_type)
VALUES
(1, 2026, 'OUTPATIENT');

INSERT INTO production_rows (
production_plan_id,
role_category,
visits_per_week,
average_minutes_per_visit
)
VALUES
(1, 'Läkare', 100, 45),
(1, 'Sjuksköterska', 80, 30);