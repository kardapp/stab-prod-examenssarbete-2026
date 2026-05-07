"use client";

import { Paper, Stack } from "@mui/material";
import { SectionTitle } from "@/components/SectionTitle";
import { MetricCard } from "@/components/MetricCard";
import {
  roundToTwoDecimals,
  roundToWholeNumber,
} from "@/lib/calculations/outpatientDimensioningCalculations";

type DimensioningComparisonPanelProps = {
  currentYearPlan: number;
  r12Outcome: number;
  previousYearOutcome: number;
  previousDimensioningPresence: number;
};

export function DimensioningComparisonPanel(
  props: DimensioningComparisonPanelProps
) {
  return (
    <Paper sx={panelSx}>
      <SectionTitle
        overline="Jämförelse"
        title="Jämförelsevärden"
        description="Stödvärden från mockdata/databas. Dessa är inte primära inputfält."
      />

      <Stack spacing={1.5}>
        <MetricCard
          label="Plan i år"
          value={roundToWholeNumber(props.currentYearPlan)}
        />
        <MetricCard
          label="Utfall R12"
          value={roundToWholeNumber(props.r12Outcome)}
        />
        <MetricCard
          label="Utfall föreg år"
          value={roundToWholeNumber(props.previousYearOutcome)}
        />
        <MetricCard
          label="Dimensionering föregående år"
          value={roundToTwoDecimals(props.previousDimensioningPresence)}
        />
      </Stack>
    </Paper>
  );
}

const panelSx = {
  p: 2,
  border: "1px solid #d0d7de",
  borderRadius: 1,
  boxShadow: "none",
};
