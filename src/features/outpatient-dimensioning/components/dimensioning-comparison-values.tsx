"use client";

import { Box, Stack, Typography } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import {
  formatTwoDecimals,
  formatWholeNumber,
} from "@/shared/utils/format-number";

type DimensioningComparisonValuesProps = {
  currentYearPlan: number;
  r12Outcome: number;
  previousYearOutcome: number;
  previousDimensioningPresence: number;
};

export function DimensioningComparisonValues(
  props: DimensioningComparisonValuesProps
) {
  return (
    <SectionCard>
      <FormSection
        overline="Jämförelse"
        title="Jämförelsevärden"
        description="Stödvärden från mockdata/databas. Dessa är inte primära inputfält."
      />

      <Stack spacing={1.5}>
        <MetricCard
          label="Plan i år"
          value={formatWholeNumber(props.currentYearPlan)}
        />
        <MetricCard
          label="Utfall R12"
          value={formatWholeNumber(props.r12Outcome)}
        />
        <MetricCard
          label="Utfall föreg år"
          value={formatWholeNumber(props.previousYearOutcome)}
        />
        <MetricCard
          label="Dimensionering föregående år"
          value={formatTwoDecimals(props.previousDimensioningPresence)}
        />
      </Stack>
    </SectionCard>
  );
}

function MetricCard(props: { label: string; value: string }) {
  return (
    <Box sx={metricCardSx}>
      <Typography variant="caption" color="text.secondary">
        {props.label}
      </Typography>
      <Typography sx={{ color: "#005883", fontWeight: 700 }}>
        {props.value}
      </Typography>
    </Box>
  );
}

const metricCardSx = {
  border: "1px solid #d0d7de",
  borderRadius: 1,
  p: 1.5,
  bgcolor: "#f8fbfd",
};
