import { Box, TextField } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import {
  formatOneDecimal,
  formatTwoDecimals,
} from "@/shared/utils/format-number";
import { OoDimensioningMetric } from "./oo-dimensioning-metric";
import type { OoDimensioningSettings, OoDimensioningSummary } from "./types";

type CalculatedPresenceSectionProps = {
  settings: OoDimensioningSettings;
  summary: OoDimensioningSummary;
  onSettingsChange: (field: keyof OoDimensioningSettings, value: number) => void;
};

export function CalculatedPresenceSection(
  props: CalculatedPresenceSectionProps
) {
  return (
    <SectionCard>
      <FormSection
        overline="4. Beräknat resultat"
        title="Timmar och närvaro"
        description="Total tid divideras med veckoarbetstid för att beräkna närvarobehov."
      />

      <Box sx={settingsGridSx}>
        <TextField
          label="Veckoarbetstid"
          type="number"
          size="small"
          value={props.settings.weeklyWorkingHours}
          onChange={(event) =>
            props.onSettingsChange(
              "weeklyWorkingHours",
              Number(event.target.value)
            )
          }
          slotProps={{ htmlInput: { min: 1, step: 0.5 } }}
        />
      </Box>

      <Box sx={metricGridSx}>
        <OoDimensioningMetric
          label="Produktionstid"
          value={`${formatTwoDecimals(props.summary.productionHours)} h/vecka`}
        />
        <OoDimensioningMetric
          label="Vårdnära stöd"
          value={`${formatTwoDecimals(props.summary.careSupportHours)} h/vecka`}
        />
        <OoDimensioningMetric
          label="Admin"
          value={`${formatTwoDecimals(props.summary.adminHours)} h/vecka`}
        />
        <OoDimensioningMetric
          label="Inskolning och kompetens"
          value={`${formatTwoDecimals(
            props.summary.trainingHours +
              props.summary.competenceDevelopmentHours
          )} h/vecka`}
        />
        <OoDimensioningMetric
          label="Total tid"
          value={`${formatTwoDecimals(props.summary.totalHours)} h/vecka`}
        />
        <OoDimensioningMetric
          label="Produktionsnärvaro"
          value={formatTwoDecimals(props.summary.productionPresence)}
          helperText={`${formatOneDecimal(
            props.summary.productionHours
          )} / ${formatOneDecimal(props.settings.weeklyWorkingHours)}`}
        />
        <OoDimensioningMetric
          label="Total närvaro"
          value={formatTwoDecimals(props.summary.totalPresence)}
          helperText={`${formatOneDecimal(
            props.summary.totalHours
          )} / ${formatOneDecimal(props.settings.weeklyWorkingHours)}`}
        />
      </Box>
    </SectionCard>
  );
}

const settingsGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "minmax(180px, 260px)" },
  gap: 1.5,
  mb: 1.5,
};

const metricGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
    xl: "repeat(3, minmax(0, 1fr))",
  },
  gap: 1.5,
};
