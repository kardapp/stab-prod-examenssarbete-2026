import type { OutpatientProductionRow } from "@/types/production";
import type {
  CareType,
  DayCareMethod,
  DimensioneringSummary,
  DimensioningRowCalculation,
  DimensioningRowState,
  ProductionBasisSummary,
} from "../types/outpatient-dimensioning.types";

export const DEFAULT_WEEKLY_WORK_HOURS = 40;

export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function calculateTotalVisitMinutes(
  visits: number,
  averageMinutesPerVisit: number
): number {
  return visits * averageMinutesPerVisit;
}

export function calculateWeeklyWorkMinutes(weeklyWorkHours: number): number {
  return weeklyWorkHours * 60;
}

export function calculatePresenceNeed(
  totalVisitMinutes: number,
  weeklyWorkHours: number
): number {
  const weeklyWorkMinutes = calculateWeeklyWorkMinutes(weeklyWorkHours);

  if (weeklyWorkMinutes <= 0) {
    return 0;
  }

  return totalVisitMinutes / weeklyWorkMinutes;
}

export function calculateDayCarePresenceNeed(params: {
  method: DayCareMethod;
  visits: number;
  totalVisitMinutes: number;
  weeklyWorkHours: number;
  keyRatio: number;
  manualPresence: number;
}): number {
  if (params.method === "manual_presence") {
    return params.manualPresence;
  }

  if (params.method === "key_ratio") {
    if (params.keyRatio <= 0) {
      return 0;
    }

    return params.visits / params.keyRatio;
  }

  return calculatePresenceNeed(params.totalVisitMinutes, params.weeklyWorkHours);
}

export function calculateTotalPresence(calculatedPresence: number): number {
  return calculatedPresence;
}

export function calculateStaffingCost(
  totalPresence: number,
  salaryCostPerPresence: number
): number {
  return totalPresence * salaryCostPerPresence;
}

export function calculateDimensioneringSummary(
  calculations: DimensioningRowCalculation[]
): DimensioneringSummary {
  return calculations.reduce(
    (summary, calculation) => ({
      calculatedPresence:
        summary.calculatedPresence + calculation.calculatedPresence,
      // ST som inte bidrar sparas och summeras separat tills verksamheten har
      // bekräftat om värdet ska påverka total närvaro eller hanteras som egen post.
      nonContributingStPresence:
        summary.nonContributingStPresence +
        toNumber(calculation.row.nonContributingStPresence),
      totalPresence: summary.totalPresence + calculation.totalPresence,
      staffingCost: summary.staffingCost + calculation.staffingCost,
    }),
    {
      calculatedPresence: 0,
      nonContributingStPresence: 0,
      totalPresence: 0,
      staffingCost: 0,
    }
  );
}

export function calculateProductionBasisSummary(
  rows: OutpatientProductionRow[],
  careType: CareType
): ProductionBasisSummary {
  const totalVisits = rows.reduce((sum, row) => sum + toNumber(row.visits), 0);
  const totalVisitMinutes = rows.reduce(
    (sum, row) =>
      sum +
      calculateTotalVisitMinutes(
        toNumber(row.visits),
        toNumber(row.average_minutes_per_visit)
      ),
    0
  );

  return {
    productionPlanId: firstNumber(rows.map((row) => row.production_plan_id)),
    year: firstNumber(rows.map((row) => row.production_plan_year)),
    organizationName:
      firstText(rows.map((row) => row.organization_name)) ||
      "Karolinska Universitetssjukhuset",
    kombikaIds: uniqueTexts(rows.map((row) => row.kombika_pf_id)),
    kombikaNames: uniqueTexts(rows.map((row) => row.kombika_pf)),
    sections: uniqueTexts(rows.map((row) => row.section)),
    costCenters: uniqueTexts(rows.map((row) => row.cost_center)),
    careType,
    visitTypes: uniqueTexts(rows.map((row) => row.visit_type)),
    roleCategories: uniqueTexts(
      rows.flatMap((row) => [
        row.primary_role_category,
        row.secondary_role_category,
      ])
    ),
    totalVisits,
    totalVisitMinutes,
    averageMinutesPerVisit:
      totalVisits > 0 ? totalVisitMinutes / totalVisits : 0,
    r12Outcome: rows.reduce((sum, row) => sum + toNumber(row.r12_outcome), 0),
    r12PresenceFouu: rows.reduce(
      (sum, row) => sum + toNumber(row.r12_presence_fouu),
      0
    ),
    r12PresenceProduction: rows.reduce(
      (sum, row) => sum + toNumber(row.r12_presence_production),
      0
    ),
    r12SalaryCostPerPresence: calculateWeightedAverage(
      rows.map((row) => ({
        value: toNumber(row.r12_salary_cost_per_presence),
        weight: toNumber(row.visits),
      }))
    ),
    previousYearPlan: rows.reduce(
      (sum, row) => sum + toNumber(row.previous_year_plan),
      0
    ),
    previousYearOutcome: rows.reduce(
      (sum, row) => sum + toNumber(row.previous_year_outcome),
      0
    ),
    previousDimensioningPresence: rows.reduce(
      (sum, row) => sum + toNumber(row.previous_dimensioning_presence),
      0
    ),
  };
}

