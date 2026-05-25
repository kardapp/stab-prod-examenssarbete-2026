"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
} from "@mui/material";
import { PageHeader } from "@/shared/components/page-header";
import { SectionCard } from "@/shared/components/section-card";
import { PeriodizationCurveSection } from "@/features/outpatient-production/sections/periodization-curve-section";
import { AdminOtherTimeSection } from "./admin-other-time-section";
import { CalculatedPresenceSection } from "./calculated-presence-section";
import { CareSupportSection } from "./care-support-section";
import { ProductionTimeByRoleSection } from "./production-time-by-role-section";
import { StaffingCostSection } from "./staffing-cost-section";
import { useOutpatientOoDimensioning } from "./use-outpatient-oo-dimensioning";

export function OutpatientOoDimensioningView() {
  const dimensioning = useOutpatientOoDimensioning();

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", bgcolor: "var(--page-background)", p: 2 }}
    >
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <PageHeader
            overline="Dimensionering OO ÖPV"
            title="Dimensionering vårdande enhet öppenvård"
          />

          {dimensioning.isLoading ? (
            <SectionCard>
              <CircularProgress />
            </SectionCard>
          ) : dimensioning.errorMessage ? (
            <Alert severity="error">{dimensioning.errorMessage}</Alert>
          ) : dimensioning.productionRows.length === 0 ? (
            <Alert severity="info">
              Det finns inga aktuella OO-fördelade produktionsrader att
              dimensionera. Spara produktionsplaneringen och fördela till OO
              först.
            </Alert>
          ) : (
            <Stack spacing={2}>
              <ProductionTimeByRoleSection
                basis={dimensioning.basis}
                rows={dimensioning.productionRows}
                onRowChange={dimensioning.updateProductionRow}
              />

              <CareSupportSection
                rows={dimensioning.careSupportRows}
                onAddRow={dimensioning.addCareSupportRow}
                onRemoveRow={dimensioning.removeCareSupportRow}
                onRowChange={dimensioning.updateCareSupportRow}
              />

              <AdminOtherTimeSection
                value={dimensioning.adminOtherTime}
                onChange={dimensioning.updateAdminOtherTime}
              />

              <CalculatedPresenceSection
                settings={dimensioning.settings}
                summary={dimensioning.summary}
                onSettingsChange={dimensioning.updateSettings}
              />

              <StaffingCostSection
                settings={dimensioning.settings}
                summary={dimensioning.summary}
                onSettingsChange={dimensioning.updateSettings}
              />

              <PeriodizationCurveSection
                rows={dimensioning.periodizationRows}
                overline="6. Periodisering över året"
                title="Personalbehov per vecka"
                description="Dimensioneringen periodiseras med samma veckokurva som produktionsresultatet och kan justeras med planerade händelser."
                emptyText="Periodiseringskurvan visas när det finns OO-dimensionering att räkna på."
                showDrg={false}
              />

              <ActionsSection
                saveMessage={dimensioning.saveMessage}
                onSave={dimensioning.saveDimensioning}
              />
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

function ActionsSection(props: {
  saveMessage: string;
  onSave: () => void | Promise<void>;
}) {
  return (
    <SectionCard>
      <Stack spacing={2}>
        {props.saveMessage ? (
          <Alert severity="success">{props.saveMessage}</Alert>
        ) : null}
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button type="button" variant="contained" onClick={props.onSave}>
            Spara dimensionering OO
          </Button>
          <Button
            type="button"
            variant="outlined"
            href="/outpatient/production/oo-distribution"
          >
            Tillbaka till OO-fördelning
          </Button>
          <Button
            type="button"
            variant="outlined"
            href="/outpatient/dimensioning/results-dimensioning"
          >
            Gå till resultat
          </Button>
        </Box>
      </Stack>
    </SectionCard>
  );
}
