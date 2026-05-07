import { toNumber } from "@/lib/calculations/outpatientProductionCalculations";
import type { OutpatientProductionRow } from "@/types/production";

export function sumRows(
  rows: OutpatientProductionRow[],
  key: keyof OutpatientProductionRow
): number {
  return rows.reduce((sum, row) => sum + toNumber(row[key]), 0);
}
