export type ProductionPlanningPeriodization = "year" | "week" | "day";

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

export type ProductionPlanningVisitTimeComment = {
  id: string;
  averageMinutesPerVisit: number;
  comment: string;
  economicKombika: string;
  rowLabels: string[];
  visitType: string;
};

export type ProductionPlanningComparisonRow = {
  id: string;
  economicKombikaId: string;
  economicKombikaName: string;
  year: string;
  currentVisits: number;
  previousYearVisits: number;
  difference: number;
  percentageDifference: number | null;
  source: string;
};
