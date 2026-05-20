export type SavedOoDistributionRow = {
  id: number;
  production_row_id: number;
  distribution_order: number;
  oo_name: string | null;
  care_unit: string;
  care_unit_cost_center: string | null;
  distribution_percentage: string | number | null;
  visits: string | number | null;
  comment: string | null;
};

export type OoDistributionDraftRow = {
  id: string;
  savedId?: number;
  ooName: string;
  careUnit: string;
  careUnitCostCenter: string;
  percentage: string;
  comment: string;
};

export type OoDistributionSaveResponse = {
  status: string;
  distributions: SavedOoDistributionRow[];
};
