import {
  formatOneDecimal,
  formatTwoDecimals,
} from "@/shared/utils/format-number";
import { WEEKLY_WORKING_MINUTES } from "../../utils/outpatient-production-calculations";

export type WeeklyImpactType = "semester" | "red-day" | "capacity" | "other";
export type WeeklyImpactTarget =
  | "visits"
  | "visitMinutes"
  | "drgPoints"
  | "staffingNeed";

export type WeekdayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type WeeklyImpact = {
  id: string;
  type: WeeklyImpactType;
  target: WeeklyImpactTarget;
  name: string;
  startWeek: number;
  endWeek: number;
  percentage: number;
  weekdays: WeekdayKey[];
};

export type WeeklyImpactDraft = {
  type: WeeklyImpactType;
  target: WeeklyImpactTarget;
  name: string;
  startWeek: string;
  endWeek: string;
  percentage: string;
  weekdays: WeekdayKey[];
};

export type WeeklyCurveSourceRow = {
  id: string;
  careUnitName: string;
  roleCategory: string;
  visits: number;
  totalVisitMinutes: number;
  drgPoints?: number;
};

export type WeeklyCurvePoint = {
  week: number;
  baseVisits: number;
  adjustedVisits: number;
  baseVisitMinutes: number;
  adjustedVisitMinutes: number;
  baseDrgPoints: number;
  adjustedDrgPoints: number;
  baseStaffingNeed: number;
  adjustedStaffingNeed: number;
  impactPercentage: number;
  impactPercentages: WeeklyMetricImpactPercentages;
  impacts: WeeklyImpact[];
  days: WeeklyCurveDay[];
  rows: WeeklyCurveBreakdownRow[];
};

export type WeeklyCurveDay = {
  weekday: WeekdayKey;
  label: string;
  shortLabel: string;
  baseVisits: number;
  adjustedVisits: number;
  baseVisitMinutes: number;
  adjustedVisitMinutes: number;
  baseDrgPoints: number;
  adjustedDrgPoints: number;
  baseStaffingNeed: number;
  adjustedStaffingNeed: number;
  impactPercentage: number;
  impactPercentages: WeeklyMetricImpactPercentages;
  impacts: WeeklyImpact[];
};

export type WeeklyCurveBreakdownRow = {
  id: string;
  careUnit: string;
  roleCategory: string;
  visits: number;
  visitMinutes: number;
  drgPoints: number;
  staffingNeed: number;
};

export type AnnualCurveSummary = {
  visits: number;
  visitMinutes: number;
  drgPoints: number;
  staffingNeed: number;
};

export type WeeklyMetricImpactPercentages = Record<WeeklyImpactTarget, number>;
type WeeklyMetricFactors = Record<WeeklyImpactTarget, number>;

export const WEEK_COUNT = 52;
const DAYS_PER_WEEK = 7;
const impactTargetKeys: WeeklyImpactTarget[] = [
  "visits",
  "visitMinutes",
  "drgPoints",
  "staffingNeed",
];

export const weekdayOptions: Array<{
  value: WeekdayKey;
  label: string;
  shortLabel: string;
}> = [
  { value: "monday", label: "Måndag", shortLabel: "Mån" },
  { value: "tuesday", label: "Tisdag", shortLabel: "Tis" },
  { value: "wednesday", label: "Onsdag", shortLabel: "Ons" },
  { value: "thursday", label: "Torsdag", shortLabel: "Tor" },
  { value: "friday", label: "Fredag", shortLabel: "Fre" },
  { value: "saturday", label: "Lördag", shortLabel: "Lör" },
  { value: "sunday", label: "Söndag", shortLabel: "Sön" },
];

export const impactTypeOptions: Array<{
  value: WeeklyImpactType;
  label: string;
  defaultName: string;
  defaultPercentage: string;
}> = [
  {
    value: "semester",
    label: "Semester",
    defaultName: "Semesterperiod",
    defaultPercentage: "-20",
  },
  {
    value: "red-day",
    label: "Röda dagar",
    defaultName: "Röda dagar",
    defaultPercentage: "-15",
  },
  {
    value: "capacity",
    label: "Kapacitet",
    defaultName: "Extra kapacitet",
    defaultPercentage: "10",
  },
  {
    value: "other",
    label: "Annat",
    defaultName: "Annan påverkan",
    defaultPercentage: "0",
  },
];

export const impactTargetOptions: Array<{
  value: WeeklyImpactTarget;
  label: string;
}> = [
  { value: "visits", label: "Vårdhändelser" },
  { value: "visitMinutes", label: "Tid" },
  { value: "drgPoints", label: "DRG" },
  { value: "staffingNeed", label: "Personalbehov" },
];

export const initialImpactDraft: WeeklyImpactDraft = {
  type: "semester",
  target: "staffingNeed",
  name: "Semesterperiod",
  startWeek: "28",
  endWeek: "31",
  percentage: "-20",
  weekdays: weekdayOptions.map((option) => option.value),
};

