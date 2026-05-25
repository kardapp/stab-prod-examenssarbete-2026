import type { OutpatientProductionRow } from "@/types/production";
import { getAnnualVisits } from "@/features/outpatient-production/utils/outpatient-production-calculations";
import type {
  CareType,
  DayCareMethod,
  PeriodizationType,
} from "../types/outpatient-dimensioning.types";
import type {
  DimensioningResultFilters,
  DimensioningResultOptions,
  DimensioningResultRow,
  DimensioningResultSummary,
  SavedMeDimensioningRow,
} from "../types/outpatient-dimensioning-results.types";
import { isDayCareRow, toNumber } from "./outpatient-dimensioning-calculations";

const DEFAULT_WEEKLY_WORK_HOURS = 40;
const WORKING_WEEKS_PER_YEAR = 52;
const NOT_DISTRIBUTED = "Ej fördelat";
const MISSING_VALUE = "Saknas";

export const initialResultFilters: DimensioningResultFilters = {
  periodization: "year",
  section: "",
  roleCategory: "",
  competenceLevel: "",
  careType: "",
};

export function safeDivide(value: number, divisor: number | null | undefined) {
  if (!divisor || divisor <= 0) {
    return 0;
  }

  return value / divisor;
}

export function calculatePresence(
  visits: number,
  averageMinutesPerVisit: number,
  weeklyWorkingMinutes: number
) {
  return safeDivide(
    visits * averageMinutesPerVisit,
    weeklyWorkingMinutes * WORKING_WEEKS_PER_YEAR
  );
}

export function calculateTotalPresence(
  productionPresence: number,
  adminOtherPresence: number,
  nonContributingPresence: number
) {
  return productionPresence + adminOtherPresence + nonContributingPresence;
}

export function calculateStaffingCost(
  totalPresence: number,
  salaryCostPerPresence: number
) {
  return totalPresence * salaryCostPerPresence;
}

export function calculateDrgTotal(visits: number, averageDrg: number) {
  return visits * averageDrg;
}

export function calculateCostPerDrg(staffingCost: number, drgTotal: number) {
  return safeDivide(staffingCost, drgTotal);
}

export function calculateCostPerCareEvent(
  staffingCost: number,
  visits: number
) {
  return safeDivide(staffingCost, visits);
}

export function calculateOutpatientDimensioningResults(
  productionRows: OutpatientProductionRow[],
  dimensioningRows: SavedMeDimensioningRow[]
): DimensioningResultRow[] {
  const basisVisitsByKey = new Map<string, number>();

  productionRows.forEach((row) => {
    const key = createBasisKey(
      row.production_plan_id,
      row.kombika_pf_id,
      getProductionCareType(row)
    );
    basisVisitsByKey.set(
      key,
      (basisVisitsByKey.get(key) ?? 0) + getAnnualVisits(row)
    );
  });

  return dimensioningRows.flatMap((dimensioningRow) => {
    const matchingProductionRows = productionRows.filter(
      (productionRow) =>
        productionRow.production_plan_id ===
          dimensioningRow.production_plan_id &&
        productionRow.kombika_pf_id === dimensioningRow.kombika_pf_id &&
        getProductionCareType(productionRow) === dimensioningRow.care_type
    );
    const basisVisits =
      basisVisitsByKey.get(
        createBasisKey(
          dimensioningRow.production_plan_id,
          dimensioningRow.kombika_pf_id,
          dimensioningRow.care_type
        )
      ) ?? 0;

    return matchingProductionRows.map((productionRow) =>
      calculateYearResultRow(productionRow, dimensioningRow, basisVisits)
    );
  });
}

export function filterDimensioningResultRows(
  rows: DimensioningResultRow[],
  filters: DimensioningResultFilters
): DimensioningResultRow[] {
  return rows.filter((row) => {
    if (filters.section && row.economicSection !== filters.section) {
      return false;
    }

    if (filters.roleCategory && row.roleCategory !== filters.roleCategory) {
      return false;
    }

    if (
      filters.competenceLevel &&
      row.competenceLevel !== filters.competenceLevel
    ) {
      return false;
    }

    if (filters.careType && row.careType !== filters.careType) {
      return false;
    }

    return true;
  });
}

