import { Box, MenuItem, TextField, Typography } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import {
  formatOneDecimal,
  formatTwoDecimals,
} from "@/shared/utils/format-number";
import { buildPeriodizedRows } from "./calculations";
import type {
  OoDimensioningPeriodView,
  OoDimensioningProductionRow,
  OoDimensioningSummary,
} from "./types";

type YearPeriodizationSectionProps = {
  periodView: OoDimensioningPeriodView;
  productionRows: OoDimensioningProductionRow[];
  summary: OoDimensioningSummary;
  weeklyWorkingHours: number;
  onPeriodViewChange: (view: OoDimensioningPeriodView) => void;
};

const periodViewOptions: Array<{
  value: OoDimensioningPeriodView;
  label: string;
}> = [
  { value: "day", label: "Per dag" },
  { value: "week", label: "Per vecka" },
  { value: "month", label: "Per månad" },
];

export function YearPeriodizationSection(props: YearPeriodizationSectionProps) {
  const periodRows = buildPeriodizedRows({
    view: props.periodView,
    summary: props.summary,
    productionRows: props.productionRows,
    weeklyWorkingHours: props.weeklyWorkingHours,
  });
  const maxHours = Math.max(1, ...periodRows.map((row) => row.hours));

  return (
    <SectionCard>
      <FormSection
        overline="6. Periodisering över året"
        title="Fördelning av dimensioneringen"
        description="Välj dag, vecka eller månad för att se hur behovet kan periodiseras utan en bred tabell."
      />

      <Box sx={toolbarSx}>
        <TextField
          select
          label="Vy"
          size="small"
          value={props.periodView}
          onChange={(event) =>
            props.onPeriodViewChange(
              event.target.value as OoDimensioningPeriodView
            )
          }
        >
          {periodViewOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={periodGridSx}>
        {periodRows.map((row) => (
          <Box key={row.id} sx={periodItemSx}>
            <Typography variant="caption" color="text.secondary">
              {row.label}
            </Typography>
            <Box sx={barTrackSx}>
              <Box
                sx={{
                  ...barSx,
                  height: `${Math.max(6, (row.hours / maxHours) * 100)}%`,
                }}
              />
            </Box>
            <Typography sx={{ fontWeight: 700 }}>
              {formatTwoDecimals(row.presence)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatOneDecimal(row.hours)} h · {formatOneDecimal(row.visits)}{" "}
              besök
            </Typography>
          </Box>
        ))}
      </Box>
    </SectionCard>
  );
}

const toolbarSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "minmax(180px, 260px)" },
  mb: 2,
};

const periodGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "repeat(2, minmax(0, 1fr))",
    sm: "repeat(3, minmax(0, 1fr))",
    md: "repeat(4, minmax(0, 1fr))",
    lg: "repeat(6, minmax(0, 1fr))",
    xl: "repeat(8, minmax(0, 1fr))",
  },
  gap: 1,
};

const periodItemSx = {
  border: "1px solid #d0d7de",
  borderRadius: 1,
  bgcolor: "var(--page-background)",
  display: "grid",
  gap: 0.5,
  minHeight: 132,
  p: 1,
};

const barTrackSx = {
  alignItems: "end",
  border: "1px solid #d0d7de",
  borderRadius: 0.5,
  display: "flex",
  height: 42,
  overflow: "hidden",
};

const barSx = {
  bgcolor: "#005883",
  width: "100%",
};
