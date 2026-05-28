export type SavedOoDistributionRow = {
  id: number;
  production_row_id: number;
  distribution_order: number;
  care_unit_id: string | null;
  care_unit: string;
  distribution_percentage: string | number | null;
  visits: string | number | null;
};

export type OoDistributionDraftRow = {
  id: string;
  savedId?: number;
  careUnitId: string;
  careUnit: string;
  percentage: string;
  roleAllocations: OoRoleAllocation[];
};

export type OoRoleAllocation = {
  id: string;
  primaryRoleCategory: string;
  secondaryRoleCategory?: string;
  rolePercentage: string;
  roleVisits?: number;
};

export type OoDistributionSaveResponse = {
  status: string;
  distributions: SavedOoDistributionRow[];
};

export type CareUnitOption = {
  id: string;
  name: string;
  label: string;
};
