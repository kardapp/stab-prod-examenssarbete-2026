import { Box } from "@mui/material";
import {
  formatOneDecimal,
  formatTwoDecimals,
  formatWholeNumber,
} from "@/shared/utils/format-number";
import { PeriodizationMetricValue } from "./periodization-metric-value";
import type { AnnualCurveSummary } from "./periodization-curve-model";
import { WEEK_COUNT } from "./periodization-curve-model";

type PeriodizationSummaryCardsProps = {
  summary: AnnualCurveSummary;
};

export function PeriodizationSummaryCards(
  props: PeriodizationSummaryCardsProps
) {
  return (
    <Box sx={annualSummarySx}>
      <PeriodizationMetricValue
        label="Årets vårdtillfällen"
        value={formatOneDecimal(props.summary.visits)}
      />
      <PeriodizationMetricValue
        label="Årets besökstid"
        value={`${formatWholeNumber(props.summary.visitMinutes)} min`}
      />
      <PeriodizationMetricValue
        label="Årets DRG"
        value={formatTwoDecimals(props.summary.drgPoints)}
      />
      <PeriodizationMetricValue
        label="Bas per vecka"
        value={`${formatTwoDecimals(
          props.summary.staffingNeed / WEEK_COUNT
        )} heltid`}
      />
    </Box>
  );
}

const annualSummarySx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
    xl: "repeat(4, minmax(0, 1fr))",
  },
  gap: 1.5,
  mb: 2,
};
