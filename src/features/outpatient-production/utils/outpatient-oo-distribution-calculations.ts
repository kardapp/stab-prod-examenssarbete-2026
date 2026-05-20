import type { OutpatientProductionRow } from "@/types/production";
import type {
  OoDistributionDraftRow,
  SavedOoDistributionRow,
} from "../types/outpatient-oo-distribution.types";

export function toNumber(value: string | number | null | undefined): number {
  const numericValue = Number(value ?? 0);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function calculateDistributedVisits(
  visits: string | number | null | undefined,
  percentage: string | number | null | undefined
): number {
  return (toNumber(visits) * toNumber(percentage)) / 100;
}

export function calculateDistributionSummary(
  productionRow: OutpatientProductionRow | null,
  rows: OoDistributionDraftRow[]
) {
  const totalVisits = toNumber(productionRow?.visits);
  const totalPercentage = rows.reduce(
    (sum, row) => sum + toNumber(row.percentage),
    0
  );
  const distributedVisits = calculateDistributedVisits(
    totalVisits,
    totalPercentage
  );

  return {
    totalVisits,
    totalPercentage,
    distributedVisits,
    remainingPercentage: 100 - totalPercentage,
    remainingVisits: totalVisits - distributedVisits,
  };
}

export function createEmptyDistributionRow(
  percentage = "0"
): OoDistributionDraftRow {
  return {
    id: `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ooName: "",
    careUnit: "",
    careUnitCostCenter: "",
    percentage,
    comment: "",
  };
}

export function mapSavedDistributionToDraft(
  row: SavedOoDistributionRow
): OoDistributionDraftRow {
  return {
    id: `saved-${row.id}`,
    savedId: row.id,
    ooName: row.oo_name ?? "",
    careUnit: row.care_unit ?? "",
    careUnitCostCenter: row.care_unit_cost_center ?? "",
    percentage:
      row.distribution_percentage === null ||
      row.distribution_percentage === undefined
        ? "0"
        : String(row.distribution_percentage),
    comment: row.comment ?? "",
  };
}

export function validateOoDistribution(
  productionRow: OutpatientProductionRow | null,
  rows: OoDistributionDraftRow[]
): string {
  if (!productionRow) {
    return "Välj en produktionsrad att fördela.";
  }

  if (rows.length === 0) {
    return "Lägg till minst en vårdande enhet.";
  }

  if (rows.some((row) => toNumber(row.percentage) < 0)) {
    return "Andel kan inte vara negativ.";
  }

  if (rows.some((row) => toNumber(row.percentage) > 0 && !row.careUnit.trim())) {
    return "Ange vårdande enhet för alla rader med andel.";
  }

  const percentageTotal = rows.reduce(
    (sum, row) => sum + toNumber(row.percentage),
    0
  );

  if (Math.abs(percentageTotal - 100) > 0.01) {
    return "Fördelningen måste summera till 100%.";
  }

  return "";
}
