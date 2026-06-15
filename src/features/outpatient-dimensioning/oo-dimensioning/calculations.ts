import type { OutpatientProductionRow } from "@/shared/types/production";
import {
  formatRoleDistributionLabel,
  getAnnualVisits,
  toNumber,
} from "@/features/outpatient-production/utils/outpatient-production-calculations";
import type { SavedOoDistributionRow } from "@/features/outpatient-production/types/outpatient-oo-distribution.types";
import type { WeeklyCurveSourceRow } from "@/features/outpatient-production/sections/periodization-curve/periodization-curve-model";
import type {
  OoAdminOtherTimeState,
  OoCareSupportRow,
  OoDimensioningBasis,
  OoDimensioningProductionRow,
  OoDimensioningSettings,
  OoDimensioningSummary,
  WeekdayField,
} from "./types";

export const WEEKS_PER_YEAR = 52;
export const DEFAULT_WEEKLY_WORKING_HOURS = 40;
export const DEFAULT_SALARY_COST_PER_PRESENCE = 650000;

export type OoDimensioningResultPayloadRow = {
  productionRowId: number | null;
  distributionId: number | null;
  rowType: "production" | "care_support" | "admin_other";
  rowKey: string;
  kombikaId: string;
  roleCategory: string;
  competenceLevel: string;
  economicSection: string;
  careCostCenter: string;
  sourcePeriod: string;
  careType: "mottagning" | "dagvard";
  productionPresence: number;
  adminOtherPresence: number;
  nonContributingPresence: number;
  totalPresence: number;
  salaryCostPerPresence: number;
  staffingCost: number;
  visits: number;
  drgTotal: number;
};

export const weekdayFields: Array<{
  field: WeekdayField;
  label: string;
  shortLabel: string;
}> = [
  { field: "mondayVisits", label: "Måndag", shortLabel: "Mån" },
  { field: "tuesdayVisits", label: "Tisdag", shortLabel: "Tis" },
  { field: "wednesdayVisits", label: "Onsdag", shortLabel: "Ons" },
  { field: "thursdayVisits", label: "Torsdag", shortLabel: "Tor" },
  { field: "fridayVisits", label: "Fredag", shortLabel: "Fre" },
  { field: "saturdayVisits", label: "Lördag", shortLabel: "Lör" },
  { field: "sundayVisits", label: "Söndag", shortLabel: "Sön" },
];

export function buildOoProductionRows(
  productionRows: OutpatientProductionRow[],
  distributions: SavedOoDistributionRow[]
): OoDimensioningProductionRow[] {
  const distributionsByProductionRowId = new Map<
    number,
    SavedOoDistributionRow[]
  >();

  distributions.forEach((distribution) => {
    const currentRows =
      distributionsByProductionRowId.get(distribution.production_row_id) ?? [];
    distributionsByProductionRowId.set(distribution.production_row_id, [
      ...currentRows,
      distribution,
    ]);
  });

  return productionRows.flatMap((productionRow) => {
    const matchingDistributions =
      distributionsByProductionRowId.get(productionRow.id) ?? [];

    if (matchingDistributions.length === 0) {
      return [createOoProductionRow(productionRow, null)];
    }

    return matchingDistributions.map((distribution) =>
      createOoProductionRow(productionRow, distribution)
    );
  });
}

export function calculateProductionHours(
  visits: number,
  averageMinutesPerVisit: number
) {
  return (visits * averageMinutesPerVisit) / 60;
}

export function calculateTotalHours(params: {
  productionHours: number;
  careSupportHours: number;
  adminHours: number;
  trainingHours: number;
  competenceDevelopmentHours: number;
  otherHours: number;
}) {
  return (
    params.productionHours +
    params.careSupportHours +
    params.adminHours +
    params.trainingHours +
    params.competenceDevelopmentHours +
    params.otherHours
  );
}

export function calculateProductionPresence(
  totalHours: number,
  weeklyWorkingHours: number
) {
  if (weeklyWorkingHours <= 0) {
    return 0;
  }

  return totalHours / weeklyWorkingHours;
}

export function calculateStaffingCost(
  salaryCostPerPresence: number,
  presence: number
) {
  return salaryCostPerPresence * presence;
}

