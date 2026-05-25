import type { OutpatientProductionRow } from "@/types/production";
import {
  formatRoleDistributionLabel,
  getAnnualVisits,
  toNumber,
} from "@/features/outpatient-production/utils/outpatient-production-calculations";
import type { SavedOoDistributionRow } from "@/features/outpatient-production/types/outpatient-oo-distribution.types";
import type {
  OoAdminOtherTimeState,
  OoCareSupportRow,
  OoDimensioningBasis,
  OoDimensioningPeriodView,
  OoDimensioningProductionRow,
  OoDimensioningSettings,
  OoDimensioningSummary,
  WeekdayField,
} from "./types";

export const WEEKS_PER_YEAR = 52;
export const DEFAULT_WEEKLY_WORKING_HOURS = 40;
export const DEFAULT_SALARY_COST_PER_PRESENCE = 650000;

export const weekdayFields: Array<{
  field: WeekdayField;
  label: string;
  shortLabel: string;
}> = [
  { field: "mondayVisits", label: "Måndag", shortLabel: "Mån" },
  { field: "tuesdayVisits", label: "Tisdag", shortLabel: "Tis" },
  { field: "wednesdayVisits", label: "Onsdag", shortLabel: "Ons" },
  { field: "thursdayVisits", label: "Torsdag", shortLabel: "Tor" },
  { field: "fridayVisits", label: "Fredag", shortLabel: "Fre" },
  { field: "saturdayVisits", label: "Lördag", shortLabel: "Lör" },
  { field: "sundayVisits", label: "Söndag", shortLabel: "Sön" },
];

