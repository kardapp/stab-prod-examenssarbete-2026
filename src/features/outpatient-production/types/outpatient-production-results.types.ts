export type ProductionPlanningPeriodization = "year" | "week" | "day";

export type ProductionPlanningResultFilters = {
  periodization: ProductionPlanningPeriodization;
  economicUnit: string;
  careUnit: string;
  roleCategory: string;
};

export type ProductionPlanningResultRow = {
  id: string;
  productionRowId: number;
  economicKombikaId: string;
  economicKombikaName: string;
  economicSection: string;
  careUnitId: string;
  careUnitName: string;
  year: string;
  roleCategory: string;
  visits: number;
  averageMinutesPerVisit: number;
  totalVisitMinutes: number;
  drgAverage: number;
  drgPoints: number;
  isOoDistributed: boolean;
};

export type DrgResultRow = {
  id: string;
  economicKombikaId: string;
  economicKombikaName: string;
  year: string;
  visits: number;
  drgPoints: number;
};

export type ProductionPlanningResultSummary = {
  visits: number;
  totalVisitMinutes: number;
  drgPoints: number;
  undistributedRows: number;
};

export type ProductionPlanningResultOptions = {
  economicUnits: string[];
  careUnits: string[];
  roleCategories: string[];
};