export function calculateOoDimensioningSummary(params: {
  productionRows: OoDimensioningProductionRow[];
  careSupportRows: OoCareSupportRow[];
  adminOtherTime: OoAdminOtherTimeState;
  settings: OoDimensioningSettings;
}): OoDimensioningSummary {
  const weeklyVisits = params.productionRows.reduce(
    (sum, row) => sum + calculateWeeklyVisits(row),
    0
  );
  const supportVisits = params.productionRows.reduce(
    (sum, row) => sum + toNumber(row.supportVisitsForOtherRoles),
    0
  );
  const productionHours = params.productionRows.reduce(
    (sum, row) =>
      sum +
      calculateProductionHours(
        calculateWeeklyVisits(row) + toNumber(row.supportVisitsForOtherRoles),
        toNumber(row.averageMinutesPerVisit)
      ),
    0
  );
  const careSupportHours = params.careSupportRows.reduce(
    (sum, row) => sum + toNumber(row.careSupportHoursPerWeek),
    0
  );
  const adminHours = toNumber(params.adminOtherTime.adminHoursPerWeek);
  const trainingHours = toNumber(params.adminOtherTime.trainingHoursPerWeek);
  const competenceDevelopmentHours = toNumber(
    params.adminOtherTime.competenceDevelopmentHoursPerWeek
  );
  const otherHours = toNumber(params.adminOtherTime.otherHoursPerWeek);
  const totalHours = calculateTotalHours({
    productionHours,
    careSupportHours,
    adminHours,
    trainingHours,
    competenceDevelopmentHours,
    otherHours,
  });
  const weeklyWorkingHours = toNumber(params.settings.weeklyWorkingHours);
  const productionPresence = calculateProductionPresence(
    productionHours,
    weeklyWorkingHours
  );
  const totalPresence = calculateProductionPresence(
    totalHours,
    weeklyWorkingHours
  );

  return {
    weeklyVisits,
    supportVisits,
    productionHours,
    careSupportHours,
    adminHours,
    trainingHours,
    competenceDevelopmentHours,
    otherHours,
    totalHours,
    productionPresence,
    totalPresence,
    staffingCost: calculateStaffingCost(
      toNumber(params.settings.salaryCostPerPresence),
      totalPresence
    ),
  };
}

export function calculateOoDimensioningBasis(
  rows: OoDimensioningProductionRow[]
): OoDimensioningBasis {
  const totalAnnualVisits = rows.reduce(
    (sum, row) => sum + row.visitsFromProductionPlan,
    0
  );
  const totalWeeklyVisits = rows.reduce(
    (sum, row) => sum + calculateWeeklyVisits(row),
    0
  );
  const weightedMinutes = rows.reduce(
    (sum, row) =>
      sum + row.visitsFromProductionPlan * row.sourceAverageMinutesPerVisit,
    0
  );

  return {
    economicKombika: uniqueTexts(rows.map((row) => row.economicKombika)).join(
      ", "
    ),
    careUnits: uniqueTexts(rows.map((row) => row.careUnit)),
    year: "",
    roleCategories: uniqueTexts(rows.map((row) => row.roleCategory)),
    totalAnnualVisits,
    totalWeeklyVisits,
    averageMinutesPerVisit:
      totalAnnualVisits > 0 ? weightedMinutes / totalAnnualVisits : 0,
    visitTimeComments: uniqueTexts(rows.map((row) => row.visitTimeComment)),
  };
}

export function calculateWeeklyVisits(row: OoDimensioningProductionRow) {
  return weekdayFields.reduce((sum, item) => sum + toNumber(row[item.field]), 0);
}

export function calculateSalaryCostPerPresence(
  productionRows: OutpatientProductionRow[]
) {
  const values = productionRows
    .map((row) => ({
      value: toNumber(row.r12_salary_cost_per_presence),
      weight: getAnnualVisits(row),
    }))
    .filter((row) => row.value > 0);
  const weightSum = values.reduce((sum, row) => sum + row.weight, 0);

  if (values.length === 0) {
    return DEFAULT_SALARY_COST_PER_PRESENCE;
  }

  if (weightSum <= 0) {
    return values.reduce((sum, row) => sum + row.value, 0) / values.length;
  }

  return (
    values.reduce((sum, row) => sum + row.value * row.weight, 0) / weightSum
  );
}

