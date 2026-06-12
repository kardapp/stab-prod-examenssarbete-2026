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
      />

      <Stack spacing={1.5}>
        <MetricCard
          label="Plan i år"
          value={formatWholeNumber(props.currentYearPlan)}
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
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  p: 1.5,
  bgcolor: "var(--section-background)",
};
