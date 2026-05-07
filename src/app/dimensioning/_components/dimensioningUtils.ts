import {
  calculateTotalVisitMinutes,
  toNumber,
} from "@/lib/calculations/outpatientDimensioningCalculations";
import type { OutpatientProductionRow } from "@/types/production";

export function sumVisitMinutes(rows: OutpatientProductionRow[]) {
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
