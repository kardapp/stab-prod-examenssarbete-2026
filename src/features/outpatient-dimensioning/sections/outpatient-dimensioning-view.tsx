"use client";

import { Alert, Box, CircularProgress, Container, Stack } from "@mui/material";
import { PageHeader } from "@/shared/components/page-header";
import { SectionCard } from "@/shared/components/section-card";
import { DimensioningActions } from "../components/dimensioning-actions";
import { DimensioningComparisonValues } from "../components/dimensioning-comparison-values";
import { DimensioningCompetenceLevels } from "../components/dimensioning-competence-levels";
import { useOutpatientDimensioning } from "../hooks/use-outpatient-dimensioning";

export function OutpatientDimensioningView() {
  const dimensioning = useOutpatientDimensioning();
  const values = dimensioning.dimensioningValues;

  return (
    <Box component="main" sx={{ minHeight: "100vh", bgcolor: "#ffffff", p: 2 }}>
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <PageHeader title="Dimensionering ME ÖPV" />

          {dimensioning.isLoading ? (
            <SectionCard>
              <CircularProgress />
            </SectionCard>
          ) : dimensioning.errorMessage ? (
            <Alert severity="error">{dimensioning.errorMessage}</Alert>
          ) : (
            <Stack spacing={2}>
              <Box sx={mainGridSx}>
                <DimensioningCompetenceLevels
                  assumptions={dimensioning.assumptions}
                  competenceLevels={dimensioning.competenceLevels}
                  totalVisits={values.currentYearPlan}
                  totalVisitMinutes={values.totalVisitMinutes}
                  productionPresence={values.productionPresence}
                  percentageSum={values.competencePercentageSum}
                  hasInvalidSplit={values.hasInvalidCompetenceSplit}
                  onAssumptionChange={dimensioning.handleAssumptionChange}
                  onCompetenceChange={dimensioning.handleCompetenceChange}
                />

                <DimensioningComparisonValues
                  currentYearPlan={values.currentYearPlan}
                  r12Outcome={values.r12Outcome}
                  previousYearOutcome={values.previousYearOutcome}
                  previousDimensioningPresence={
                    values.previousDimensioningPresence
                  }
                />
              </Box>

              <DimensioningActions />
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

const mainGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2fr) minmax(280px, 1fr)" },
  gap: 2,
  alignItems: "start",
};
