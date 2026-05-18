"use client";

import { Alert, Box, CircularProgress, Container, Stack } from "@mui/material";
import { PageHeader } from "@/shared/components/page-header";
import { SectionCard } from "@/shared/components/section-card";
import { DimensioningActions } from "../components/dimensioning-actions";
import { DimensioningBasisSelection } from "../components/dimensioning-basis-selection";
import { DimensioningCompetenceLevels } from "../components/dimensioning-competence-levels";
import { DimensioningProductionBasis } from "../components/dimensioning-production-basis";
import { DimensioningSummaryCard } from "../components/dimensioning-summary-card";
import { useOutpatientDimensioning } from "../hooks/use-outpatient-dimensioning";

export function OutpatientDimensioningView() {
  const dimensioning = useOutpatientDimensioning();

  return (
    <Box component="main" sx={{ minHeight: "100vh", bgcolor: "#ffffff", p: 2 }}>
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
