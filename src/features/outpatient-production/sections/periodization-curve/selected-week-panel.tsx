import { Box, Stack, Typography } from "@mui/material";
import {
  formatOneDecimal,
  formatTwoDecimals,
  formatWholeNumber,
} from "@/shared/utils/format-number";
import type {
  WeeklyCurveDay,
  WeeklyCurvePoint,
} from "./periodization-curve-model";
import {
  formatImpactWeekdays,
  formatSignedPercentage,
} from "./periodization-curve-model";

type SelectedWeekPanelProps = {
  selectedPoint: WeeklyCurvePoint;
  showDrg?: boolean;
  volumeLabel?: string;
};

export function SelectedWeekPanel(props: SelectedWeekPanelProps) {
  const maxDayPresence = Math.max(
    0.01,
    ...props.selectedPoint.days.map((day) => day.adjustedStaffingNeed)
  );
  const impactedDayCount = props.selectedPoint.days.filter(
    (day) => day.impacts.length > 0
  ).length;

  return (
    <Box sx={selectedWeekSx}>
      <Box sx={panelHeaderSx}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Veckosammanställning
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {impactedDayCount} av 7 dagar påverkade
          </Typography>
        </Box>
        <Typography variant="caption" sx={impactBadgeSx}>
          {formatSignedPercentage(props.selectedPoint.impactPercentage)}
        </Typography>
      </Box>

      <Box sx={summaryGridSx}>
        <SummaryValue
          label={props.volumeLabel ?? "Vårdhändelser"}
          value={formatOneDecimal(props.selectedPoint.adjustedVisits)}
        />
        <SummaryValue
          label="Tid"
          value={`${formatWholeNumber(
            props.selectedPoint.adjustedVisitMinutes
          )} min`}
        />
        {props.showDrg !== false ? (
          <SummaryValue
            label="DRG"
            value={formatTwoDecimals(props.selectedPoint.adjustedDrgPoints)}
          />
        ) : null}
        <SummaryValue
          label="Personalbehov"
          value={`${formatTwoDecimals(
            props.selectedPoint.adjustedStaffingNeed
          )} heltid`}
        />
      </Box>

      <Box sx={dailyCurveScrollerSx}>
        <Box sx={dailyCurveSx}>
          {props.selectedPoint.days.map((day) => (
            <DayBar
              key={day.weekday}
              day={day}
              heightPercentage={
                (day.adjustedStaffingNeed / maxDayPresence) * 100
              }
            />
          ))}
        </Box>
      </Box>

      <Stack spacing={0.75} sx={impactListSx}>
        {props.selectedPoint.impacts.length > 0 ? (
          props.selectedPoint.impacts.map((impact) => (
            <Box key={impact.id} sx={impactRowSx}>
              <Typography sx={impactNameSx}>{impact.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {formatSignedPercentage(impact.percentage)} ·{" "}
                {formatImpactWeekdays(impact)}
              </Typography>
            </Box>
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

function SummaryValue(props: { label: string; value: string }) {
  return (
    <Box sx={summaryValueSx}>
      <Typography variant="caption" color="text.secondary">
        {props.label}
      </Typography>
      <Typography sx={{ color: "#005883", fontWeight: 700 }}>
        {props.value}
      </Typography>
    </Box>
  );
}

function DayBar(props: {
  day: WeeklyCurveDay;
  heightPercentage: number;
}) {
  const isImpacted = props.day.impacts.length > 0;

  return (
    <Box sx={dayColumnSx}>
      <Box sx={dayBarAreaSx}>
        <Box
          title={formatDayTitle(props.day)}
          sx={{
            ...dayBarSx,
            bgcolor: getDayBarColor(props.day),
            height: `${Math.max(props.heightPercentage, 4)}%`,
            outline: isImpacted ? "2px solid var(--color-text)" : "none",
          }}
        />
      </Box>
      <Typography variant="caption" sx={dayLabelSx}>
        {props.day.shortLabel}
      </Typography>
      <Typography variant="caption" sx={dayImpactSx(isImpacted)}>
        {formatSignedPercentage(props.day.impactPercentage)}
      </Typography>
    </Box>
  );
}

function getDayBarColor(day: WeeklyCurveDay): string {
  if (day.impactPercentage > 0) {
    return "#000000";
  }

  if (day.impactPercentage < 0) {
    return "#333333";
  }

  return "#005883";
}

function formatDayTitle(day: WeeklyCurveDay): string {
  const impactNames =
    day.impacts.map((impact) => impact.name).join(", ") || "Ingen påverkan";

  return [
    day.label,
    `Personalbehov ${formatTwoDecimals(day.adjustedStaffingNeed)} heltid`,
    `Påverkan ${formatSignedPercentage(day.impactPercentage)}`,
    impactNames,
  ].join(" · ");
}

const selectedWeekSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  bgcolor: "background.paper",
  p: 1.5,
};

const panelHeaderSx = {
  alignItems: "flex-start",
  display: "flex",
  gap: 1,
  justifyContent: "space-between",
};

const impactBadgeSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  bgcolor: "var(--section-background)",
  color: "#005883",
  flexShrink: 0,
  fontWeight: 800,
  lineHeight: 1,
  px: 1,
  py: 0.75,
};

const summaryGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    xl: "repeat(4, minmax(0, 1fr))",
  },
  gap: 1,
  my: 1.5,
};

const summaryValueSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  bgcolor: "var(--page-background)",
  minWidth: 0,
  p: 1,
};

const dailyCurveScrollerSx = {
  overflowX: "auto",
};

const dailyCurveSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  bgcolor: "var(--page-background)",
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  gap: 1,
  minWidth: 420,
  p: 1.5,
};

const dayColumnSx = {
  display: "grid",
  gridTemplateRows: "128px 20px 18px",
  gap: 0.5,
  minWidth: 0,
};

const dayBarAreaSx = {
  alignItems: "end",
  display: "flex",
  minHeight: 128,
};

const dayBarSx = {
  borderRadius: "4px 4px 0 0",
  minHeight: 4,
  boxShadow: "inset 0 -1px 0 rgba(255, 255, 255, 0.24)",
  transition: "background-color 120ms ease, height 120ms ease",
  width: "100%",
};

const dayLabelSx = {
  color: "text.secondary",
  fontSize: "0.72rem",
  fontWeight: 700,
  lineHeight: "20px",
  textAlign: "center",
};

function dayImpactSx(isImpacted: boolean) {
  return {
    color: isImpacted ? "#005883" : "text.secondary",
    fontSize: "0.68rem",
    fontWeight: isImpacted ? 800 : 400,
    lineHeight: "18px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textAlign: "center",
  };
}

const impactListSx = {
  mt: 1.5,
};

const impactRowSx = {
  alignItems: { xs: "flex-start", sm: "center" },
  bgcolor: "var(--page-background)",
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  display: "flex",
  flexWrap: "wrap",
  gap: 0.75,
  justifyContent: "space-between",
  px: 1,
  py: 0.75,
};

const impactNameSx = {
  fontWeight: 700,
  minWidth: 0,
};
