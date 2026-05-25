import type { OutpatientProductionRow } from "@/types/production";
import type { SavedOoDistributionRow } from "../types/outpatient-oo-distribution.types";
import type { ComparisonValues } from "../types/outpatient-production.types";
import type {
  DrgResultRow,
  ProductionPlanningComparisonRow,
  ProductionPlanningPeriodization,
  ProductionPlanningResultRow,
  ProductionPlanningResultSummary,
} from "../types/outpatient-production-results.types";
import {
  calculateDrgPoints,
  calculateTotalVisitMinutes,
  formatRoleDistributionLabel,
  getAnnualVisits,
  toNumber,
} from "./outpatient-production-calculations";

const NOT_DISTRIBUTED = "Ej fördelad";
const MISSING_VALUE = "Saknas";
const WEEKS_PER_YEAR = 52;
const WORKING_DAYS_PER_YEAR = 260;

export function calculateProductionPlanningResultRows(
  productionRows: OutpatientProductionRow[],
  ooDistributions: SavedOoDistributionRow[]
): ProductionPlanningResultRow[] {
  const distributionsByProductionRowId = groupDistributionsByProductionRowId(
    ooDistributions
  );

  return productionRows
    .flatMap((productionRow) => {
      const distributions =
        distributionsByProductionRowId.get(productionRow.id) ?? [];

      if (distributions.length === 0) {
        return [createResultRow(productionRow, null)];
      }

      return distributions.map((distribution) =>
        createResultRow(productionRow, distribution)
      );
    })
    .sort(compareResultRows);
}

export function periodizeProductionPlanningResultRows(
  rows: ProductionPlanningResultRow[],
  periodization: ProductionPlanningPeriodization
): ProductionPlanningResultRow[] {
  const factor = getPeriodizationFactor(periodization);

  return rows.map((row) => {
    const visits = row.visits * factor;
    const totalVisitMinutes = row.totalVisitMinutes * factor;
    const drgPoints = row.drgPoints * factor;

    return {
      ...row,
      id: `${row.id}-${periodization}`,
      visits,
      totalVisitMinutes,
      averageMinutesPerVisit: safeDivide(totalVisitMinutes, visits),
      drgPoints,
      drgAverage: safeDivide(drgPoints, visits),
    };
  });
}

export function groupVisitsAndVisitTimeRows(
  rows: ProductionPlanningResultRow[]
): ProductionPlanningResultRow[] {
  const rowsByKey = new Map<string, ProductionPlanningResultRow>();

  rows.forEach((row) => {
    const key = [
      row.economicKombikaId,
      row.economicKombikaName,
      row.economicSection,
      row.careUnitId,
      row.careUnitName,
      row.year,
      row.roleCategory,
    ].join("|");
    const existing = rowsByKey.get(key);

    if (!existing) {
      rowsByKey.set(key, { ...row, id: key });
      return;
    }

    const visits = existing.visits + row.visits;
    const totalVisitMinutes = existing.totalVisitMinutes + row.totalVisitMinutes;
    const drgPoints = existing.drgPoints + row.drgPoints;

    rowsByKey.set(key, {
      ...existing,
      visits,
      totalVisitMinutes,
      averageMinutesPerVisit: safeDivide(totalVisitMinutes, visits),
      drgPoints,
      drgAverage: safeDivide(drgPoints, visits),
      isOoDistributed: existing.isOoDistributed && row.isOoDistributed,
    });
  });

  return Array.from(rowsByKey.values()).sort(compareResultRows);
}

export function calculateDrgRows(
  rows: ProductionPlanningResultRow[]
): DrgResultRow[] {
  const rowsByKey = new Map<string, DrgResultRow>();

  rows.forEach((row) => {
    const key = [row.economicKombikaId, row.economicKombikaName, row.year].join(
      "|"
    );
    const existing = rowsByKey.get(key);

    if (!existing) {
      rowsByKey.set(key, {
        id: key,
        economicKombikaId: row.economicKombikaId,
        economicKombikaName: row.economicKombikaName,
        year: row.year,
        visits: row.visits,
        drgPoints: row.drgPoints,
      });
      return;
    }

    rowsByKey.set(key, {
      ...existing,
      visits: existing.visits + row.visits,
      drgPoints: existing.drgPoints + row.drgPoints,
    });
  });

  return Array.from(rowsByKey.values()).sort(
    (first, second) =>
      first.year.localeCompare(second.year, "sv") ||
      formatDrgEconomicUnit(first).localeCompare(
        formatDrgEconomicUnit(second),
        "sv"
      )
  );
}

