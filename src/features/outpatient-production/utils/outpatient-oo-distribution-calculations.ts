import type { OutpatientProductionRow } from "@/types/production";
import type {
  CareUnitOption,
  OoDistributionDraftRow,
  OoRoleAllocation,
  SavedOoDistributionRow,
} from "../types/outpatient-oo-distribution.types";
import { getAnnualVisits } from "./outpatient-production-calculations";

export const careUnitOptions: CareUnitOption[] = [
  {
    id: "care-unit-akutmottagning-solna",
    name: "Akutmottagning Solna",
    label: "Akutmottagning Solna",
  },
  {
    id: "care-unit-medicinsk-enhet-huddinge",
    name: "Medicinsk vårdenhet Huddinge",
    label: "Medicinsk vårdenhet Huddinge",
  },
  {
    id: "care-unit-kirurgisk-enhet-solna",
    name: "Kirurgisk vårdenhet Solna",
    label: "Kirurgisk vårdenhet Solna",
  },
  {
    id: "care-unit-barn-ungdom",
    name: "Barn- och ungdomsmedicinsk enhet",
    label: "Barn- och ungdomsmedicinsk enhet",
  },
  {
    id: "care-unit-rehabilitering",
    name: "Rehabiliteringsenhet",
    label: "Rehabiliteringsenhet",
  },
];

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

export function calculateDistributionPercentage(
  visits: string | number | null | undefined,
  distributedVisits: string | number | null | undefined
): number {
  const totalVisits = toNumber(visits);

  if (totalVisits <= 0) {
    return 0;
  }

  return (toNumber(distributedVisits) / totalVisits) * 100;
}

export function formatDistributionInputNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return String(Number(value.toFixed(6)));
}

export function calculateDistributionSummary(
  productionRow: OutpatientProductionRow | null,
  rows: OoDistributionDraftRow[]
) {
  const totalVisits = productionRow ? getAnnualVisits(productionRow) : 0;
  const distributedVisits = rows.reduce(
    (sum, row) => sum + toNumber(row.visits),
    0
  );
  const totalPercentage = totalVisits
    ? calculateDistributionPercentage(totalVisits, distributedVisits)
    : 0;

  return {
    totalVisits,
    totalPercentage,
    distributedVisits,
    remainingPercentage: 100 - totalPercentage,
    remainingVisits: totalVisits - distributedVisits,
  };
}

export function createEmptyDistributionRow(
  percentage = "0",
  productionRows?: OutpatientProductionRow[],
  productionRowId?: number
): OoDistributionDraftRow {
  const selectedProductionRow =
    productionRows?.find((row) => row.id === productionRowId) ??
    (productionRowId ? undefined : productionRows?.[0]);
  const annualVisits = selectedProductionRow
    ? getAnnualVisits(selectedProductionRow)
    : 0;

  return {
    id: `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    careUnitId: "",
    careUnit: "",
    productionRowId: productionRowId ?? selectedProductionRow?.id ?? null,
    percentage,
    visits: formatDistributionInputNumber(
      calculateDistributedVisits(annualVisits, percentage)
    ),
    roleAllocations: [],
  };
}

export function createRoleAllocation(
  primaryRole: string,
  secondaryRole?: string,
  rolePercentage = "0"
): OoRoleAllocation {
  return {
    id: `role-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    primaryRoleCategory: primaryRole,
    secondaryRoleCategory: secondaryRole,
    rolePercentage,
  };
}

