import { Box, Stack, Typography } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import { formatOneDecimal, formatWholeNumber } from "@/shared/utils/format-number";
import { SummaryValueCard } from "../components/summary-value-card";
import type { OutpatientProductionCalculatedValues } from "../types/outpatient-production.types";

type CalculatedPreviewSectionProps = {
  calculatedValues: OutpatientProductionCalculatedValues;
};

export function CalculatedPreviewSection(
  props: CalculatedPreviewSectionProps
) {
  return (
    <SectionCard>
      <FormSection
        overline="Förhandsvisning"
        title="Beräknade värden"
        description="Värdena räknas från årets huvudvolym och procentfördelningarna."
      />

      <Box sx={summaryGridSx}>
        <SummaryValueCard
          label="Total besökstid"
          value={`${formatWholeNumber(
            props.calculatedValues.totalVisitMinutes
          )} min`}
        />
        <SummaryValueCard
          label="Total DRG"
          value={formatOneDecimal(props.calculatedValues.totalDrg)}
        />
        <SummaryValueCard
          label="SLL / UULP"
          value={`${formatOneDecimal(
            props.calculatedValues.sllCareEvents
          )} / ${formatOneDecimal(props.calculatedValues.uulpCareEvents)}`}
          helperText="vårdhändelser"
        />
        <SummaryValueCard
          label="Akut / elektivt"
          value={`${formatOneDecimal(
            props.calculatedValues.acuteCareEvents
          )} / ${formatOneDecimal(props.calculatedValues.electiveCareEvents)}`}
          helperText="vårdhändelser"
        />
        <SummaryValueCard
          label="DRG SLL"
          value={formatOneDecimal(props.calculatedValues.drgSll)}
        />
        <SummaryValueCard
          label="DRG UULP"
          value={formatOneDecimal(props.calculatedValues.drgUulp)}
        />
      </Box>

      <Stack spacing={1} sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Fördelat antal per yrkeskategori
        </Typography>
        {props.calculatedValues.roleDistributionResults.map((role) => (
          <Stack
            key={role.id}
            direction="row"
            spacing={2}
            sx={{
              alignItems: "baseline",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--color-border)",
              pb: 1,
            }}
          >
            <Typography>{role.label}</Typography>
            <Typography sx={{ color: "#005883", fontWeight: 700 }}>
              {formatOneDecimal(role.careEvents)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </SectionCard>
  );
}

const summaryGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(3, minmax(0, 1fr))",
  },
  gap: 1.5,
};
