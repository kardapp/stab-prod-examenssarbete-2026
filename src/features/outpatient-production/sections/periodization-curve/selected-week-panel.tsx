import { Box, Stack, Typography } from "@mui/material";
import {
  formatOneDecimal,
  formatTwoDecimals,
  formatWholeNumber,
} from "@/shared/utils/format-number";
import { PeriodizationMetricValue } from "./periodization-metric-value";
import type { WeeklyCurvePoint } from "./periodization-curve-model";
import { formatSignedPercentage } from "./periodization-curve-model";

type SelectedWeekPanelProps = {
  selectedPoint: WeeklyCurvePoint;
  showDrg?: boolean;
};

export function SelectedWeekPanel(props: SelectedWeekPanelProps) {
  return (
    <Box sx={selectedWeekSx}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        Vecka {props.selectedPoint.week}
      </Typography>
      <Box sx={weekMetricsSx}>
        <PeriodizationMetricValue
          label="Vårdtillfällen"
          value={formatOneDecimal(props.selectedPoint.adjustedVisits)}
        />
        <PeriodizationMetricValue
          label="Besökstid"
          value={`${formatWholeNumber(
            props.selectedPoint.adjustedVisitMinutes
          )} min`}
        />
        {props.showDrg !== false ? (
          <PeriodizationMetricValue
            label="DRG"
            value={formatTwoDecimals(props.selectedPoint.adjustedDrgPoints)}
          />
        ) : null}
        <PeriodizationMetricValue
          label="Personalbehov"
          value={`${formatTwoDecimals(
            props.selectedPoint.adjustedStaffingNeed
          )} heltid`}
        />
        <PeriodizationMetricValue
          label="Påverkan"
          value={`${formatOneDecimal(props.selectedPoint.impactPercentage)}%`}
        />
      </Box>

      <Stack spacing={0.75}>
        {props.selectedPoint.impacts.length > 0 ? (
          props.selectedPoint.impacts.map((impact) => (
            <Typography key={impact.id} variant="body2">
              {impact.name}: {formatSignedPercentage(impact.percentage)}
            </Typography>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            Ingen extra påverkan.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

const selectedWeekSx = {
  border: "1px solid #d0d7de",
  borderRadius: 1,
  bgcolor: "var(--page-background)",
  p: 1.5,
};

const weekMetricsSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(3, minmax(0, 1fr))",
    xl: "1fr",
  },
  gap: 1,
  my: 1.5,
};
