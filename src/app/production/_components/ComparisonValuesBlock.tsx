"use client";

import { Paper, Stack } from "@mui/material";
import {
  roundToWholeNumber,
} from "@/lib/calculations/outpatientProductionCalculations";
import type { OutpatientProductionRow } from "@/types/production";
import { ProductionMetricRow } from "./ProductionMetricRow";
import { ProductionSectionTitle } from "./ProductionSectionTitle";
import { sumRows } from "./outpatientProductionUtils";

type ComparisonValuesBlockProps = {
  rows: OutpatientProductionRow[];
};

export function ComparisonValuesBlock(props: ComparisonValuesBlockProps) {
  const comparisonItems = [
    {
      label: "Plan föreg år",
      value: sumRows(props.rows, "previous_year_plan"),
    },
    {
      label: "Utfall R12",
      value: sumRows(props.rows, "r12_outcome"),
    },
    {
      label: "Utfall föreg år",
      value: sumRows(props.rows, "previous_year_outcome"),
    },
  ];

  return (
    <Paper sx={panelSx}>
      <ProductionSectionTitle
        overline="Jämförelse"
        title="Jämförelsevärden"
        description="Stöddata från mockdata/databas. Inte manuell inmatning."
      />

      <Stack spacing={1.25}>
        {comparisonItems.map((item) => (
          <ProductionMetricRow
            key={item.label}
            label={item.label}
            value={roundToWholeNumber(item.value)}
          />
        ))}
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
