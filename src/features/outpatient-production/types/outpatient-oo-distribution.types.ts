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
