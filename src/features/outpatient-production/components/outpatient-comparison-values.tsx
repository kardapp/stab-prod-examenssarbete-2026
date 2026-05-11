"use client";

import { Stack } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import { formatWholeNumber } from "@/shared/utils/format-number";
import type { OutpatientProductionRow } from "@/types/production";
import { sumRows } from "../utils/outpatient-production-calculations";

type OutpatientComparisonValuesProps = {
  rows: OutpatientProductionRow[];
};

export function OutpatientComparisonValues(
  props: OutpatientComparisonValuesProps
) {
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
    <SectionCard>
      <FormSection
        overline="Jämförelse"
        title="Jämförelsevärden"
        description="Stöddata från mockdata/databas. Inte manuell inmatning."
      />

      <Stack spacing={1.25}>
        {comparisonItems.map((item) => (
          <MetricRow
            key={item.label}
            label={item.label}
            value={formatWholeNumber(item.value)}
          />
        ))}
      </Stack>
    </SectionCard>
  );
}

function MetricRow(props: { label: string; value: string }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: "baseline",
        justifyContent: "space-between",
        borderBottom: "1px solid #e5e7eb",
        pb: 1,
      }}
    >
      <span>{props.label}</span>
      <strong style={{ color: "#005883" }}>{props.value}</strong>
    </Stack>
  );
}