export function groupByPeriod(
  rows: DimensioningResultRow[],
  periodType: PeriodizationType
): DimensioningResultRow[] {
  const rowsByKey = new Map<string, DimensioningResultRow>();

  rows.forEach((row) => {
    const period = formatPeriod(row.sourcePeriod, periodType);
    const key = [
      period,
      row.productionPlanId,
      row.kombikaId,
      row.careType,
      row.roleCategory,
      row.competenceLevel,
      row.economicSection,
      row.careCostCenter,
    ].join("|");
    const existing = rowsByKey.get(key);

    if (!existing) {
      rowsByKey.set(key, { ...row, id: key, period });
      return;
    }

    rowsByKey.set(key, mergeRows(existing, { ...row, period }));
  });

  return Array.from(rowsByKey.values()).sort(compareResultRows);
}

export function calculateDimensioningResultSummary(
  rows: DimensioningResultRow[]
): DimensioningResultSummary {
  const summary = rows.reduce(
    (current, row) => ({
      productionPresence: current.productionPresence + row.productionPresence,
      adminOtherPresence: current.adminOtherPresence + row.adminOtherPresence,
      nonContributingPresence:
        current.nonContributingPresence + row.nonContributingPresence,
      totalPresence: current.totalPresence + row.totalPresence,
      staffingCost: current.staffingCost + row.staffingCost,
      visits: current.visits + row.visits,
      drgTotal: current.drgTotal + row.drgTotal,
      costPerDrg: 0,
      costPerCareEvent: 0,
    }),
    {
      productionPresence: 0,
      adminOtherPresence: 0,
      nonContributingPresence: 0,
      totalPresence: 0,
      staffingCost: 0,
      visits: 0,
      drgTotal: 0,
      costPerDrg: 0,
      costPerCareEvent: 0,
    }
  );

  return {
    ...summary,
    costPerDrg: calculateCostPerDrg(summary.staffingCost, summary.drgTotal),
    costPerCareEvent: calculateCostPerCareEvent(
      summary.staffingCost,
      summary.visits
    ),
  };
}

export function buildDimensioningResultOptions(
  rows: DimensioningResultRow[]
): DimensioningResultOptions {
  return {
    sections: uniqueSorted(rows.map((row) => row.economicSection)),
    roleCategories: uniqueSorted(rows.map((row) => row.roleCategory)),
    competenceLevels: uniqueSorted(rows.map((row) => row.competenceLevel)),
    careTypes: uniqueSorted(rows.map((row) => row.careType)).map((careType) => ({
      value: careType,
      label: careType === "dagvard" ? "Dagvård" : "Mottagning",
    })),
  };
}

function calculateYearResultRow(
  productionRow: OutpatientProductionRow,
  dimensioningRow: SavedMeDimensioningRow,
  basisVisits: number
): DimensioningResultRow {
  const productionShare = toNumber(dimensioningRow.production_share_percentage);
  const productionVisits = getAnnualVisits(productionRow);
  const visits = (productionVisits * productionShare) / 100;
  const basisShare =
    basisVisits > 0 ? safeDivide(productionVisits, basisVisits) : 0;
  const weeklyWorkingMinutes =
    (toNumber(dimensioningRow.weekly_work_hours) || DEFAULT_WEEKLY_WORK_HOURS) *
    60;
  const automaticPresence = calculatePresence(
    visits,
    toNumber(productionRow.average_minutes_per_visit),
    weeklyWorkingMinutes
  );
  const productionPresence = calculateProductionPresence({
    automaticPresence,
    basisShare,
    dimensioningRow,
    visits,
  });
  const adminOtherPresence =
    toNumber(dimensioningRow.admin_other_presence) * basisShare;
  const nonContributingPresence =
    toNumber(dimensioningRow.non_contributing_st_presence) * basisShare;
  const totalPresence = calculateTotalPresence(
    productionPresence,
    adminOtherPresence,
    nonContributingPresence
  );
  const salaryCostPerPresence = toNumber(
    dimensioningRow.salary_cost_per_presence
  );
  const staffingCost = calculateStaffingCost(
    totalPresence,
    salaryCostPerPresence
  );
  const drgTotal = calculateDrgTotal(visits, toNumber(productionRow.drg_average));

  return {
    id: [
      productionRow.id,
      dimensioningRow.id,
      dimensioningRow.competence_level,
    ].join("-"),
    productionPlanId: dimensioningRow.production_plan_id,
    kombikaId: dimensioningRow.kombika_pf_id,
    careType: dimensioningRow.care_type,
    roleCategory: formatRoleCategory(productionRow),
    competenceLevel: dimensioningRow.competence_level,
    economicSection: formatEconomicSection(productionRow),
    careCostCenter: NOT_DISTRIBUTED,
    sourcePeriod: formatProductionYear(productionRow),
    period: formatProductionYear(productionRow),
    productionPresence,
    adminOtherPresence,
    nonContributingPresence,
    totalPresence,
    salaryCostPerPresence,
    staffingCost,
    visits,
    drgTotal,
    costPerDrg: calculateCostPerDrg(staffingCost, drgTotal),
    costPerCareEvent: calculateCostPerCareEvent(staffingCost, visits),
  };
}