export function buildOoPeriodizationRows(params: {
  productionRows: OoDimensioningProductionRow[];
  careSupportRows: OoCareSupportRow[];
  adminOtherTime: OoAdminOtherTimeState;
}): WeeklyCurveSourceRow[] {
  const productionCurveRows = params.productionRows.map((row) => {
    const weeklyVisits =
      calculateWeeklyVisits(row) + toNumber(row.supportVisitsForOtherRoles);
    const weeklyProductionHours = calculateProductionHours(
      weeklyVisits,
      toNumber(row.averageMinutesPerVisit)
    );

    return {
      id: `oo-production-${row.id}`,
      careUnitName: row.careUnit,
      roleCategory: row.roleCategory,
      visits: weeklyVisits * WEEKS_PER_YEAR,
      totalVisitMinutes: weeklyProductionHours * 60 * WEEKS_PER_YEAR,
      drgPoints: 0,
    };
  });
  const supportCurveRows = params.careSupportRows
    .filter((row) => toNumber(row.careSupportHoursPerWeek) > 0)
    .map((row) => ({
      id: `oo-support-${row.id}`,
      careUnitName: "Vårdnära stöd",
      roleCategory: row.careSupportRole || "Stödresurs",
      visits: 0,
      totalVisitMinutes:
        toNumber(row.careSupportHoursPerWeek) * 60 * WEEKS_PER_YEAR,
      drgPoints: 0,
    }));
  const adminCurveRows = [
    {
      id: "oo-admin",
      careUnitName: "Admin och övrig tid",
      roleCategory: "Admin",
      visits: 0,
      totalVisitMinutes:
        toNumber(params.adminOtherTime.adminHoursPerWeek) * 60 * WEEKS_PER_YEAR,
      drgPoints: 0,
    },
    {
      id: "oo-training",
      careUnitName: "Admin och övrig tid",
      roleCategory: "Inskolning",
      visits: 0,
      totalVisitMinutes:
        toNumber(params.adminOtherTime.trainingHoursPerWeek) *
        60 *
        WEEKS_PER_YEAR,
      drgPoints: 0,
    },
    {
      id: "oo-competence",
      careUnitName: "Admin och övrig tid",
      roleCategory: "Kompetensutveckling",
      visits: 0,
      totalVisitMinutes:
        toNumber(params.adminOtherTime.competenceDevelopmentHoursPerWeek) *
        60 *
        WEEKS_PER_YEAR,
      drgPoints: 0,
    },
    {
      id: "oo-other",
      careUnitName: "Admin och övrig tid",
      roleCategory: "Övrig tid",
      visits: 0,
      totalVisitMinutes:
        toNumber(params.adminOtherTime.otherHoursPerWeek) * 60 * WEEKS_PER_YEAR,
      drgPoints: 0,
    },
  ].filter((row) => row.totalVisitMinutes > 0);

  return [...productionCurveRows, ...supportCurveRows, ...adminCurveRows];
}

