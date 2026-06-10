"use client";

import { Box, Container, Stack } from "@mui/material";
import { PageHeader } from "@/shared/components/page-header";
import { CalculatedPreviewSection } from "./calculated-preview-section";
import { DistributionSection } from "./distribution-section";
import { KombikaSelectorSection } from "./kombika-selector-section";
import { ProductionAssumptionsSection } from "./production-assumptions-section";
import { ProductionActionsSection } from "./production-actions-section";
import { ProductionHistorySection } from "./production-history-section";
import { ProductionVolumeSection } from "./production-volume-section";
import { useOutpatientProductionForm } from "../hooks/use-outpatient-production-form";

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