export function calculateDimensioningRows(params: {
  rows: DimensioningRowState[];
  productionBasis: ProductionBasisSummary;
}): DimensioningRowCalculation[] {
  return params.rows.map((row) => {
    const productionShare = toNumber(row.productionSharePercentage);
    const visitsFromProductionPlan =
      (params.productionBasis.totalVisits * productionShare) / 100;
    const totalVisitMinutes = calculateTotalVisitMinutes(
      visitsFromProductionPlan,
      params.productionBasis.averageMinutesPerVisit
    );
    const weeklyWorkHours =
      toNumber(row.weeklyWorkHours) || DEFAULT_WEEKLY_WORK_HOURS;
    const calculatedPresence =
      params.productionBasis.careType === "dagvard"
        ? calculateDayCarePresenceNeed({
            method: row.dayCareCalculationMethod,
            visits: visitsFromProductionPlan,
            totalVisitMinutes,
            weeklyWorkHours,
            keyRatio: toNumber(row.keyRatio),
            manualPresence: toNumber(row.manualPresence),
          })
        : calculatePresenceNeed(totalVisitMinutes, weeklyWorkHours);
    const totalPresence = calculateTotalPresence(calculatedPresence);
    const staffingCost = calculateStaffingCost(
      totalPresence,
      toNumber(row.salaryCostPerPresence)
    );

    return {
      row,
      visitsFromProductionPlan,
      averageMinutesPerVisit: params.productionBasis.averageMinutesPerVisit,
      totalVisitMinutes,
      calculatedPresence,
      totalPresence,
      staffingCost,
    };
  });
}

export function isDayCareRow(row: OutpatientProductionRow): boolean {
  const kombikaCode = row.kombika_pf_id?.toLowerCase() ?? "";
  const values = [row.care_type, row.kombika_pf, row.visit_type, kombikaCode]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  // Verksamheten skiljer dagvård och mottagning med en siffra i kombika-koden.
  // När exakt position/värde är bekräftat kan denna regel smalnas av.
  const hasKnownDayCareCodeMarker = /(^|[-_])0?3($|[-_])/.test(kombikaCode);

  return values.some(
    (value) =>
      value.includes("dagv") ||
      value === "day_care" ||
      value === "dagvard" ||
      value === "dagvård"
  ) || hasKnownDayCareCodeMarker;
}

export function matchesCareType(
  row: OutpatientProductionRow,
  careType: CareType
): boolean {
  return careType === "dagvard" ? isDayCareRow(row) : !isDayCareRow(row);
}

function uniqueTexts(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value))
    )
  );
}

function firstText(values: Array<string | null | undefined>): string {
  return uniqueTexts(values)[0] ?? "";
}

function firstNumber(values: Array<number | null | undefined>): number | null {
  const numberValue = values.find(
    (value): value is number => value !== null && value !== undefined
  );

  return numberValue ?? null;
}

function calculateWeightedAverage(
  values: Array<{ value: number; weight: number }>
): number {
  const weightedValues = values.filter((item) => item.value > 0);
  const weightSum = weightedValues.reduce((sum, item) => sum + item.weight, 0);

  if (weightSum <= 0) {
    const valueSum = weightedValues.reduce((sum, item) => sum + item.value, 0);

    return weightedValues.length > 0 ? valueSum / weightedValues.length : 0;
  }

  return (
    weightedValues.reduce(
      (sum, item) => sum + item.value * Math.max(item.weight, 0),
      0
    ) / weightSum
  );
}
