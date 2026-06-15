import { Box, Stack, Typography } from "@mui/material";
import type { WeeklyCurvePoint } from "./periodization-curve-model";
import { formatWeekTitle, WEEK_COUNT } from "./periodization-curve-model";

type WeeklyCurveChartProps = {
  curvePoints: WeeklyCurvePoint[];
  maxPresence: number;
  selectedWeek: number | null;
  volumeLabel?: string;
  volumeLabelLower?: string;
  onSelectWeek: (week: number) => void;
};

export function WeeklyCurveChart(props: WeeklyCurveChartProps) {
  return (
    <Box sx={chartFrameSx}>
      <Box sx={chartHeaderSx}>
        <Typography variant="subtitle2" sx={chartTitleSx}>
          Årsöversikt
        </Typography>
        <Box sx={curveLegendSx}>
          <LegendItem color="#005883" label="Bas" />
          <LegendItem color="#3f6f84" label="Lägre" />
          <LegendItem color="#003d5b" label="Högre" />
        </Box>
      </Box>

      <Box sx={chartScrollerSx}>
        <Box sx={curveSx}>
          {props.curvePoints.map((point) => {
            const heightPercentage =
              (point.adjustedStaffingNeed / props.maxPresence) * 100;
            const isSelected = props.selectedWeek === point.week;

            return (
              <Box key={point.week} sx={weekColumnSx}>
                <Box sx={barAreaSx}>
                  <Box sx={barTrackSx}>
                    <Box
                      component="button"
                      type="button"
                      aria-label={`Vecka ${point.week}`}
                      aria-expanded={isSelected}
                      aria-pressed={isSelected}
                      title={formatWeekTitle(
                        point,
                        props.volumeLabelLower,
                        props.volumeLabel
                      )}
                      onClick={() => props.onSelectWeek(point.week)}
                      sx={{
                        ...barButtonSx,
                        bgcolor: getBarColor(point),
                        height: `${Math.max(heightPercentage, 2)}%`,
                        boxShadow: isSelected
                          ? "0 0 0 2px #005883, 0 6px 14px rgba(0, 88, 131, 0.22)"
                          : "none",
                      }}
                    />
                  </Box>
                </Box>
                <Typography
                  variant="caption"
                  sx={weekLabelSx(isSelected)}
                >
                  {point.week % 4 === 0 || point.week === 1 || isSelected
                    ? point.week
                    : ""}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

function LegendItem(props: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
      <Box
        sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: props.color }}
      />
      <Typography variant="caption" color="text.secondary">
        {props.label}
      </Typography>
    </Stack>
  );
}

function getBarColor(point: WeeklyCurvePoint): string {
  if (point.impactPercentage > 0) {
    return "#003d5b";
  }

  if (point.impactPercentage < 0) {
    return "#3f6f84";
  }

  return "#005883";
}

const chartFrameSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  bgcolor: "background.paper",
  overflow: "hidden",
};

const chartHeaderSx = {
  alignItems: { xs: "flex-start", sm: "center" },
  borderBottom: "1px solid var(--color-border)",
  display: "flex",
  gap: 1,
  justifyContent: "space-between",
  px: 1.5,
  py: 1,
};

const chartTitleSx = {
  color: "#005883",
  fontWeight: 700,
};

const chartScrollerSx = {
  overflowX: "auto",
};

const curveSx = {
  bgcolor: "var(--page-background)",
  display: "grid",
  gridTemplateColumns: `repeat(${WEEK_COUNT}, minmax(14px, 1fr))`,
  gap: 0.5,
  minWidth: 860,
  p: 1.5,
};

const weekColumnSx = {
  display: "grid",
  gridTemplateRows: "180px 18px",
  gap: 0.5,
  minWidth: 0,
};

const barAreaSx = {
  minHeight: 180,
};

const barTrackSx = {
  alignItems: "end",
  bgcolor: "rgba(0, 88, 131, 0.06)",
  borderRadius: "5px 5px 0 0",
  display: "flex",
  height: "100%",
  overflow: "hidden",
};

const barButtonSx = {
  appearance: "none",
  border: 0,
  borderRadius: "5px 5px 0 0",
  cursor: "pointer",
  minHeight: 4,
  p: 0,
  transition:
    "background-color 120ms ease, box-shadow 120ms ease, height 120ms ease, transform 120ms ease",
  width: "100%",
  "&:hover": {
    transform: "translateY(-2px)",
  },
  "&:focus-visible": {
    outline: "2px solid #005883",
    outlineOffset: 2,
  },
};

function weekLabelSx(isSelected: boolean) {
  return {
    color: isSelected ? "#005883" : "text.secondary",
    fontSize: "0.68rem",
    fontWeight: isSelected ? 800 : 400,
    lineHeight: "18px",
    textAlign: "center",
  };
}

const curveLegendSx = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1.25,
};