export function calculateAnnualCurveSummary(
  rows: WeeklyCurveSourceRow[]
): AnnualCurveSummary {
  const summary = rows.reduce(
    (current, row) => ({
      visits: current.visits + row.visits,
      visitMinutes: current.visitMinutes + row.totalVisitMinutes,
      drgPoints: current.drgPoints + (row.drgPoints ?? 0),
    }),
    {
      visits: 0,
      visitMinutes: 0,
      drgPoints: 0,
    }
  );

  return {
    ...summary,
    staffingNeed: calculateStaffingNeed(summary.visitMinutes),
  };
}

export function buildWeeklyCurve(
  rows: WeeklyCurveSourceRow[],
  impacts: WeeklyImpact[]
): WeeklyCurvePoint[] {
  const annualVisits = rows.reduce((sum, row) => sum + row.visits, 0);
  const annualVisitMinutes = rows.reduce(
    (sum, row) => sum + row.totalVisitMinutes,
    0
  );
  const annualDrgPoints = rows.reduce(
    (sum, row) => sum + (row.drgPoints ?? 0),
    0
  );

  return Array.from({ length: WEEK_COUNT }, (_, index) => {
    const week = index + 1;
    const weekImpacts = impacts.filter(
      (impact) => week >= impact.startWeek && week <= impact.endWeek
    );
    const baseVisits = annualVisits / WEEK_COUNT;
    const baseVisitMinutes = annualVisitMinutes / WEEK_COUNT;
    const baseDrgPoints = annualDrgPoints / WEEK_COUNT;
    const days = buildWeeklyDays({
      baseVisits,
      baseVisitMinutes,
      baseDrgPoints,
      impacts: weekImpacts,
    });
    const impactPercentages = calculateAverageImpactPercentages(days);
    const impactFactors = calculateImpactFactors(impactPercentages);
    const weeklyRows = buildWeeklyBreakdownRows(rows, impactFactors);
    const adjustedVisits = weeklyRows.reduce((sum, row) => sum + row.visits, 0);
    const adjustedVisitMinutes = weeklyRows.reduce(
      (sum, row) => sum + row.visitMinutes,
      0
    );
    const adjustedDrgPoints = weeklyRows.reduce(
      (sum, row) => sum + row.drgPoints,
      0
    );
    const baseStaffingNeed = calculateStaffingNeed(baseVisitMinutes);

    return {
      week,
      baseVisits,
      adjustedVisits,
      baseVisitMinutes,
      adjustedVisitMinutes,
      baseDrgPoints,
      adjustedDrgPoints,
      baseStaffingNeed,
      adjustedStaffingNeed: weeklyRows.reduce(
        (sum, row) => sum + row.staffingNeed,
        0
      ),
      impactPercentage: impactPercentages.staffingNeed,
      impactPercentages,
      impacts: weekImpacts,
      days,
      rows: weeklyRows,
    };
  });
}

export function clampWeek(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(WEEK_COUNT, Math.max(1, Math.round(value)));
}

export function parseImpactType(value: string): WeeklyImpactType {
  return impactTypeOptions.some((option) => option.value === value)
    ? (value as WeeklyImpactType)
    : "other";
}

export function parseImpactTarget(value: string): WeeklyImpactTarget {
  return impactTargetOptions.some((option) => option.value === value)
    ? (value as WeeklyImpactTarget)
    : "staffingNeed";
}

export function getImpactTargetLabel(
  target: WeeklyImpactTarget,
  volumeLabel = "Vårdhändelser"
): string {
  if (target === "visits") {
    return volumeLabel;
  }

  return (
    impactTargetOptions.find((option) => option.value === target)?.label ??
    "Personalbehov"
  );
}

export function getImpactWeekdays(impact: {
  weekdays?: WeekdayKey[];
}): WeekdayKey[] {
  if (impact.weekdays && impact.weekdays.length > 0) {
    return impact.weekdays;
  }

  return weekdayOptions.map((option) => option.value);
}

export function formatImpactWeekdays(impact: {
  weekdays?: WeekdayKey[];
}): string {
  const weekdays = getImpactWeekdays(impact);

  if (weekdays.length === weekdayOptions.length) {
    return "Alla dagar";
  }

  return weekdays
    .map(
      (weekday) =>
        weekdayOptions.find((option) => option.value === weekday)?.shortLabel
    )
    .filter(Boolean)
    .join(", ");
}

export function getCurveBarColor(point: WeeklyCurvePoint): string {
  if (point.impactPercentage > 0) {
    return "#000000";
  }

  if (point.impactPercentage < 0) {
    return "#333333";
  }

  return "#005883";
}

export function formatSignedPercentage(value: number): string {
  return `${value > 0 ? "+" : ""}${formatOneDecimal(value)}%`;
}

export function formatMetricImpactSummary(
  percentages: WeeklyMetricImpactPercentages,
  volumeLabel = "Vårdhändelser"
): string {
  const changedImpacts = impactTargetKeys
    .filter((target) => Math.abs(percentages[target]) >= 0.05)
    .map(
      (target) =>
        `${getImpactTargetLabel(target, volumeLabel)} ${formatSignedPercentage(
          percentages[target]
        )}`
    );

  return changedImpacts.length > 0 ? changedImpacts.join(" · ") : "0.0%";
}

