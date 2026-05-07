import {
  calculateTotalVisitMinutes,
  toNumber,
} from "@/lib/calculations/outpatientProductionCalculations";
import type { OutpatientProductionRow } from "@/types/production";
import type { SummaryItem } from "./outpatientProductionTypes";

export function sumRows(
  rows: OutpatientProductionRow[],
  key: keyof OutpatientProductionRow
): number {
  return rows.reduce((sum, row) => sum + toNumber(row[key]), 0);
}

export function groupRows(
  rows: OutpatientProductionRow[],
  getLabel: (row: OutpatientProductionRow) => string
): SummaryItem[] {
  const groupedValues = new Map<string, number>();

  rows.forEach((row) => {
    const label = getLabel(row);
    const currentValue = groupedValues.get(label) ?? 0;
    groupedValues.set(label, currentValue + toNumber(row.visits));
  });

  return Array.from(groupedValues.entries()).map(([label, value]) => ({
    label,
    value,
  }));
}

export function getAverageValue(
  rows: OutpatientProductionRow[],
  key: keyof OutpatientProductionRow
): number {
  if (rows.length === 0) {
    return 0;
  }

  return sumRows(rows, key) / rows.length;
}

export function getAverageTimeItems(
  rows: OutpatientProductionRow[]
): SummaryItem[] {
  const groupedValues = new Map<string, { totalMinutes: number; count: number }>();

  rows.forEach((row) => {
    const label = row.visit_type ?? "Ej angivet";
    const currentValue = groupedValues.get(label) ?? {
      totalMinutes: 0,
      count: 0,
    };

    groupedValues.set(label, {
      totalMinutes:
        currentValue.totalMinutes + toNumber(row.average_minutes_per_visit),
      count: currentValue.count + 1,
    });
  });

  return Array.from(groupedValues.entries()).map(([label, value]) => ({
    label,
    value: value.count === 0 ? 0 : value.totalMinutes / value.count,
  }));
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

export function formatRoleCategory(
  primaryRoleCategory: string | null,
  secondaryRoleCategory: string | null
): string {
  if (!secondaryRoleCategory) {
    return primaryRoleCategory ?? "Ej angivet";
  }

  return `${primaryRoleCategory ?? "Ej angivet"} + ${secondaryRoleCategory}`;
}

export function formatDay(
  periodType: string | null,
  periodValue: string | null
): string {
  if (!periodValue) {
    return "Ej angivet";
  }

  return periodType === "day" ? periodValue : `Dag ${periodValue}`;
}
