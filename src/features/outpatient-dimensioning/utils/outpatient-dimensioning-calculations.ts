import type { OutpatientProductionRow } from "@/types/production";
import type {
  AssumptionState,
  CompetenceLevelCalculation,
  CompetenceState,
  DimensioningValues,
} from "../types/outpatient-dimensioning.types";

export const DEFAULT_WEEKLY_WORKING_HOURS = 40;

export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  return Number(value);
}

export function calculateWeeklyWorkingMinutes(
  weeklyWorkingHours: number
): number {
  return weeklyWorkingHours * 60;
}

export function calculateTotalVisitMinutes(
  visits: number,
  averageMinutesPerVisit: number
): number {
  return visits * averageMinutesPerVisit;
}

export function calculateProductionPresence(
  totalVisitMinutes: number,
  weeklyWorkingHours: number
): number {
  const weeklyWorkingMinutes = calculateWeeklyWorkingMinutes(weeklyWorkingHours);

  if (weeklyWorkingMinutes <= 0) {
    return 0;
  }

  return totalVisitMinutes / weeklyWorkingMinutes;
}

export function calculateAdminPresence(
  adminHoursPerWeek: number,
  weeklyWorkingHours: number
): number {
  return calculateProductionPresence(
    adminHoursPerWeek * 60,
    weeklyWorkingHours
  );
}

export function calculateTotalPresence(params: {
  productionPresence: number;
  adminPresence: number;
  otherPresence?: number;
}): number {
  return (
    params.productionPresence +
    params.adminPresence +
    (params.otherPresence ?? 0)
  );
}

export function calculateStaffingCost(
  totalPresence: number,
  salaryCostPerPresence: number
): number {
  return totalPresence * salaryCostPerPresence;
}

export function calculateCompetencePresence(
  productionPresence: number,
  percentage: number
): number {
  return calculatePercentageShare(productionPresence, percentage);
}

export function calculatePercentageShare(
  totalValue: number,
  percentage: number
): number {
  return (totalValue * percentage) / 100;
}

export function sumPercentages(percentages: number[]): number {
  return percentages.reduce((sum, percentage) => sum + percentage, 0);
}

export function sumVisitMinutes(rows: OutpatientProductionRow[]): number {
  return rows.reduce(
    (sum, row) =>
      sum +
      calculateTotalVisitMinutes(
        toNumber(row.visits),
        toNumber(row.average_minutes_per_visit)
      ),
    0
  );
}

export function isDayCareRow(row: OutpatientProductionRow): boolean {
  return row.kombika_pf?.toLowerCase().includes("dagvård") ?? false;
}

export function calculateDimensioningValues(
  rows: OutpatientProductionRow[],
  assumptions: AssumptionState,
  competenceLevels: CompetenceState[]
): DimensioningValues {
  const weeklyWorkingHours = toNumber(assumptions.weeklyWorkingHours);
  const manualDayCarePresence = toNumber(assumptions.manualDayCarePresence);
  const outpatientRows = rows.filter((row) => !isDayCareRow(row));
  const dayCareRows = rows.filter(isDayCareRow);
  const outpatientVisitMinutes = sumVisitMinutes(outpatientRows);
  const dayCareVisitMinutes = sumVisitMinutes(dayCareRows);
  const totalVisitMinutes = outpatientVisitMinutes + dayCareVisitMinutes;
  const currentYearPlan = rows.reduce(
    (sum, row) => sum + toNumber(row.visits),
    0
  );
  const outpatientPresence = calculateProductionPresence(
    outpatientVisitMinutes,
    weeklyWorkingHours
  );
  const dayCarePresence =
    assumptions.dayCareMethod === "manual_presence"
      ? manualDayCarePresence
      : calculateProductionPresence(dayCareVisitMinutes, weeklyWorkingHours);
  const productionPresence = outpatientPresence + dayCarePresence;
  const competencePercentageSum = sumPercentages(
    competenceLevels.map((item) => toNumber(item.percentage))
  );

  return {
    totalVisitMinutes,
    currentYearPlan,
    productionPresence,
    r12Outcome: rows.reduce((sum, row) => sum + toNumber(row.r12_outcome), 0),
    previousYearOutcome: rows.reduce(
      (sum, row) => sum + toNumber(row.previous_year_outcome),
      0
    ),
    previousDimensioningPresence: rows.reduce(
      (sum, row) => sum + toNumber(row.previous_dimensioning_presence),
      0
    ),
    competencePercentageSum,
    hasInvalidCompetenceSplit: competencePercentageSum !== 100,
  };
}

export function calculateCompetenceLevelRows(params: {
  competenceLevels: CompetenceState[];
  totalVisitMinutes: number;
  productionPresence: number;
}): CompetenceLevelCalculation[] {
  return params.competenceLevels.map((item) => {
    const percentage = toNumber(item.percentage);

    return {
      level: item.level,
      percentage: item.percentage,
      visitMinutes: calculatePercentageShare(
        params.totalVisitMinutes,
        percentage
      ),
      presence: calculateCompetencePresence(
        params.productionPresence,
        percentage
      ),
    };
  });
}