export function buildOoDimensioningResultRows(params: {
  productionRows: OoDimensioningProductionRow[];
  rawProductionRows: OutpatientProductionRow[];
  careSupportRows: OoCareSupportRow[];
  adminOtherTime: OoAdminOtherTimeState;
  settings: OoDimensioningSettings;
}): OoDimensioningResultPayloadRow[] {
  const sourceRowsById = new Map(
    params.rawProductionRows.map((row) => [row.id, row])
  );
  const weeklyWorkingHours =
    toNumber(params.settings.weeklyWorkingHours) || DEFAULT_WEEKLY_WORKING_HOURS;
  const salaryCostPerPresence = toNumber(params.settings.salaryCostPerPresence);
  const sourcePeriod = getSourcePeriod(params.rawProductionRows);
  const productionRows = params.productionRows.map((row) => {
    const sourceRow = sourceRowsById.get(row.productionRowId);
    const weeklyVisits =
      calculateWeeklyVisits(row) + toNumber(row.supportVisitsForOtherRoles);
    const weeklyProductionHours = calculateProductionHours(
      weeklyVisits,
      toNumber(row.averageMinutesPerVisit)
    );
    const productionPresence = calculateProductionPresence(
      weeklyProductionHours,
      weeklyWorkingHours
    );

    return createResultPayloadRow({
      productionRowId: row.productionRowId,
      distributionId: row.distributionId,
      rowType: "production",
      rowKey: `production-${row.id}`,
      kombikaId: sourceRow?.kombika_pf_id ?? "",
      roleCategory: row.roleCategory || "OO-produktion",
      economicSection: formatEconomicSection(row, sourceRow),
      careCostCenter: row.careUnit || "Ej fördelad",
      sourcePeriod: formatProductionPeriod(sourceRow) || sourcePeriod,
      productionPresence,
      adminOtherPresence: 0,
      salaryCostPerPresence,
      visits: weeklyVisits * WEEKS_PER_YEAR,
    });
  });
  const careSupportRows = params.careSupportRows
    .filter((row) => toNumber(row.careSupportHoursPerWeek) > 0)
    .map((row) => {
      const adminOtherPresence = calculateProductionPresence(
        toNumber(row.careSupportHoursPerWeek),
        weeklyWorkingHours
      );

      return createResultPayloadRow({
        productionRowId: null,
        distributionId: null,
        rowType: "care_support",
        rowKey: `care-support-${row.id}`,
        kombikaId: "",
        roleCategory: row.careSupportRole || "Vårdnära stöd",
        economicSection: "Vårdnära stöd",
        careCostCenter: "Vårdnära stöd",
        sourcePeriod,
        productionPresence: 0,
        adminOtherPresence,
        salaryCostPerPresence,
        visits: 0,
      });
    });
  const adminRows = [
    createAdminResultRow({
      key: "admin",
      label: "Admin",
      hours: params.adminOtherTime.adminHoursPerWeek,
      sourcePeriod,
      salaryCostPerPresence,
      weeklyWorkingHours,
    }),
    createAdminResultRow({
      key: "training",
      label: "Inskolning",
      hours: params.adminOtherTime.trainingHoursPerWeek,
      sourcePeriod,
      salaryCostPerPresence,
      weeklyWorkingHours,
    }),
    createAdminResultRow({
      key: "competence-development",
      label: "Kompetensutveckling",
      hours: params.adminOtherTime.competenceDevelopmentHoursPerWeek,
      sourcePeriod,
      salaryCostPerPresence,
      weeklyWorkingHours,
    }),
    createAdminResultRow({
      key: "other",
      label: "Övrig tid",
      hours: params.adminOtherTime.otherHoursPerWeek,
      sourcePeriod,
      salaryCostPerPresence,
      weeklyWorkingHours,
    }),
  ].filter((row): row is OoDimensioningResultPayloadRow => Boolean(row));

  return [...productionRows, ...careSupportRows, ...adminRows];
}

function createOoProductionRow(
  productionRow: OutpatientProductionRow,
  distribution: SavedOoDistributionRow | null
): OoDimensioningProductionRow {
  const annualVisits = getAnnualVisits(productionRow);
  const distributedVisits = distribution
    ? getDistributionVisits(annualVisits, distribution)
    : annualVisits;
  const averageMinutesPerVisit = toNumber(productionRow.average_minutes_per_visit);
  const weeklyVisits = distributedVisits / WEEKS_PER_YEAR;
  const weekdayVisitShare = weeklyVisits / 5;

  return {
    id: distribution
      ? `${productionRow.id}-${distribution.id}`
      : `${productionRow.id}-not-distributed`,
    productionRowId: productionRow.id,
    distributionId: distribution?.id ?? null,
    roleCategory: formatRoleDistributionLabel(
      productionRow.primary_role_category ?? "Ej angiven",
      productionRow.secondary_role_category ?? undefined
    ),
    economicKombika: [productionRow.kombika_pf_id, productionRow.kombika_pf]
      .filter(Boolean)
      .join(" - "),
    careUnit: distribution?.care_unit ?? "Ej fördelad",
    visitsFromProductionPlan: distributedVisits,
    supportVisitsForOtherRoles: 0,
    averageMinutesPerVisit,
    sourceAverageMinutesPerVisit: averageMinutesPerVisit,
    visitTimeComment: productionRow.visit_time_comment?.trim() ?? "",
    mondayVisits: weekdayVisitShare,
    tuesdayVisits: weekdayVisitShare,
    wednesdayVisits: weekdayVisitShare,
    thursdayVisits: weekdayVisitShare,
    fridayVisits: weekdayVisitShare,
    saturdayVisits: 0,
    sundayVisits: 0,
  };
}

