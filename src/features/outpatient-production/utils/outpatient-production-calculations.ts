import type {
  DimensioningInputSummary,
  OutpatientProductionRow,
} from "@/types/production";
import type {
  OutpatientProductionCalculatedValues,
  OutpatientProductionFormState,
} from "../types/outpatient-production.types";

export const WEEKLY_WORKING_MINUTES = 40 * 60;
export const WORKING_WEEKS_PER_YEAR = 52;

export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  return Number(value);
}

export function calculatePercentageValue(
  totalValue: number,
  percentage: number
): number {
  return (totalValue * percentage) / 100;
}

export function calculateAcuteVolume(
  annualVolume: number,
  acutePercentage: number
): number {
  return calculatePercentageValue(annualVolume, acutePercentage);
}

export function calculateElectiveVolume(
  annualVolume: number,
  electivePercentage: number
): number {
  return calculatePercentageValue(annualVolume, electivePercentage);
}

export function calculateSllVolume(
  annualVolume: number,
  sllPercentage: number
): number {
  return calculatePercentageValue(annualVolume, sllPercentage);
}

export function calculateUulpVolume(
  annualVolume: number,
  uulpPercentage: number
): number {
  return calculatePercentageValue(annualVolume, uulpPercentage);
}

export function calculateTotalVisitMinutes(
  visits: number,
  averageMinutesPerVisit: number
): number {
  return visits * averageMinutesPerVisit;
}

export function calculateAnnualVolumeFromVisits(
  visits: number,
  periodType: string
): number {
  if (periodType === "week") {
    return visits * 52;
  }

  return visits;
}

export function calculateDrgPoints(
  visits: number,
  drgAverage: number
): number {
  return visits * drgAverage;
}

export function calculatePresenceNeed(
  totalMinutes: number,
  weeklyWorkingMinutes = WEEKLY_WORKING_MINUTES
): number {
  if (weeklyWorkingMinutes <= 0) {
    return 0;
  }

  return totalMinutes / (weeklyWorkingMinutes * WORKING_WEEKS_PER_YEAR);
}

export function calculateWeeklyAverage(annualVolume: number): number {
  return annualVolume / 52;
}

export function calculateTotalDrgPoints(params: {
  annualVolume: number;
  sllPercentage: number;
  uulpPercentage: number;
  drgAverageSll: number;
  drgAverageUulp: number;
}): number {
  const sllVolume = calculateSllVolume(
    params.annualVolume,
    params.sllPercentage
  );
  const uulpVolume = calculateUulpVolume(
    params.annualVolume,
    params.uulpPercentage
  );

  return (
    calculateDrgPoints(sllVolume, params.drgAverageSll) +
    calculateDrgPoints(uulpVolume, params.drgAverageUulp)
  );
}

export function calculateOutpatientProductionValues(
  formState: OutpatientProductionFormState
): OutpatientProductionCalculatedValues {
  const totalCareEvents = toNumber(formState.careEvents);
  const sllCareEvents = calculatePercentageValue(
    totalCareEvents,
    toNumber(formState.sllPercentage)
  );
  const uulpCareEvents = calculatePercentageValue(
    totalCareEvents,
    toNumber(formState.uulpPercentage)
  );
  const acuteCareEvents = calculatePercentageValue(
    totalCareEvents,
    toNumber(formState.acutePercentage)
  );
  const electiveCareEvents = calculatePercentageValue(
    totalCareEvents,
    toNumber(formState.electivePercentage)
  );
  const drgSll = calculateDrgPoints(
    sllCareEvents,
    toNumber(formState.drgAverage.sll)
  );
  const drgUulp = calculateDrgPoints(
    uulpCareEvents,
    toNumber(formState.drgAverage.uulp)
  );

  return {
    sllCareEvents,
    uulpCareEvents,
    acuteCareEvents,
    electiveCareEvents,
    roleDistributionResults: formState.roleDistributions.map((role) => ({
      id: role.id,
      label: formatRoleDistributionLabel(
        role.primaryRole,
        role.secondaryRole
      ),
      percentage: toNumber(role.percentage),
      careEvents: calculatePercentageValue(
        totalCareEvents,
        toNumber(role.percentage)
      ),
    })),
    totalVisitMinutes: calculateTotalVisitMinutes(
      totalCareEvents,
      toNumber(formState.visitTime.averageMinutes)
    ),
    drgSll,
    drgUulp,
    totalDrg: drgSll + drgUulp,
  };
}

export function formatRoleDistributionLabel(
  primaryRole: string,
  secondaryRole?: string
): string {
  return secondaryRole ? `${primaryRole} + ${secondaryRole}` : primaryRole;
}

export function calculateProductionRowMetrics(row: OutpatientProductionRow) {
  const visits = getAnnualVisits(row);
  const averageMinutes = toNumber(row.average_minutes_per_visit);
  const drgAverage = toNumber(row.drg_average);

  return {
    totalVisitMinutes: calculateTotalVisitMinutes(visits, averageMinutes),
    drgPoints: calculateDrgPoints(visits, drgAverage),
  };
}

export function sumRows(
  rows: OutpatientProductionRow[],
  key: keyof OutpatientProductionRow
): number {
  return rows.reduce((sum, row) => sum + toNumber(row[key]), 0);
}

export function sumVisitMinutes(rows: OutpatientProductionRow[]): number {
  return rows.reduce(
    (sum, row) => sum + calculateProductionRowMetrics(row).totalVisitMinutes,
    0
  );
}

export function getAnnualVisits(row: OutpatientProductionRow): number {
  const visits = toNumber(row.visits);
  const annualVolume = toNumber(row.annual_volume);

  if (row.period_type && row.period_type !== "year" && annualVolume > 0) {
    return annualVolume;
  }

  return visits;
}

export function calculateProductionSupportValues(
  rows: OutpatientProductionRow[]
) {
  const totalVisitMinutes = sumVisitMinutes(rows);
  const totalDrgPoints = rows.reduce(
    (sum, row) => sum + calculateProductionRowMetrics(row).drgPoints,
    0
  );

  return {
    totalVisitMinutes,
    totalDrgPoints,
    presenceNeed: calculatePresenceNeed(totalVisitMinutes),
  };
}

export function mapProductionRowsToDimensioningInput(
  rows: OutpatientProductionRow[]
): DimensioningInputSummary[] {
  const summaries = new Map<string, DimensioningInputSummary>();

  rows.forEach((row) => {
    const roleCategory = row.primary_role_category ?? "Ej angiven";
    const visits = getAnnualVisits(row);
    const totalMinutes = calculateProductionRowMetrics(row).totalVisitMinutes;
    const existing = summaries.get(roleCategory) ?? {
      roleCategory,
      totalVisits: 0,
      totalMinutes: 0,
      presenceNeed: 0,
    };
    const nextTotalMinutes = existing.totalMinutes + totalMinutes;

    summaries.set(roleCategory, {
      roleCategory,
      totalVisits: existing.totalVisits + visits,
      totalMinutes: nextTotalMinutes,
      presenceNeed: calculatePresenceNeed(nextTotalMinutes),
    });
  });

  return Array.from(summaries.values());
}
