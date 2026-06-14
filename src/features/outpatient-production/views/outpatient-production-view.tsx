"use client";

import { Box, Container, Stack } from "@mui/material";
import { PageHeader } from "@/shared/components/page-header";
import { useOutpatientProductionForm } from "../hooks/use-outpatient-production-form";
import { CalculatedPreviewSection } from "../sections/calculated-preview-section";
import { DistributionSection } from "../sections/distribution-section";
import { KombikaSelectorSection } from "../sections/kombika-selector-section";
import { ProductionActionsSection } from "../sections/production-actions-section";
import { ProductionAssumptionsSection } from "../sections/production-assumptions-section";
import { ProductionHistorySection } from "../sections/production-history-section";
import { ProductionVolumeSection } from "../sections/production-volume-section";

export function OutpatientProductionView() {
  const production = useOutpatientProductionForm();
  const getValidationMessage = (
    key: keyof typeof production.validationErrors
  ) => (production.showValidation ? production.validationErrors[key] : undefined);

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", bgcolor: "var(--page-background)", p: 2 }}
    >
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <PageHeader
            overline="Produktionsplanering öppenvård"
            title="Inmatning produktion per ekonomisk kombika"
          />

          <KombikaSelectorSection
            selectedKombikaId={production.formState.selectedKombikaId}
            selectedKombika={production.selectedKombika}
            validationMessage={getValidationMessage("kombika")}
            onKombikaChange={production.handleKombikaChange}
          />

          {production.selectedKombika ? (
            <Stack spacing={2}>
              <ProductionVolumeSection
                careEvents={production.formState.careEvents}
                validationMessage={getValidationMessage("volume")}
                onCareEventsChange={production.handleCareEventsChange}
              />

              <DistributionSection
                formState={production.formState}
                calculatedValues={production.calculatedValues}
                validationErrors={production.validationErrors}
                showValidation={production.showValidation}
                onPercentageChange={
                  production.handleDistributionPercentageChange
                }
                onRoleDistributionChange={
                  production.handleRoleDistributionChange
                }
                onAddRoleDistribution={production.addRoleDistribution}
                onRemoveRoleDistribution={production.removeRoleDistribution}
              />

              <ProductionAssumptionsSection
                drgAverage={production.formState.drgAverage}
                drgAverageValidationMessage={getValidationMessage(
                  "drgAverage"
                )}
                visitTime={production.formState.visitTime}
                visitTimeValidationMessage={getValidationMessage("visitTime")}
                onDrgAverageChange={production.handleDrgAverageChange}
                onVisitTimeChange={production.handleVisitTimeChange}
              />

              <CalculatedPreviewSection
                calculatedValues={production.calculatedValues}
                visitTimeComment={production.formState.visitTime.comment}
              />

              <ProductionHistorySection
                selectedKombika={production.selectedKombika}
                historyRows={production.productionHistory}
              />

              <ProductionActionsSection
                saveMessage={production.saveMessage}
                saveSeverity={production.saveSeverity}
                dimensioningHref={production.dimensioningHref}
                onSave={production.saveProductionPlan}
              />
            </Stack>
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}
