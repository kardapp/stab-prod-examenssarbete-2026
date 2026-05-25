import { Box, TextField } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import {
  formatTwoDecimals,
  formatWholeNumber,
} from "@/shared/utils/format-number";
import { OoDimensioningMetric } from "./oo-dimensioning-metric";
import type { OoDimensioningSettings, OoDimensioningSummary } from "./types";

type StaffingCostSectionProps = {
  settings: OoDimensioningSettings;
  summary: OoDimensioningSummary;
  onSettingsChange: (field: keyof OoDimensioningSettings, value: number) => void;
};

export function StaffingCostSection(props: StaffingCostSectionProps) {
  return (
    <SectionCard>
      <FormSection
        overline="5. Kostnader"
        title="Bemanningskostnad"
        description="Lönekostnad per närvaro hämtas från historik när det finns och kan justeras här."
      />

      <Box sx={costGridSx}>
        <TextField
          label="Lönekostnad per närvaro"
          type="number"
          size="small"
          value={props.settings.salaryCostPerPresence}
          onChange={(event) =>
            props.onSettingsChange(
              "salaryCostPerPresence",
              Number(event.target.value)
            )
          }
          slotProps={{ htmlInput: { min: 0, step: 1000 } }}
        />
        <OoDimensioningMetric
          label="Beräknad närvaro"
          value={formatTwoDecimals(props.summary.productionPresence)}
        />
        <OoDimensioningMetric
          label="Total bemanningskostnad"
          value={`${formatWholeNumber(props.summary.staffingCost)} kr`}
        />
      </Box>
    </SectionCard>
  );
}

const costGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(3, minmax(0, 1fr))",
  },
  gap: 1.5,
  alignItems: "stretch",
};
