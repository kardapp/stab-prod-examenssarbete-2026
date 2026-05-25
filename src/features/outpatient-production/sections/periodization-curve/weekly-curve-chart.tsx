import { Box, Stack, Typography } from "@mui/material";
import type { WeeklyCurvePoint } from "./periodization-curve-model";
import {
  formatWeekTitle,
  getCurveBarColor,
  WEEK_COUNT,
} from "./periodization-curve-model";

type WeeklyCurveChartProps = {
  curvePoints: WeeklyCurvePoint[];
  maxPresence: number;
  selectedWeek: number;
  onSelectWeek: (week: number) => void;
};

export function WeeklyCurveChart(props: WeeklyCurveChartProps) {
  return (
    <Box sx={{ minWidth: 0, overflowX: "auto" }}>
      <Box sx={curveSx}>
        {props.curvePoints.map((point) => {
          const heightPercentage =
            (point.adjustedStaffingNeed / props.maxPresence) * 100;

          return (
            <Box key={point.week} sx={weekColumnSx}>
              <Box sx={barAreaSx}>
                <Box
                  component="button"
                  type="button"
                  aria-label={`Vecka ${point.week}`}
                  title={formatWeekTitle(point)}
                  onClick={() => props.onSelectWeek(point.week)}
                  sx={{
                    ...barButtonSx,
                    bgcolor: getCurveBarColor(point),
                    height: `${Math.max(heightPercentage, 2)}%`,
                    outline:
                      props.selectedWeek === point.week
                        ? "2px solid #111827"
                        : "none",
                  }}
                />
              </Box>
              <Typography variant="caption" sx={weekLabelSx}>
                {point.week % 4 === 0 || point.week === 1 ? point.week : ""}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Box sx={curveLegendSx}>
        <LegendItem color="#005883" label="Basnivå" />
        <LegendItem color="#0f766e" label="Lägre behov" />
        <LegendItem color="#b42318" label="Högre behov" />
      </Box>
    </Box>
  );
}

function LegendItem(props: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
      <Box
        sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: props.color }}
      />
      <Typography variant="caption" color="text.secondary">
        {props.label}
      </Typography>
    </Stack>
  );
}

const curveSx = {
  border: "1px solid #d0d7de",
  borderRadius: 1,
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
  alignItems: "end",
  display: "flex",
  minHeight: 180,
};

const barButtonSx = {
  border: 0,
  borderRadius: "4px 4px 0 0",
  cursor: "pointer",
  minHeight: 4,
  p: 0,
  transition: "background-color 120ms ease, height 120ms ease",
  width: "100%",
};

const weekLabelSx = {
  color: "text.secondary",
  fontSize: "0.68rem",
  lineHeight: "18px",
  textAlign: "center",
};

const curveLegendSx = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1.5,
  mt: 1,
};
