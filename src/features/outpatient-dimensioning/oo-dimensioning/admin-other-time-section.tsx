import { Box, Typography } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { FormattedNumberTextField } from "@/shared/components/formatted-number-text-field";
import { SectionCard } from "@/shared/components/section-card";
import type { OoAdminOtherTimeState } from "./types";

type AdminOtherTimeSectionProps = {
  value: OoAdminOtherTimeState;
  onChange: (field: keyof OoAdminOtherTimeState, value: number) => void;
};

export function AdminOtherTimeSection(props: AdminOtherTimeSectionProps) {
  return (
    <SectionCard>
      <FormSection
        overline="Steg 3"
        title="Tid utanför direkt produktion"
        description="Admin, inskolning, kompetensutveckling och annan övrig tid läggs till som timmar per vecka."
      />

      <Box sx={groupGridSx}>
        <Box sx={timeGroupSx}>
          <Typography variant="subtitle2" sx={groupTitleSx}>
            Admin
          </Typography>
          <TimeField
            label="Admin timmar/vecka"
            value={props.value.adminHoursPerWeek}
            onChange={(value) => props.onChange("adminHoursPerWeek", value)}
          />
        </Box>

        <Box sx={timeGroupSx}>
          <Typography variant="subtitle2" sx={groupTitleSx}>
            Inskolning och kompetens
          </Typography>
          <Box sx={pairedFieldsSx}>
            <TimeField
              label="Inskolning"
              value={props.value.trainingHoursPerWeek}
              onChange={(value) => props.onChange("trainingHoursPerWeek", value)}
            />
            <TimeField
              label="Kompetensutveckling"
              value={props.value.competenceDevelopmentHoursPerWeek}
              onChange={(value) =>
                props.onChange("competenceDevelopmentHoursPerWeek", value)
              }
            />
          </Box>
        </Box>

        <Box sx={timeGroupSx}>
          <Typography variant="subtitle2" sx={groupTitleSx}>
            Övrigt
          </Typography>
          <TimeField
            label="Övrig tid timmar/vecka"
            value={props.value.otherHoursPerWeek}
            onChange={(value) => props.onChange("otherHoursPerWeek", value)}
          />
        </Box>
      </Box>
    </SectionCard>
  );
}

function TimeField(props: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <FormattedNumberTextField
      label={props.label}
      size="small"
      value={props.value}
      onChange={(event) => props.onChange(Number(event.target.value))}
      slotProps={{ htmlInput: { min: 0, step: 0.25 } }}
      fullWidth
    />
  );
}

const groupGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    lg: "minmax(0, 0.8fr) minmax(0, 1.2fr) minmax(0, 0.8fr)",
  },
  gap: 1.5,
};

const timeGroupSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  bgcolor: "var(--page-background)",
  p: 1.5,
};

const pairedFieldsSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
  gap: 1,
};

const groupTitleSx = {
  color: "#005883",
  fontWeight: 700,
  mb: 1,
};
