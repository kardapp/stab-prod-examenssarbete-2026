import type {
  InpatientCalculatedValues,
  InpatientDimensioningResultRow,
  InpatientMeDimensioningRow,
  InpatientOoDimensioningRow,
  InpatientOoDimensioningSettings,
  InpatientOoDistributionRow,
  InpatientProductionFormState,
  InpatientProductionRow,
} from "../types/inpatient.types";

const DAYS_PER_YEAR = 365;
const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

export function calculateInpatientCareDays(
  careEvents: number,
  averageLengthOfStay: number
): number {
  return toNumber(careEvents) * toNumber(averageLengthOfStay);
}

export function calculateInpatientDrgPoints(
  sllCareEvents: number,
  sllDrgAverage: number,
  uulpCareEvents: number,
  uulpDrgAverage: number
): number {
  return (
    toNumber(sllCareEvents) * toNumber(sllDrgAverage) +
    toNumber(uulpCareEvents) * toNumber(uulpDrgAverage)
  );
}

export function calculateWeightedDrgAverage(
  careEvents: number,
  drgPoints: number
): number {
  if (toNumber(careEvents) <= 0) {
    return 0;
  }

  return toNumber(drgPoints) / toNumber(careEvents);
}

export function calculateAverageCarePlaces(careDays: number): number {
  return toNumber(careDays) / DAYS_PER_YEAR;
}

export function calculateInpatientProductionValues(
  formState: InpatientProductionFormState
): InpatientCalculatedValues {
  const careEvents = toNumber(formState.careEvents);
  const careDays = calculateInpatientCareDays(
    careEvents,
    formState.averageLengthOfStay
  );
  const sllCareEvents = (careEvents * toNumber(formState.sllPercentage)) / 100;
  const uulpCareEvents =
    (careEvents * toNumber(formState.uulpPercentage)) / 100;
  const sllDrgPoints =
    sllCareEvents * toNumber(formState.sllDrgAverage);
  const uulpDrgPoints =
    uulpCareEvents * toNumber(formState.uulpDrgAverage);
  const drgPoints = calculateInpatientDrgPoints(
    sllCareEvents,
    formState.sllDrgAverage,
    uulpCareEvents,
    formState.uulpDrgAverage
  );

  return {
    acuteCareEvents: (careEvents * toNumber(formState.acutePercentage)) / 100,
    electiveCareEvents:
      (careEvents * toNumber(formState.electivePercentage)) / 100,
    sllCareEvents,
    uulpCareEvents,
    careEventsPerDay: careEvents / DAYS_PER_YEAR,
    careDays,
    careDaysPerDay: careDays / DAYS_PER_YEAR,
    averageCarePlaces: calculateAverageCarePlaces(careDays),
    drgPoints,
    drgPointsPerDay: drgPoints / DAYS_PER_YEAR,
    sllDrgPoints,
    uulpDrgPoints,
    weightedDrgAverage: calculateWeightedDrgAverage(careEvents, drgPoints),
  };
}

export function calculateDistributedCareDays(
  careDays: number,
  percentage: number
): number {
  return (toNumber(careDays) * toNumber(percentage)) / 100;
}

export function calculateDistributionPercentage(
  careDays: number,
  distributedCareDays: number
): number {
  if (toNumber(careDays) <= 0) {
    return 0;
  }

  return (toNumber(distributedCareDays) / toNumber(careDays)) * 100;
}

export function calculateOoDimensioningPresence(
  averageCarePlaces: number,
  row: InpatientOoDimensioningRow
): number {
  const weeklyHours =
    toNumber(averageCarePlaces) * toNumber(row.hoursPerCarePlacePerDay) * 7;
  const weeklyWorkHours = toNumber(row.weeklyWorkHours);

  return weeklyWorkHours > 0 ? weeklyHours / weeklyWorkHours : 0;
}

export function calculateOoSupportPresence(
  settings: InpatientOoDimensioningSettings,
  weeklyWorkHours = 40
): number {
  const totalHours =
    toNumber(settings.careSupportHoursPerWeek) +
    toNumber(settings.adminHoursPerWeek) +
    toNumber(settings.trainingHoursPerWeek) +
    toNumber(settings.competenceDevelopmentHoursPerWeek) +
    toNumber(settings.otherHoursPerWeek);

  return weeklyWorkHours > 0 ? totalHours / weeklyWorkHours : 0;
}