function calculateProductionPresence(params: {
  automaticPresence: number;
  basisShare: number;
  dimensioningRow: SavedMeDimensioningRow;
  visits: number;
}) {
  const manualPresence = toNumber(params.dimensioningRow.manual_presence);
  const method = normalizeDayCareMethod(
    params.dimensioningRow.day_care_calculation_method
  );

  if (params.dimensioningRow.care_type === "dagvard") {
    if (method === "manual_presence") {
      return manualPresence * params.basisShare;
    }

    if (method === "key_ratio") {
      return safeDivide(params.visits, toNumber(params.dimensioningRow.key_ratio));
    }

    return params.automaticPresence;
  }

  return manualPresence > 0
    ? manualPresence * params.basisShare
    : params.automaticPresence;
}

function mergeRows(
  existing: DimensioningResultRow,
  row: DimensioningResultRow
): DimensioningResultRow {
  const productionPresence =
    existing.productionPresence + row.productionPresence;
  const adminOtherPresence =
    existing.adminOtherPresence + row.adminOtherPresence;
  const nonContributingPresence =
    existing.nonContributingPresence + row.nonContributingPresence;
  const totalPresence = existing.totalPresence + row.totalPresence;
  const staffingCost = existing.staffingCost + row.staffingCost;
  const visits = existing.visits + row.visits;
  const drgTotal = existing.drgTotal + row.drgTotal;

  return {
    ...existing,
    productionPresence,
    adminOtherPresence,
    nonContributingPresence,
    totalPresence,
    salaryCostPerPresence: safeDivide(staffingCost, totalPresence),
    staffingCost,
    visits,
    drgTotal,
    costPerDrg: calculateCostPerDrg(staffingCost, drgTotal),
    costPerCareEvent: calculateCostPerCareEvent(staffingCost, visits),
  };
}

function formatEconomicSection(row: OutpatientProductionRow): string {
  return [row.kombika_pf_id, row.section ?? row.kombika_pf]
    .filter(Boolean)
    .join(" - ") || MISSING_VALUE;
}

function formatRoleCategory(row: OutpatientProductionRow): string {
  return (
    row.primary_role_category?.trim() ||
    row.secondary_role_category?.trim() ||
    "Läkare"
  );
}

function getProductionCareType(row: OutpatientProductionRow): CareType {
  return isDayCareRow(row) ? "dagvard" : "mottagning";
}

function createBasisKey(
  productionPlanId: number | null,
  kombikaId: string | null,
  careType: CareType
): string {
  return [productionPlanId ?? "", kombikaId ?? "", careType].join("|");
}

function normalizeDayCareMethod(method: string | null): DayCareMethod {
  if (method === "key_ratio" || method === "manual_presence") {
    return method;
  }

  return "calculate_as_outpatient";
}

function formatPeriod(period: string, periodType: PeriodizationType): string {
  if (!period || period === MISSING_VALUE) {
    return MISSING_VALUE;
  }

  if (periodType === "year") {
    return period.slice(0, 4);
  }

  if (periodType === "month") {
    return period.slice(0, 7);
  }

  if (periodType === "week") {
    return formatIsoWeek(period);
  }

  return period;
}

function formatIsoWeek(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return MISSING_VALUE;
  }

  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  return `${date.getUTCFullYear()}-V${String(week).padStart(2, "0")}`;
}

function formatProductionYear(row: OutpatientProductionRow): string {
  if (row.production_plan_year) {
    return String(row.production_plan_year);
  }

  return row.period_value ?? MISSING_VALUE;
}

function compareResultRows(
  first: DimensioningResultRow,
  second: DimensioningResultRow
): number {
  return (
    first.period.localeCompare(second.period, "sv") ||
    first.economicSection.localeCompare(second.economicSection, "sv") ||
    first.roleCategory.localeCompare(second.roleCategory, "sv") ||
    first.competenceLevel.localeCompare(second.competenceLevel, "sv")
  );
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((first, second) =>
    first.localeCompare(second, "sv")
  );
}
