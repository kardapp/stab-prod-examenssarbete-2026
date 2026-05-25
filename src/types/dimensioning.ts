export type DimensioningResult = {
  roleCategory: string;
  visitsPerWeek: number;
  averageMinutesPerVisit: number;
  weeklyWorkHours: number;
  presenceNeed: number;
};

export type OutpatientDimensioningResult = {
  productionPresence: number;
  adminPresence: number;
  totalPresence: number;
  staffingCost: number;
};