export function calculateProductionPlanningResultSummary(
  rows: ProductionPlanningResultRow[]
): ProductionPlanningResultSummary {
  const productionRowIds = new Set<number>();

  return rows.reduce(
    (summary, row) => {
      if (!row.isOoDistributed) {
        productionRowIds.add(row.productionRowId);
      }

      return {
        visits: summary.visits + row.visits,
        totalVisitMinutes: summary.totalVisitMinutes + row.totalVisitMinutes,
        drgPoints: summary.drgPoints + row.drgPoints,
        undistributedRows: productionRowIds.size,
      };
    },
    {
      visits: 0,
      totalVisitMinutes: 0,
      drgPoints: 0,
      undistributedRows: 0,
    }
  );
}

export function calculateProductionPlanningComparisonRows(
  productionRows: OutpatientProductionRow[],
  mockComparisonValues: Record<string, ComparisonValues> = {}
): ProductionPlanningComparisonRow[] {
  const rowsByKey = new Map<string, ProductionPlanningComparisonRow>();

  productionRows.forEach((row) => {
    const currentVisits = getAnnualVisits(row);
    const key = [
      row.production_plan_id ?? "",
      row.kombika_pf_id ?? "",
      formatProductionYear(row),
    ].join("|");
    const existing = rowsByKey.get(key);
    const mockComparison = row.kombika_pf_id
      ? mockComparisonValues[row.kombika_pf_id]
      : undefined;
    const previousYearVisits = getPreviousYearComparison(row, mockComparison);

    if (!existing) {
      rowsByKey.set(key, {
        id: key,
        economicKombikaId: row.kombika_pf_id ?? "",
        economicKombikaName: row.kombika_pf ?? MISSING_VALUE,
        year: formatProductionYear(row),
        currentVisits,
        previousYearVisits,
        difference: currentVisits - previousYearVisits,
        percentageDifference: calculatePercentageDifference(
          currentVisits,
          previousYearVisits
        ),
        source:
          row.comparison_source ??
          (mockComparison ? "Mockdata föregående år" : "Saknas"),
      });
      return;
    }

    const nextCurrentVisits = existing.currentVisits + currentVisits;
    const nextPreviousYearVisits =
      existing.previousYearVisits || previousYearVisits;

    rowsByKey.set(key, {
      ...existing,
      currentVisits: nextCurrentVisits,
      previousYearVisits: nextPreviousYearVisits,
      difference: nextCurrentVisits - nextPreviousYearVisits,
      percentageDifference: calculatePercentageDifference(
        nextCurrentVisits,
        nextPreviousYearVisits
      ),
      source:
        existing.source ||
        row.comparison_source ||
        (mockComparison ? "Mockdata föregående år" : "Saknas"),
    });
  });

  return Array.from(rowsByKey.values()).sort(
    (first, second) =>
      first.year.localeCompare(second.year, "sv") ||
      formatComparisonEconomicUnit(first).localeCompare(
        formatComparisonEconomicUnit(second),
        "sv"
      )
  );
}

export function formatEconomicUnit(row: ProductionPlanningResultRow): string {
  return [row.economicKombikaId, row.economicKombikaName]
    .filter(Boolean)
    .join(" - ");
}

export function formatCareUnit(row: ProductionPlanningResultRow): string {
  return row.careUnitName;
}

export function formatDrgEconomicUnit(row: DrgResultRow): string {
  return [row.economicKombikaId, row.economicKombikaName]
    .filter(Boolean)
    .join(" - ");
}

