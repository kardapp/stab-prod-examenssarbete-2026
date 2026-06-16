"use client";

import { useMemo } from "react";
import { Alert, Box, CircularProgress, Container, Stack } from "@mui/material";
import type { OutpatientProductionRow } from "@/shared/types/production";
import {
  calculateProductionRowMetrics,
  getAnnualVisits,
} from "@/features/outpatient-production/utils/outpatient-production-calculations";
import { PeriodizationCurveSection } from "@/features/outpatient-production/sections/periodization-curve-section";
import type { WeeklyCurveSourceRow } from "@/features/outpatient-production/sections/periodization-curve/periodization-curve-model";
import { PageHeader } from "@/shared/components/page-header";
import { SectionCard } from "@/shared/components/section-card";
import { DimensioningActions } from "../components/dimensioning-actions";
import { DimensioningBasisSelection } from "../components/dimensioning-basis-selection";
import { DimensioningCompetenceLevels } from "../components/dimensioning-competence-levels";
import { DimensioningProductionBasis } from "../components/dimensioning-production-basis";
import { DimensioningSummaryCard } from "../components/dimensioning-summary-card";
import { useOutpatientDimensioning } from "../hooks/use-outpatient-dimensioning";
import type { DimensioningRowCalculation } from "../types/outpatient-dimensioning.types";

export function OutpatientDimensioningView() {
  const dimensioning = useOutpatientDimensioning();
  const periodizationRows = useMemo(
    () =>
      buildMePeriodizationRows({
        calculations: dimensioning.dimensioningCalculations,
        productionRows: dimensioning.filteredProductionRows,
      }),
    [dimensioning.dimensioningCalculations, dimensioning.filteredProductionRows]
  );

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", bgcolor: "var(--page-background)", p: 2 }}
    >
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <PageHeader title="Dimensionering ME öppenvård" />

          {dimensioning.isLoading ? (
            <SectionCard>
              <CircularProgress />
            </SectionCard>
          ) : dimensioning.errorMessage ? (
            <Alert severity="error">{dimensioning.errorMessage}</Alert>
          ) : (
            <Stack spacing={2}>
              <DimensioningBasisSelection
                selection={dimensioning.selection}
                options={dimensioning.basisOptions}
                onSelectionChange={dimensioning.handleSelectionChange}
              />

              <DimensioningProductionBasis
                rows={dimensioning.filteredProductionRows}
                productionBasis={dimensioning.productionBasis}
              />

              <DimensioningCompetenceLevels
                calculations={dimensioning.dimensioningCalculations}
                careType={dimensioning.selection.careType}
                productionShareSum={dimensioning.productionShareSum}
                isLoading={dimensioning.isDimensioningLoading}
                onRowChange={dimensioning.handleDimensioningRowChange}
              />

              <DimensioningSummaryCard summary={dimensioning.summary} />

              <PeriodizationCurveSection
                rows={periodizationRows}
                overline="Produktionstakt över året"
                title="Produktionstakt per vecka"
                description="ME-dimensioneringen periodiseras över 52 veckor. Klicka på en vecka för att justera produktionstakten för en vald period."
                emptyText="Periodiseringskurvan visas när det finns produktionsdrivet ME-underlag att räkna på."
              />

              <DimensioningActions
                saveMessage={dimensioning.saveMessage}
                isSaving={dimensioning.isSaving}
                onSave={dimensioning.saveDimensioningRows}
              />
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

function buildMePeriodizationRows(params: {
  calculations: DimensioningRowCalculation[];
  productionRows: OutpatientProductionRow[];
}): WeeklyCurveSourceRow[] {
  const averageDrg = calculateAverageDrg(params.productionRows);

  return params.calculations
    .filter(
      (calculation) =>
        calculation.visitsFromProductionPlan > 0 ||
        calculation.totalVisitMinutes > 0
    )
    .map((calculation) => ({
      id: `me-${calculation.row.competenceLevel}`,
      careUnitName: "ME öppenvård",
      roleCategory: calculation.row.competenceLevel,
      visits: calculation.visitsFromProductionPlan,
      totalVisitMinutes: calculation.totalVisitMinutes,
      drgPoints: calculation.visitsFromProductionPlan * averageDrg,
    }));
}

function calculateAverageDrg(rows: OutpatientProductionRow[]): number {
  const totalVisits = rows.reduce((sum, row) => sum + getAnnualVisits(row), 0);

  if (totalVisits <= 0) {
    return 0;
  }

  const totalDrg = rows.reduce(
    (sum, row) => sum + calculateProductionRowMetrics(row).drgPoints,
    0
  );

  return totalDrg / totalVisits;
}
