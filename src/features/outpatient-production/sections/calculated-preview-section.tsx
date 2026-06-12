import { Box, Stack, Typography } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import { formatOneDecimal, formatWholeNumber } from "@/shared/utils/format-number";
import { SummaryValueCard } from "../components/summary-value-card";
import type { OutpatientProductionCalculatedValues } from "../types/outpatient-production.types";

type CalculatedPreviewSectionProps = {
  calculatedValues: OutpatientProductionCalculatedValues;
  visitTimeComment: string;
};

export function CalculatedPreviewSection(
  props: CalculatedPreviewSectionProps
) {
  return (
    <SectionCard>
      <FormSection
        overline="Förhandsvisning"
        title="Beräknade värden"
      />

      <Box sx={summaryGridSx}>
        <SummaryValueCard
          label="Total tid för vårdhändelser"
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

      {props.visitTimeComment.trim() ? (
        <Box sx={commentSx}>
          <Typography variant="caption" color="text.secondary">
            Kommentar tid per vårdhändelse
          </Typography>
          <Typography sx={{ overflowWrap: "anywhere" }}>
            {props.visitTimeComment}
          </Typography>
        </Box>
      ) : null}

      <Stack spacing={1} sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Fördelade vårdhändelser per yrkeskategori
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

const commentSx = {
  bgcolor: "var(--section-background)",
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  display: "grid",
  gap: 0.25,
  mt: 1.5,
  p: 1.5,
};
