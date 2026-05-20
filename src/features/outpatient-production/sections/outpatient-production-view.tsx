"use client";

import { Box, Container, Stack } from "@mui/material";
import { PageHeader } from "@/shared/components/page-header";
import { CalculatedPreviewSection } from "./calculated-preview-section";
import { ComparisonValuesSection } from "./comparison-values-section";
import { DistributionSection } from "./distribution-section";
import { DrgAverageSection } from "./drg-average-section";
import { KombikaSelectorSection } from "./kombika-selector-section";
import { ProductionActionsSection } from "./production-actions-section";
import { ProductionVolumeSection } from "./production-volume-section";
import { VisitTimeSection } from "./visit-time-section";
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
                date={production.formState.date}
                careEvents={production.formState.careEvents}
                validationMessage={getValidationMessage("volume")}
                onDateChange={production.handleDateChange}
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

              <VisitTimeSection
                visitTime={production.formState.visitTime}
                validationMessage={getValidationMessage("visitTime")}
                onVisitTimeChange={production.handleVisitTimeChange}
              />

              <DrgAverageSection
                drgAverage={production.formState.drgAverage}
                validationMessage={getValidationMessage("drgAverage")}
                onDrgAverageChange={production.handleDrgAverageChange}
              />

              <ComparisonValuesSection
                selectedKombika={production.selectedKombika}
                comparisonValues={production.comparisonValues}
              />

              <CalculatedPreviewSection
                calculatedValues={production.calculatedValues}
              />

              <ProductionActionsSection
                saveMessage={production.saveMessage}
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
