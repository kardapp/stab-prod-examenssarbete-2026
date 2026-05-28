"use client";

import { Box, Stack, Typography } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import {
  formatTwoDecimals,
  formatWholeNumber,
} from "@/shared/utils/format-number";
import type { DimensioneringSummary } from "../types/outpatient-dimensioning.types";

type DimensioningSummaryCardProps = {
  summary: DimensioneringSummary;
};

export function DimensioningSummaryCard(props: DimensioningSummaryCardProps) {
  return (
    <SectionCard>
      <FormSection
        overline="Sammanfattning"
        title="Summering dimensionering"
        description="Sammanfattningen uppdateras direkt när dimensioneringsfälten ändras."
      />

      <Box sx={summaryGridSx}>
        <SummaryValue
          label="Total beräknad närvaro"
          value={formatTwoDecimals(props.summary.calculatedPresence)}
        />
        <SummaryValue
          label="Total produktionsnärvaro"
          value={formatTwoDecimals(props.summary.productionPresence)}
        />
        <SummaryValue
          label="Total admin/övrigt"
          value={formatTwoDecimals(props.summary.adminOtherPresence)}
        />
        <SummaryValue
          label="Total ST som inte bidrar"
          value={formatTwoDecimals(props.summary.nonContributingStPresence)}
        />
        <SummaryValue
          label="Total närvaro"
          value={formatTwoDecimals(props.summary.totalPresence)}
        />
        <SummaryValue
          label="Total bemanningskostnad"
          value={`${formatWholeNumber(props.summary.staffingCost)} kr`}
        />
      </Box>
    </SectionCard>
  );
}

function SummaryValue(props: { label: string; value: string }) {
  return (
    <Stack spacing={0.25} sx={summaryValueSx}>
      <Typography variant="caption" color="text.secondary">
        {props.label}
      </Typography>
      <Typography sx={{ color: "#005883", fontWeight: 700 }}>
        {props.value}
      </Typography>
    </Stack>
  );
}

const summaryGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)", xl: "repeat(6, 1fr)" },
  gap: 1.5,
};

const summaryValueSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  p: 1.5,
  bgcolor: "var(--section-background)",
};