export function formatWeekTitle(
  point: WeeklyCurvePoint,
  volumeLabelLower = "vårdhändelser",
  volumeLabel = "Vårdhändelser"
): string {
  return [
    `Vecka ${point.week}`,
    `Personalbehov ${formatTwoDecimals(point.adjustedStaffingNeed)} heltid`,
    `${formatOneDecimal(point.adjustedVisits)} ${volumeLabelLower}`,
    `Påverkan ${formatMetricImpactSummary(point.impactPercentages, volumeLabel)}`,
  ].join(" · ");
}

function buildWeeklyDays(params: {
  baseVisits: number;
  baseVisitMinutes: number;
  baseDrgPoints: number;
  impacts: WeeklyImpact[];
}): WeeklyCurveDay[] {
  const baseVisitsPerDay = params.baseVisits / DAYS_PER_WEEK;
  const baseVisitMinutesPerDay = params.baseVisitMinutes / DAYS_PER_WEEK;
  const baseDrgPointsPerDay = params.baseDrgPoints / DAYS_PER_WEEK;

  return weekdayOptions.map((weekday) => {
    const dayImpacts = params.impacts.filter((impact) =>
      getImpactWeekdays(impact).includes(weekday.value)
    );
    const impactPercentages = calculateTargetImpactPercentages(dayImpacts);
    const impactFactors = calculateImpactFactors(impactPercentages);
    const baseStaffingNeed = calculateStaffingNeed(baseVisitMinutesPerDay);

    return {
      weekday: weekday.value,
      label: weekday.label,
      shortLabel: weekday.shortLabel,
      baseVisits: baseVisitsPerDay,
      adjustedVisits: baseVisitsPerDay * impactFactors.visits,
      baseVisitMinutes: baseVisitMinutesPerDay,
      adjustedVisitMinutes: baseVisitMinutesPerDay * impactFactors.visitMinutes,
      baseDrgPoints: baseDrgPointsPerDay,
      adjustedDrgPoints: baseDrgPointsPerDay * impactFactors.drgPoints,
      baseStaffingNeed,
      adjustedStaffingNeed: baseStaffingNeed * impactFactors.staffingNeed,
      impactPercentage: impactPercentages.staffingNeed,
      impactPercentages,
      impacts: dayImpacts,
    };
  });
}

function calculateAverageImpactPercentages(
  days: WeeklyCurveDay[]
): WeeklyMetricImpactPercentages {
  if (days.length === 0) {
    return createEmptyMetricImpactPercentages();
  }

  return impactTargetKeys.reduce(
    (current, target) => ({
      ...current,
      [target]:
        (days.reduce(
          (sum, day) =>
            sum + Math.max(0, 1 + day.impactPercentages[target] / 100),
          0
        ) /
          days.length -
          1) *
        100,
    }),
    createEmptyMetricImpactPercentages()
  );
}

function calculateTargetImpactPercentages(
  impacts: WeeklyImpact[]
): WeeklyMetricImpactPercentages {
  return impacts.reduce((current, impact) => {
    const target = impact.target;

    return {
      ...current,
      [target]: current[target] + impact.percentage,
    };
  }, createEmptyMetricImpactPercentages());
}

function calculateImpactFactors(
  percentages: WeeklyMetricImpactPercentages
): WeeklyMetricFactors {
  return impactTargetKeys.reduce(
    (current, target) => ({
      ...current,
      [target]: Math.max(0, 1 + percentages[target] / 100),
    }),
    createBaseMetricFactors()
  );
}

function createEmptyMetricImpactPercentages(): WeeklyMetricImpactPercentages {
  return {
    visits: 0,
    visitMinutes: 0,
    drgPoints: 0,
    staffingNeed: 0,
  };
}

function createBaseMetricFactors(): WeeklyMetricFactors {
  return {
    visits: 1,
    visitMinutes: 1,
    drgPoints: 1,
    staffingNeed: 1,
  };
}

function buildWeeklyBreakdownRows(
  rows: WeeklyCurveSourceRow[],
  impactFactors: WeeklyMetricFactors
): WeeklyCurveBreakdownRow[] {
  return rows
    .map((row) => {
      const baseVisitMinutes = row.totalVisitMinutes / WEEK_COUNT;
      const visits = (row.visits / WEEK_COUNT) * impactFactors.visits;
      const visitMinutes = baseVisitMinutes * impactFactors.visitMinutes;
      const drgPoints =
        ((row.drgPoints ?? 0) / WEEK_COUNT) * impactFactors.drgPoints;

      return {
        id: row.id,
        careUnit: row.careUnitName,
        roleCategory: row.roleCategory,
        visits,
        visitMinutes,
        drgPoints,
        staffingNeed:
          calculateStaffingNeed(baseVisitMinutes) * impactFactors.staffingNeed,
      };
    })
    .sort(
      (first, second) =>
        first.careUnit.localeCompare(second.careUnit, "sv") ||
        first.roleCategory.localeCompare(second.roleCategory, "sv")
    );
}

function calculateStaffingNeed(visitMinutes: number): number {
  return visitMinutes / WEEKLY_WORKING_MINUTES;
}
