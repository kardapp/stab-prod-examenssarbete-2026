import type {
  InpatientKombikaOption,
  InpatientMeDimensioningRow,
  InpatientOoDimensioningRow,
  InpatientOoDimensioningSettings,
  InpatientProductionFormState,
} from "../types/inpatient.types";

export const CURRENT_INPATIENT_PRODUCTION_PLAN_ID = 2;

export const inpatientKombikaOptions: InpatientKombikaOption[] = [
  {
    id: "SLV-001",
    code: "SLV-001",
    name: "Slutenvård A",
    section: "Sektion SLV A",
    costCenter: "KS-2001",
    site: "Solna",
  },
  {
    id: "SLV-002",
    code: "SLV-002",
    name: "Slutenvård B",
    section: "Sektion SLV B",
    costCenter: "KS-2002",
    site: "Huddinge",
  },
  {
    id: "SLV-003",
    code: "SLV-003",
    name: "Akut slutenvård",
    section: "Sektion SLV C",
    costCenter: "KS-2003",
    site: "Solna",
  },
];

export const inpatientCareProvidingUnits = [
  "Vårdavdelning A",
  "Vårdavdelning B",
  "IMA",
  "Postoperativ vård",
];

export const initialInpatientProductionFormState: InpatientProductionFormState =
  {
    selectedKombikaId: "SLV-001",
    date: "2026-01-01",
    careEvents: 50000,
    acutePercentage: 35,
    electivePercentage: 65,
    sllPercentage: 82,
    uulpPercentage: 18,
    averageLengthOfStay: 4.2,
    drgAverage: 1.35,
    previousYearPlan: 47000,
    r12Outcome: 48600,
    previousYearOutcome: 46200,
  };

export const initialInpatientOoDimensioningRows: InpatientOoDimensioningRow[] = [
  {
    id: "oo-nurse",
    roleCategory: "Sjuksköterska",
    hoursPerCarePlacePerDay: 5.5,
    weeklyWorkHours: 40,
    salaryCostPerPresence: 620000,
  },
  {
    id: "oo-assistant-nurse",
    roleCategory: "Undersköterska",
    hoursPerCarePlacePerDay: 4.8,
    weeklyWorkHours: 40,
    salaryCostPerPresence: 480000,
  },
  {
    id: "oo-health-profession",
    roleCategory: "Hälsoprofession",
    hoursPerCarePlacePerDay: 0.8,
    weeklyWorkHours: 40,
    salaryCostPerPresence: 560000,
  },
];

export const initialInpatientOoDimensioningSettings: InpatientOoDimensioningSettings =
  {
    careSupportHoursPerWeek: 80,
    adminHoursPerWeek: 60,
    trainingHoursPerWeek: 24,
    competenceDevelopmentHoursPerWeek: 16,
    otherHoursPerWeek: 12,
  };

export const initialInpatientMeDimensioningRows: InpatientMeDimensioningRow[] = [
  {
    id: "me-ol",
    competenceLevel: "ÖL",
    doctorsPerTenInpatients: 0.5,
    weeklyWorkHours: 40,
    nonContributingPresence: 0,
    adminOtherPresence: 0.4,
    salaryCostPerPresence: 1100000,
  },
  {
    id: "me-bol",
    competenceLevel: "BÖL",
    doctorsPerTenInpatients: 0.7,
    weeklyWorkHours: 40,
    nonContributingPresence: 0,
    adminOtherPresence: 0.3,
    salaryCostPerPresence: 980000,
  },
  {
    id: "me-spec",
    competenceLevel: "SPEC",
    doctorsPerTenInpatients: 1.1,
    weeklyWorkHours: 40,
    nonContributingPresence: 0,
    adminOtherPresence: 0.2,
    salaryCostPerPresence: 900000,
  },
  {
    id: "me-st-leg",
    competenceLevel: "ST/LEG",
    doctorsPerTenInpatients: 0.8,
    weeklyWorkHours: 40,
    nonContributingPresence: 0.2,
    adminOtherPresence: 0.1,
    salaryCostPerPresence: 680000,
  },
  {
    id: "me-ul",
    competenceLevel: "UL",
    doctorsPerTenInpatients: 0.2,
    weeklyWorkHours: 40,
    nonContributingPresence: 0.1,
    adminOtherPresence: 0,
    salaryCostPerPresence: 520000,
  },
];
