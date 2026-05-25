import type {
  ComparisonValues,
  KombikaOption,
  OutpatientProductionFormState,
} from "../types/outpatient-production.types";

export const kombikaOptions: KombikaOption[] = [
  {
    id: "PF-001",
    code: "PF-001",
    name: "Mottagning A",
    section: "Sektion A",
    costCenter: "KS-1001",
    site: "Solna",
    assignment: "Basuppdrag",
  },
  {
    id: "PF-002",
    code: "PF-002",
    name: "Mottagning B",
    section: "Sektion B",
    costCenter: "KS-1002",
    site: "Huddinge",
    assignment: "Tilläggsuppdrag",
  },
  {
    id: "PF-003",
    code: "PF-003",
    name: "Dagvård",
    section: "Sektion C",
    costCenter: "KS-1003",
    site: "Solna",
    assignment: "Dagvårdsuppdrag",
  },
  {
    id: "PF-004",
    code: "PF-004",
    name: "Specialistmottagning",
    section: "Sektion D",
    costCenter: "KS-1004",
    site: "Huddinge",
    assignment: "Specialistuppdrag",
  },
];

export const roleCategoryOptions = [
  "Läkare",
  "Sjuksköterska",
  "Undersköterska",
  "Hälsoprofession",
  "Övrigt",
];

export const visitTypeOptions = ["Nybesök", "Återbesök", "Etc."];

export const comparisonValuesByKombikaId: Record<string, ComparisonValues> = {
  "PF-001": {
    previousYearPlan: 5000,
    r12Outcome: 5100,
    previousYearOutcome: 5050,
  },
  "PF-002": {
    previousYearPlan: 3700,
    r12Outcome: 3800,
    previousYearOutcome: 3750,
  },
  "PF-003": {
    previousYearPlan: 2500,
    r12Outcome: 2550,
    previousYearOutcome: 2480,
  },
  "PF-004": {
    previousYearPlan: 3000,
    r12Outcome: 3100,
    previousYearOutcome: 2950,
  },
};

export const initialFormState: OutpatientProductionFormState = {
  selectedKombikaId: "",
  careEvents: 5200,
  sllPercentage: 80,
  uulpPercentage: 20,
  acutePercentage: 30,
  electivePercentage: 70,
  roleDistributions: [
    {
      id: "role-1",
      primaryRole: "Läkare",
      secondaryRole: "Sjuksköterska",
      percentage: 60,
    },
    {
      id: "role-2",
      primaryRole: "Sjuksköterska",
      secondaryRole: "Undersköterska",
      percentage: 25,
    },
    {
      id: "role-3",
      primaryRole: "Hälsoprofession",
      secondaryRole: "",
      percentage: 15,
    },
  ],
  visitTime: {
    visitType: "Nybesök",
    averageMinutes: 45,
  },
  drgAverage: {
    sll: 1.2,
    uulp: 1.5,
  },
};
