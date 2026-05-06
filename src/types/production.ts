export type OutpatientProductionRow = {
    id: number;
    row_label: string;

    kombika_pf_id: string | null;
    kombika_pf: string | null;
    section: string | null;
    cost_center: string | null;
    site: string | null;
    assignment: string | null;

    acute_percentage: string | null;
    elective_percentage: string | null;

    sll_percentage: string | null;
    uulp_percentage: string | null;

    doctor_percentage: string | null;
    nurse_percentage: string | null;
    health_professional_percentage: string | null;
    other_staff_percentage: string | null;

    periodization_key_id: string | null;
    periodization_key_description: string | null;
};