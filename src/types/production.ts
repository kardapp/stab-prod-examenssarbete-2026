export type CareType = "OUTPATIENT" | "INPATIENT";

export type ProductionPlan = {
    id: number;
    year: number;
    care_type: CareType;
    organization_name: string;
};

export type ProductionRow = {
    id: number;
    production_plan_id: number;
    role_category: string;
    visits_per_week: number;
    average_minutes_per_visit: number;
};