export function formatComparisonEconomicUnit(
  row: ProductionPlanningComparisonRow
): string {
  return [row.economicKombikaId, row.economicKombikaName]
    .filter(Boolean)
    .join(" - ");
}

function createResultRow(
  productionRow: OutpatientProductionRow,
  distribution: SavedOoDistributionRow | null
): ProductionPlanningResultRow {
  const productionVisits = getAnnualVisits(productionRow);
  const visits = distribution
    ? (productionVisits * toNumber(distribution.distribution_percentage)) / 100
    : productionVisits;
  const averageMinutesPerVisit = toNumber(
    productionRow.average_minutes_per_visit
  );
  const drgAverage = toNumber(productionRow.drg_average);
  const totalVisitMinutes = calculateTotalVisitMinutes(
    visits,
    averageMinutesPerVisit
  );

  return {
    id: distribution
      ? `${productionRow.id}-${distribution.id}`
      : `${productionRow.id}-undistributed`,
    productionRowId: productionRow.id,
    economicKombikaId: productionRow.kombika_pf_id ?? "",
    economicKombikaName: productionRow.kombika_pf ?? MISSING_VALUE,
    economicSection: productionRow.section ?? MISSING_VALUE,
    careUnitId: distribution?.care_unit_id ?? "",
    careUnitName: distribution?.care_unit ?? NOT_DISTRIBUTED,
    year: formatProductionYear(productionRow),
    roleCategory: formatRoleDistributionLabel(
      productionRow.primary_role_category ?? MISSING_VALUE,
      productionRow.secondary_role_category ?? undefined
    ),
    visits,
    averageMinutesPerVisit,
    totalVisitMinutes,
    drgAverage,
    drgPoints: calculateDrgPoints(visits, drgAverage),
    isOoDistributed: Boolean(distribution),
  };
}

function groupDistributionsByProductionRowId(
  distributions: SavedOoDistributionRow[]
): Map<number, SavedOoDistributionRow[]> {
  const rowsById = new Map<number, SavedOoDistributionRow[]>();

  distributions.forEach((distribution) => {
    const rows = rowsById.get(distribution.production_row_id) ?? [];
    rowsById.set(distribution.production_row_id, [...rows, distribution]);
  });

  return rowsById;
}

function compareResultRows(
  first: ProductionPlanningResultRow,
  second: ProductionPlanningResultRow
): number {
  return (
    first.year.localeCompare(second.year, "sv") ||
    formatEconomicUnit(first).localeCompare(formatEconomicUnit(second), "sv") ||
    formatCareUnit(first).localeCompare(formatCareUnit(second), "sv") ||
    first.roleCategory.localeCompare(second.roleCategory, "sv")
  );
}

function safeDivide(value: number, divisor: number) {
  if (divisor <= 0) {
    return 0;
  }

  return value / divisor;
}

function calculatePercentageDifference(
  currentValue: number,
  previousValue: number
): number | null {
  if (previousValue <= 0) {
    return null;
  }

  return ((currentValue - previousValue) / previousValue) * 100;
}

function getPreviousYearComparison(
  row: OutpatientProductionRow,
  mockComparison?: ComparisonValues
): number {
  const previousYearOutcome = toNumber(row.previous_year_outcome);

  if (previousYearOutcome > 0) {
    return previousYearOutcome;
  }

  const r12Outcome = toNumber(row.r12_outcome);

  if (r12Outcome > 0) {
    return r12Outcome;
  }

  const previousYearPlan = toNumber(row.previous_year_plan);

  if (previousYearPlan > 0) {
    return previousYearPlan;
  }

  return mockComparison?.previousYearOutcome ?? 0;
}

function getPeriodizationFactor(
  periodization: ProductionPlanningPeriodization
): number {
  if (periodization === "week") {
    return 1 / WEEKS_PER_YEAR;
  }

  if (periodization === "day") {
    return 1 / WORKING_DAYS_PER_YEAR;
  }

  return 1;
}

function formatProductionYear(row: OutpatientProductionRow): string {
  if (row.production_plan_year) {
    return String(row.production_plan_year);
  }

  return row.period_value ?? MISSING_VALUE;
}