const monthNames = [
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

export function buildOoProductionRows(
  productionRows: OutpatientProductionRow[],
  distributions: SavedOoDistributionRow[]
): OoDimensioningProductionRow[] {
  const distributionsByProductionRowId = new Map<
    number,
    SavedOoDistributionRow[]
  >();

  distributions.forEach((distribution) => {
    const currentRows =
      distributionsByProductionRowId.get(distribution.production_row_id) ?? [];
    distributionsByProductionRowId.set(distribution.production_row_id, [
      ...currentRows,
      distribution,
    ]);
  });

  return productionRows.flatMap((productionRow) => {
    const matchingDistributions =
      distributionsByProductionRowId.get(productionRow.id) ?? [];

    if (matchingDistributions.length === 0) {
      return [createOoProductionRow(productionRow, null)];
    }

    return matchingDistributions.map((distribution) =>
      createOoProductionRow(productionRow, distribution)
    );
  });
}

export function calculateProductionHours(
  visits: number,
  averageMinutesPerVisit: number
) {
  return (visits * averageMinutesPerVisit) / 60;
}

export function calculateTotalHours(params: {
  productionHours: number;
  careSupportHours: number;
  adminHours: number;
  trainingHours: number;
  competenceDevelopmentHours: number;
  otherHours: number;
}) {
  return (
    params.productionHours +
    params.careSupportHours +
    params.adminHours +
    params.trainingHours +
    params.competenceDevelopmentHours +
    params.otherHours
  );
}

export function calculateProductionPresence(
  totalHours: number,
  weeklyWorkingHours: number
) {
  if (weeklyWorkingHours <= 0) {
    return 0;
  }

  return totalHours / weeklyWorkingHours;
}

export function calculateStaffingCost(
  salaryCostPerPresence: number,
  productionPresence: number
) {
  return salaryCostPerPresence * productionPresence;
}

export function calculateOoDimensioningSummary(params: {
  productionRows: OoDimensioningProductionRow[];
  careSupportRows: OoCareSupportRow[];
  adminOtherTime: OoAdminOtherTimeState;
  settings: OoDimensioningSettings;
}): OoDimensioningSummary {
  const weeklyVisits = params.productionRows.reduce(
    (sum, row) => sum + calculateWeeklyVisits(row),
    0
  );
  const supportVisits = params.productionRows.reduce(
    (sum, row) => sum + toNumber(row.supportVisitsForOtherRoles),
    0
  );
  const productionHours = params.productionRows.reduce(
    (sum, row) =>
      sum +
      calculateProductionHours(
        calculateWeeklyVisits(row) + toNumber(row.supportVisitsForOtherRoles),
        toNumber(row.averageMinutesPerVisit)
      ),
    0
  );
  const careSupportHours = params.careSupportRows.reduce(
    (sum, row) => sum + toNumber(row.careSupportHoursPerWeek),
    0
  );
  const adminHours = toNumber(params.adminOtherTime.adminHoursPerWeek);
  const trainingHours = toNumber(params.adminOtherTime.trainingHoursPerWeek);
  const competenceDevelopmentHours = toNumber(
    params.adminOtherTime.competenceDevelopmentHoursPerWeek
  );
  const otherHours = toNumber(params.adminOtherTime.otherHoursPerWeek);
  const totalHours = calculateTotalHours({
    productionHours,
    careSupportHours,
    adminHours,
    trainingHours,
    competenceDevelopmentHours,
    otherHours,
  });
  const productionPresence = calculateProductionPresence(
    totalHours,
    toNumber(params.settings.weeklyWorkingHours)
  );

  return {
    weeklyVisits,
    supportVisits,
    productionHours,
    careSupportHours,
    adminHours,
    trainingHours,
    competenceDevelopmentHours,
    otherHours,
    totalHours,
    productionPresence,
    staffingCost: calculateStaffingCost(
      toNumber(params.settings.salaryCostPerPresence),
      productionPresence
    ),
  };
}

export function calculateOoDimensioningBasis(
  rows: OoDimensioningProductionRow[]
): OoDimensioningBasis {
  const totalAnnualVisits = rows.reduce(
    (sum, row) => sum + row.visitsFromProductionPlan,
    0
  );
  const totalWeeklyVisits = rows.reduce(
    (sum, row) => sum + calculateWeeklyVisits(row),
    0
  );
  const weightedMinutes = rows.reduce(
    (sum, row) =>
      sum + row.visitsFromProductionPlan * row.sourceAverageMinutesPerVisit,
    0
  );

  return {
    economicKombika: uniqueTexts(rows.map((row) => row.economicKombika)).join(
      ", "
    ),
    careUnits: uniqueTexts(rows.map((row) => row.careUnit)),
    year: "",
    roleCategories: uniqueTexts(rows.map((row) => row.roleCategory)),
    totalAnnualVisits,
    totalWeeklyVisits,
    averageMinutesPerVisit:
      totalAnnualVisits > 0 ? weightedMinutes / totalAnnualVisits : 0,
  };
}

export function calculateWeeklyVisits(row: OoDimensioningProductionRow) {
  return weekdayFields.reduce((sum, item) => sum + toNumber(row[item.field]), 0);
}

export function buildPeriodizedRows(params: {
  view: OoDimensioningPeriodView;
  summary: OoDimensioningSummary;
  productionRows: OoDimensioningProductionRow[];
  weeklyWorkingHours: number;
}) {
  if (params.view === "day") {
    const dailyWorkHours = params.weeklyWorkingHours / 5;

    return weekdayFields.map((weekday) => {
      const visits = params.productionRows.reduce(
        (sum, row) => sum + toNumber(row[weekday.field]),
        0
      );
      const hours = params.productionRows.reduce(
        (sum, row) =>
          sum +
          calculateProductionHours(
            toNumber(row[weekday.field]),
            toNumber(row.averageMinutesPerVisit)
          ),
        0
      );

      return {
        id: weekday.field,
        label: weekday.label,
        visits,
        hours,
        presence: calculateProductionPresence(hours, dailyWorkHours),
      };
    });
  }

  if (params.view === "month") {
    return monthNames.map((month, index) => {
      const weeks = WEEKS_PER_YEAR / monthNames.length;
      const hours = params.summary.totalHours * weeks;

      return {
        id: month,
        label: month,
        visits: params.summary.weeklyVisits * weeks,
        hours,
        presence: params.summary.productionPresence,
        order: index,
      };
    });
  }

  return Array.from({ length: WEEKS_PER_YEAR }, (_, index) => ({
    id: `week-${index + 1}`,
    label: `v.${index + 1}`,
    visits: params.summary.weeklyVisits,
    hours: params.summary.totalHours,
    presence: params.summary.productionPresence,
    order: index,
  }));
}

export function calculateSalaryCostPerPresence(
  productionRows: OutpatientProductionRow[]
) {
  const values = productionRows
    .map((row) => ({
      value: toNumber(row.r12_salary_cost_per_presence),
      weight: getAnnualVisits(row),
    }))
    .filter((row) => row.value > 0);
  const weightSum = values.reduce((sum, row) => sum + row.weight, 0);

  if (values.length === 0) {
    return DEFAULT_SALARY_COST_PER_PRESENCE;
  }

  if (weightSum <= 0) {
    return values.reduce((sum, row) => sum + row.value, 0) / values.length;
  }

  return (
    values.reduce((sum, row) => sum + row.value * row.weight, 0) / weightSum
  );
}

function createOoProductionRow(
  productionRow: OutpatientProductionRow,
  distribution: SavedOoDistributionRow | null
): OoDimensioningProductionRow {
  const annualVisits = getAnnualVisits(productionRow);
  const distributedVisits = distribution
    ? (annualVisits * toNumber(distribution.distribution_percentage)) / 100
    : annualVisits;
  const averageMinutesPerVisit = toNumber(productionRow.average_minutes_per_visit);
  const weeklyVisits = distributedVisits / WEEKS_PER_YEAR;
  const weekdayVisitShare = weeklyVisits / 5;

  return {
    id: distribution
      ? `${productionRow.id}-${distribution.id}`
      : `${productionRow.id}-not-distributed`,
    productionRowId: productionRow.id,
    distributionId: distribution?.id ?? null,
    roleCategory: formatRoleDistributionLabel(
      productionRow.primary_role_category ?? "Ej angiven",
      productionRow.secondary_role_category ?? undefined
    ),
    economicKombika: [productionRow.kombika_pf_id, productionRow.kombika_pf]
      .filter(Boolean)
      .join(" - "),
    careUnit: distribution?.care_unit ?? "Ej fördelad",
    visitsFromProductionPlan: distributedVisits,
    supportVisitsForOtherRoles: 0,
    averageMinutesPerVisit,
    sourceAverageMinutesPerVisit: averageMinutesPerVisit,
    mondayVisits: weekdayVisitShare,
    tuesdayVisits: weekdayVisitShare,
    wednesdayVisits: weekdayVisitShare,
    thursdayVisits: weekdayVisitShare,
    fridayVisits: weekdayVisitShare,
    saturdayVisits: 0,
    sundayVisits: 0,
  };
}

function uniqueTexts(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((first, second) =>
    first.localeCompare(second, "sv")
  );
}
