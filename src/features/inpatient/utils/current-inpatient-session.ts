import {
  initialInpatientMeDimensioningRows,
  initialInpatientOoDimensioningRows,
  initialInpatientOoDimensioningSettings,
} from "../constants/inpatient-options";
import type {
  InpatientMeDimensioningRow,
  InpatientOoDimensioningRow,
  InpatientOoDimensioningSettings,
  InpatientOoDistributionRow,
  InpatientProductionRow,
} from "../types/inpatient.types";

const PRODUCTION_ROW_KEY = "inpatient-current-production-row";
const OO_DISTRIBUTIONS_KEY = "inpatient-current-oo-distributions";
const OO_DIMENSIONING_ROWS_KEY = "inpatient-current-oo-dimensioning-rows";
const OO_DIMENSIONING_SETTINGS_KEY =
  "inpatient-current-oo-dimensioning-settings";
const ME_DIMENSIONING_ROWS_KEY = "inpatient-current-me-dimensioning-rows";

export function saveCurrentInpatientProductionRow(row: InpatientProductionRow) {
  writeJson(PRODUCTION_ROW_KEY, row);
}

export function hasCurrentInpatientProductionRow(): boolean {
  return hasStorageValue(PRODUCTION_ROW_KEY);
}

export function readCurrentInpatientProductionRow():
  | InpatientProductionRow
  | null {
  return readJson<InpatientProductionRow | null>(PRODUCTION_ROW_KEY, null);
}

export function saveCurrentInpatientOoDistributions(
  rows: InpatientOoDistributionRow[]
) {
  writeJson(OO_DISTRIBUTIONS_KEY, rows);
}

export function hasCurrentInpatientOoDistributions(): boolean {
  return hasStorageValue(OO_DISTRIBUTIONS_KEY);
}

export function readCurrentInpatientOoDistributions():
  | InpatientOoDistributionRow[] {
  return readJson<InpatientOoDistributionRow[]>(OO_DISTRIBUTIONS_KEY, []);
}

export function saveCurrentInpatientOoDimensioning(
  rows: InpatientOoDimensioningRow[],
  settings: InpatientOoDimensioningSettings
) {
  writeJson(OO_DIMENSIONING_ROWS_KEY, rows);
  writeJson(OO_DIMENSIONING_SETTINGS_KEY, settings);
}

export function hasCurrentInpatientOoDimensioning(): boolean {
  return (
    hasStorageValue(OO_DIMENSIONING_ROWS_KEY) &&
    hasStorageValue(OO_DIMENSIONING_SETTINGS_KEY)
  );
}

export function readCurrentInpatientOoDimensioningRows():
  | InpatientOoDimensioningRow[] {
  return readJson<InpatientOoDimensioningRow[]>(
    OO_DIMENSIONING_ROWS_KEY,
    initialInpatientOoDimensioningRows
  );
}

export function readCurrentInpatientOoDimensioningSettings():
  | InpatientOoDimensioningSettings {
  return readJson<InpatientOoDimensioningSettings>(
    OO_DIMENSIONING_SETTINGS_KEY,
    initialInpatientOoDimensioningSettings
  );
}

export function saveCurrentInpatientMeDimensioning(
  rows: InpatientMeDimensioningRow[]
) {
  writeJson(ME_DIMENSIONING_ROWS_KEY, rows);
}

export function hasCurrentInpatientMeDimensioning(): boolean {
  return hasStorageValue(ME_DIMENSIONING_ROWS_KEY);
}

export function readCurrentInpatientMeDimensioningRows():
  | InpatientMeDimensioningRow[] {
  return readJson<InpatientMeDimensioningRow[]>(
    ME_DIMENSIONING_ROWS_KEY,
    initialInpatientMeDimensioningRows
  );
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);

    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function hasStorageValue(key: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}