function createAdminResultRow(params: {
  key: string;
  label: string;
  hours: number;
  sourcePeriod: string;
  salaryCostPerPresence: number;
  weeklyWorkingHours: number;
}): OoDimensioningResultPayloadRow | null {
  const hours = toNumber(params.hours);

  if (hours <= 0) {
    return null;
  }

  return createResultPayloadRow({
    productionRowId: null,
    distributionId: null,
    rowType: "admin_other",
    rowKey: `admin-other-${params.key}`,
    kombikaId: "",
    roleCategory: params.label,
    economicSection: "Admin och övrig tid",
    careCostCenter: "Admin och övrig tid",
    sourcePeriod: params.sourcePeriod,
    productionPresence: 0,
    adminOtherPresence: calculateProductionPresence(
      hours,
      params.weeklyWorkingHours
    ),
    salaryCostPerPresence: params.salaryCostPerPresence,
    visits: 0,
  });
}

function createResultPayloadRow(params: {
  productionRowId: number | null;
  distributionId: number | null;
  rowType: OoDimensioningResultPayloadRow["rowType"];
  rowKey: string;
  kombikaId: string;
  roleCategory: string;
  economicSection: string;
  careCostCenter: string;
  sourcePeriod: string;
  productionPresence: number;
  adminOtherPresence: number;
  salaryCostPerPresence: number;
  visits: number;
}): OoDimensioningResultPayloadRow {
  const totalPresence =
    params.productionPresence + params.adminOtherPresence;

  return {
    productionRowId: params.productionRowId,
    distributionId: params.distributionId,
    rowType: params.rowType,
    rowKey: params.rowKey,
    kombikaId: params.kombikaId,
    roleCategory: params.roleCategory,
    competenceLevel: "OO",
    economicSection: params.economicSection,
    careCostCenter: params.careCostCenter,
    sourcePeriod: params.sourcePeriod,
    careType: "mottagning",
    productionPresence: params.productionPresence,
    adminOtherPresence: params.adminOtherPresence,
    nonContributingPresence: 0,
    totalPresence,
    salaryCostPerPresence: params.salaryCostPerPresence,
    staffingCost: totalPresence * params.salaryCostPerPresence,
    visits: params.visits,
    drgTotal: 0,
  };
}

function formatEconomicSection(
  row: OoDimensioningProductionRow,
  sourceRow: OutpatientProductionRow | undefined
): string {
  return (
    row.economicKombika ||
    [sourceRow?.kombika_pf_id, sourceRow?.section ?? sourceRow?.kombika_pf]
      .filter(Boolean)
      .join(" - ") ||
    "Saknas"
  );
}

function getSourcePeriod(rows: OutpatientProductionRow[]): string {
  return (
    rows.map(formatProductionPeriod).find((period) => period.length > 0) ||
    "Saknas"
  );
}

function formatProductionPeriod(
  row: OutpatientProductionRow | undefined
): string {
  if (!row) {
    return "";
  }

  if (row.production_plan_year) {
    return String(row.production_plan_year);
  }

  return row.period_value ?? "";
}

function getDistributionVisits(
  annualVisits: number,
  distribution: SavedOoDistributionRow
): number {
  if (distribution.visits !== null && distribution.visits !== undefined) {
    return toNumber(distribution.visits);
  }

  return (
    (annualVisits * toNumber(distribution.distribution_percentage)) / 100
  );
}

function uniqueTexts(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((first, second) =>
    first.localeCompare(second, "sv")
  );
}