export function mapSavedDistributionToDraft(
  row: SavedOoDistributionRow,
  productionRows?: OutpatientProductionRow[]
): OoDistributionDraftRow {
  const selectedProductionRow = productionRows?.find(
    (productionRow) => productionRow.id === row.production_row_id
  );
  const savedPercentage =
    row.distribution_percentage === null ||
    row.distribution_percentage === undefined
      ? "0"
      : String(row.distribution_percentage);
  const savedVisits =
    row.visits === null || row.visits === undefined
      ? formatDistributionInputNumber(
          calculateDistributedVisits(
            selectedProductionRow ? getAnnualVisits(selectedProductionRow) : 0,
            savedPercentage
          )
        )
      : String(row.visits);

  return {
    id: `saved-${row.id}`,
    savedId: row.id,
    productionRowId:
      productionRows?.some((productionRow) => productionRow.id === row.production_row_id)
        ? row.production_row_id
        : null,
    careUnitId: row.care_unit_id ?? getCareUnitOptionId(row.care_unit),
    careUnit: row.care_unit ?? "",
    percentage: savedPercentage,
    visits: savedVisits,
    roleAllocations: [],
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

  if (
    rows.some(
      (row) => toNumber(row.percentage) < 0 || toNumber(row.visits) < 0
    )
  ) {
    return "Andel eller vårdhändelser kan inte vara negativt.";
  }

  if (
    rows.some(
      (row) =>
        (toNumber(row.percentage) > 0 || toNumber(row.visits) > 0) &&
        (!row.careUnitId.trim() || !row.careUnit.trim())
    )
  ) {
    return "Ange vårdande enhet för alla rader med andel.";
  }

  const totalVisits = getAnnualVisits(productionRow);
  const distributedVisits = rows.reduce(
    (sum, row) => sum + toNumber(row.visits),
    0
  );
  const percentageTotal = totalVisits
    ? calculateDistributionPercentage(totalVisits, distributedVisits)
    : rows.reduce((sum, row) => sum + toNumber(row.percentage), 0);

  if (Math.abs(percentageTotal - 100) > 0.01) {
    return "Fördelningen måste summera till 100%.";
  }

  return "";
}

export function validateOoDistributionForAllRoles(
  rows: OoDistributionDraftRow[],
  productionRows: OutpatientProductionRow[]
): string {
  if (rows.length === 0) {
    return "Lägg till minst en vårdande enhet.";
  }

  if (productionRows.length === 0) {
    return "Inga yrkeskategorier valda.";
  }

  if (
    rows.some(
      (row) => toNumber(row.percentage) < 0 || toNumber(row.visits) < 0
    )
  ) {
    return "Andel eller vårdhändelser kan inte vara negativt.";
  }

  if (
    rows.some(
      (row) =>
        (toNumber(row.percentage) > 0 || toNumber(row.visits) > 0) &&
        !row.productionRowId
    )
  ) {
    return "Välj yrkeskategori för alla rader med andel.";
  }

  if (
    rows.some(
      (row) =>
        (toNumber(row.percentage) > 0 || toNumber(row.visits) > 0) &&
        (!row.careUnitId.trim() || !row.careUnit.trim())
    )
  ) {
    return "Ange vårdande enhet för alla rader med andel.";
  }

  for (const productionRow of productionRows) {
    const matchingRows = rows.filter(
      (row) => row.productionRowId === productionRow.id
    );
    const totalVisits = getAnnualVisits(productionRow);
    const distributedVisits = matchingRows.reduce(
      (sum, row) => sum + toNumber(row.visits),
      0
    );
    const percentageTotal = totalVisits
      ? calculateDistributionPercentage(totalVisits, distributedVisits)
      : matchingRows.reduce((sum, row) => sum + toNumber(row.percentage), 0);

    if (Math.abs(percentageTotal - 100) > 0.01) {
      const primaryRole = productionRow.primary_role_category || "Ej angiven";
      const secondaryRole = productionRow.secondary_role_category
        ? ` + ${productionRow.secondary_role_category}`
        : "";

      return `Fördelningen för ${primaryRole}${secondaryRole} måste summera till 100%.`;
    }
  }

  return "";
}

function getCareUnitOptionId(careUnit: string | null): string {
  return (
    careUnitOptions.find((option) => option.name === careUnit)?.id ?? ""
  );
}
