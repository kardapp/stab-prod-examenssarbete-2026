import {
  formatOneDecimal,
  formatTwoDecimals,
} from "@/shared/utils/format-number";
import { WEEKLY_WORKING_MINUTES } from "../../utils/outpatient-production-calculations";

export type WeeklyImpactType = "semester" | "red-day" | "capacity" | "other";

export type WeeklyImpact = {
  id: string;
  type: WeeklyImpactType;
  name: string;
  startWeek: number;
  endWeek: number;
  percentage: number;
};

export type WeeklyImpactDraft = {
  type: WeeklyImpactType;
  name: string;
  startWeek: string;
  endWeek: string;
  percentage: string;
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
  impacts: WeeklyImpact[];
  rows: WeeklyCurveBreakdownRow[];
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

export const WEEK_COUNT = 52;

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

export const initialImpactDraft: WeeklyImpactDraft = {
  type: "semester",
  name: "Semesterperiod",
  startWeek: "28",
  endWeek: "31",
  percentage: "-20",
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
  return Array.from({ length: WEEK_COUNT }, (_, index) => {
    const week = index + 1;
    const weekImpacts = impacts.filter(
      (impact) => week >= impact.startWeek && week <= impact.endWeek
    );
    const impactPercentage = weekImpacts.reduce(
      (sum, impact) => sum + impact.percentage,
      0
    );
    const impactFactor = Math.max(0, 1 + impactPercentage / 100);
    const weeklyRows = buildWeeklyBreakdownRows(rows, impactFactor);
    const baseVisits =
      rows.reduce((sum, row) => sum + row.visits, 0) / WEEK_COUNT;
    const baseVisitMinutes =
      rows.reduce((sum, row) => sum + row.totalVisitMinutes, 0) / WEEK_COUNT;
    const baseDrgPoints =
      rows.reduce((sum, row) => sum + (row.drgPoints ?? 0), 0) / WEEK_COUNT;
    const adjustedVisits = weeklyRows.reduce((sum, row) => sum + row.visits, 0);
    const adjustedVisitMinutes = weeklyRows.reduce(
      (sum, row) => sum + row.visitMinutes,
      0
    );
    const adjustedDrgPoints = weeklyRows.reduce(
      (sum, row) => sum + row.drgPoints,
      0
    );

    return {
      week,
      baseVisits,
      adjustedVisits,
      baseVisitMinutes,
      adjustedVisitMinutes,
      baseDrgPoints,
      adjustedDrgPoints,
      baseStaffingNeed: calculateStaffingNeed(baseVisitMinutes),
      adjustedStaffingNeed: calculateStaffingNeed(adjustedVisitMinutes),
      impactPercentage,
      impacts: weekImpacts,
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

export function getCurveBarColor(point: WeeklyCurvePoint): string {
  if (point.impactPercentage > 0) {
    return "#b42318";
  }

  if (point.impactPercentage < 0) {
    return "#0f766e";
  }

  return "#005883";
}

export function formatSignedPercentage(value: number): string {
  return `${value > 0 ? "+" : ""}${formatOneDecimal(value)}%`;
}

export function formatWeekTitle(point: WeeklyCurvePoint): string {
  return [
    `Vecka ${point.week}`,
    `Personalbehov ${formatTwoDecimals(point.adjustedStaffingNeed)} heltid`,
    `${formatOneDecimal(point.adjustedVisits)} vårdtillfällen`,
    `Påverkan ${formatSignedPercentage(point.impactPercentage)}`,
  ].join(" · ");
}

function buildWeeklyBreakdownRows(
  rows: WeeklyCurveSourceRow[],
  impactFactor: number
): WeeklyCurveBreakdownRow[] {
  return rows
    .map((row) => {
      const visits = (row.visits / WEEK_COUNT) * impactFactor;
      const visitMinutes = (row.totalVisitMinutes / WEEK_COUNT) * impactFactor;
      const drgPoints = ((row.drgPoints ?? 0) / WEEK_COUNT) * impactFactor;

      return {
        id: row.id,
        careUnit: row.careUnitName,
        roleCategory: row.roleCategory,
        visits,
        visitMinutes,
        drgPoints,
        staffingNeed: calculateStaffingNeed(visitMinutes),
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
