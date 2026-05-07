import type { OutpatientProductionFormState } from "./outpatientProductionTypes";

export const kombikaOptions = [
  {
    id: "PF-001",
    label: "ÖPV Mottagning A",
    section: "Sektion A",
    costCenter: "KS-1001",
    site: "Solna",
    assignment: "Basuppdrag",
  },
  {
    id: "PF-002",
    label: "ÖPV Mottagning B",
    section: "Sektion B",
    costCenter: "KS-1002",
    site: "Huddinge",
    assignment: "Tilläggsuppdrag",
  },
  {
    id: "PF-003",
    label: "ÖPV Dagvård",
    section: "Sektion C",
    costCenter: "KS-1003",
    site: "Solna",
    assignment: "Dagvårdsuppdrag",
  },
];

export const roleCategoryOptions = [
  "Läkare",
  "Sjuksköterska",
  "Undersköterska",
  "Hälsoprofession",
  "Övrig personal",
];

export const visitTypeOptions = ["Nybesök", "Återbesök", "Etc."];

export const initialFormState: OutpatientProductionFormState = {
  kombika_pf_id: "PF-001",
  kombika_pf: "ÖPV Mottagning A",
  section: "Sektion A",
  cost_center: "KS-1001",
  site: "Solna",
  assignment: "Basuppdrag",
  period_type: "day",
  period_value: "2027-03-24",
  care_type: "open_care",
  visit_type: "Nybesök",
  visits: "",
  primary_role_category: "Läkare",
  secondary_role_category: "",
  sll_uulp: "SLL",
  acute_elective: "Elektivt",
  average_minutes_per_visit: "",
  drg_average: "",
};