export function calculateMeDimensioningPresence(
  averageInpatientsPerDay: number,
  row: InpatientMeDimensioningRow
): number {
  const doctorPresence =
    typeof row.doctorPresence === "undefined"
      ? (toNumber(averageInpatientsPerDay) / 10) *
        toNumber(row.doctorsPerTenInpatients)
      : toNumber(row.doctorPresence);

  return (
    doctorPresence +
    toNumber(row.nonContributingPresence) +
    toNumber(row.adminOtherPresence)
  );
}

export function buildInpatientDimensioningResultRows(params: {
  productionRow: InpatientProductionRow | null;
  distributions: InpatientOoDistributionRow[];
  meRows: InpatientMeDimensioningRow[];
  ooRows: InpatientOoDimensioningRow[];
  ooSettings: InpatientOoDimensioningSettings | null;
}): InpatientDimensioningResultRow[] {
  if (!params.productionRow) {
    return [];
  }

  const productionRow = params.productionRow;
  const careUnit =
    params.distributions.map((row) => row.careProvidingUnit).join(", ") ||
    "Ej fördelad";
  const averageCarePlaces = productionRow.averageCarePlaces;
  const meRows = params.meRows.map((row) => {
    const presence = calculateMeDimensioningPresence(averageCarePlaces, row);

    return {
      id: `me-${row.id}`,
      source: "ME" as const,
      area: "SLV",
      category: row.competenceLevel,
      section: productionRow.section,
      careProvidingUnit: "ME",
      month: "År",
      presence,
      staffingCost: presence * toNumber(row.salaryCostPerPresence),
    };
  });
  const ooRows = params.ooRows.map((row) => {
    const presence = calculateOoDimensioningPresence(averageCarePlaces, row);

    return {
      id: `oo-${row.id}`,
      source: "OO" as const,
      area: "SLV",
      category: row.roleCategory,
      section: productionRow.section,
      careProvidingUnit: careUnit,
      month: "År",
      presence,
      staffingCost: presence * toNumber(row.salaryCostPerPresence),
    };
  });
  const supportPresence = params.ooSettings
    ? calculateOoSupportPresence(params.ooSettings)
    : 0;
  const supportRow =
    params.ooSettings && supportPresence > 0
      ? [
          {
            id: "oo-support-admin",
            source: "OO" as const,
            area: "Admin/övrigt",
            category: "Vårdnära stöd/admin",
            section: productionRow.section,
            careProvidingUnit: careUnit,
            month: "År",
            presence: supportPresence,
            staffingCost: supportPresence * 560000,
          },
        ]
      : [];

  return [...meRows, ...ooRows, ...supportRow];
}

export function buildMonthlyDimensioningRows(
  rows: InpatientDimensioningResultRow[]
): InpatientDimensioningResultRow[] {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Maj",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Dec",
  ];

  return rows.flatMap((row) =>
    months.map((month) => ({
      ...row,
      id: `${row.id}-${month}`,
      month,
      presence: row.presence / MONTHS_PER_YEAR,
      staffingCost: row.staffingCost / MONTHS_PER_YEAR,
    }))
  );
}

export function calculateCostPerValue(cost: number, value: number): number {
  if (toNumber(value) <= 0) {
    return 0;
  }

  return toNumber(cost) / toNumber(value);
}

export function getAnnualCareDaysFromDistributions(
  productionRow: InpatientProductionRow | null,
  distributions: InpatientOoDistributionRow[]
): number {
  if (!productionRow) {
    return 0;
  }

  const distributedCareDays = distributions.reduce(
    (sum, row) => sum + toNumber(row.distributedCareDays),
    0
  );

  return distributedCareDays > 0 ? distributedCareDays : productionRow.careDays;
}

export function toNumber(value: unknown): number {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

export { DAYS_PER_YEAR, WEEKS_PER_YEAR };
