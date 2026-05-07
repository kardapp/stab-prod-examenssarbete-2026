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

export function roundToOneDecimal(value: number): string {
  return value.toFixed(1);
}

export function roundToTwoDecimals(value: number): string {
  return value.toFixed(2);
}

export function roundToWholeNumber(value: number): string {
  return Math.round(value).toString();
}
