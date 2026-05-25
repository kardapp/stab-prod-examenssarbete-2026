import type { OutpatientProductionRow } from "@/types/production";
import type { SavedOoDistributionRow } from "../types/outpatient-oo-distribution.types";

export const CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID = 1;

const CURRENT_ROW_IDS_KEY = "outpatient-production-current-row-ids";

export function saveCurrentOutpatientProductionRowIds(rowIds: number[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    CURRENT_ROW_IDS_KEY,
    JSON.stringify(normalizeRowIds(rowIds))
  );
}

export function clearCurrentOutpatientProductionRowIds() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(CURRENT_ROW_IDS_KEY);
}

export function readCurrentOutpatientProductionRowIds(): number[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.sessionStorage.getItem(CURRENT_ROW_IDS_KEY);

    if (!storedValue) {
      return [];
    }

    return normalizeRowIds(JSON.parse(storedValue));
  } catch {
    return [];
  }
}

export function filterCurrentOutpatientProductionRows(
  rows: OutpatientProductionRow[],
  currentRowIds: number[]
): OutpatientProductionRow[] {
  const rowIdSet = new Set(currentRowIds);

  return rows.filter((row) => rowIdSet.has(row.id));
}

export function filterCurrentOoDistributionRows(
  rows: SavedOoDistributionRow[],
  currentRowIds: number[]
): SavedOoDistributionRow[] {
  const rowIdSet = new Set(currentRowIds);

  return rows.filter((row) => rowIdSet.has(row.production_row_id));
}

function normalizeRowIds(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item > 0)
    )
  );
}
