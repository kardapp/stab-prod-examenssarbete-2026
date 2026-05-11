"use client";

import { Alert, Box, CircularProgress, Container, Stack } from "@mui/material";
import { PageHeader } from "@/shared/components/page-header";
import { SectionCard } from "@/shared/components/section-card";
import { OutpatientComparisonValues } from "../components/outpatient-comparison-values";
import { OutpatientProductionActions } from "../components/outpatient-production-actions";
import { OutpatientProductionForm } from "../components/outpatient-production-form";
import { OutpatientProductionTable } from "../components/outpatient-production-table";
import { useOutpatientProduction } from "../hooks/use-outpatient-production";

export function OutpatientProductionView() {
  const production = useOutpatientProduction();

  return (
    <Box component="main" sx={{ minHeight: "100vh", bgcolor: "#ffffff", p: 2 }}>
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <PageHeader
            overline="Produktionsplanering öppenvård"
            title="Inmatning produktion per ekonomisk kombika"
          />

          {production.isLoading ? (
            <SectionCard>
              <CircularProgress />
            </SectionCard>
          ) : (
            <Stack spacing={2}>
              {production.errorMessage ? (
                <Alert severity="error">{production.errorMessage}</Alert>
              ) : null}

              <OutpatientProductionForm
                formState={production.formState}
                editingRowId={production.editingRowId}
                isSubmitting={production.isSubmitting}
                onFieldChange={production.handleFieldChange}
                onKombikaChange={production.handleKombikaChange}
                onSubmit={production.handleSubmit}
                onReset={production.resetForm}
              />

              <OutpatientProductionTable
                rows={production.rows}
                onEditRow={production.handleEditRow}
              />

              <OutpatientComparisonValues rows={production.rows} />

              <OutpatientProductionActions />
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
