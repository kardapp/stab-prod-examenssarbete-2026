"use client";

import { Box, Button, Paper, Typography } from "@mui/material";
import { SectionTitle } from "@/components/SectionTitle";
import {
  calculateDrgPoints,
  calculatePresenceNeed,
  roundToOneDecimal,
  roundToTwoDecimals,
  roundToWholeNumber,
  toNumber,
} from "@/lib/calculations/outpatientProductionCalculations";
import type { OutpatientProductionRow } from "@/types/production";
import { sumVisitMinutes } from "./outpatientProductionUtils";

type OutpatientProductionNextActionsProps = {
  rows: OutpatientProductionRow[];
};

export function OutpatientProductionNextActions(
  props: OutpatientProductionNextActionsProps
) {
  const totalVisitMinutes = sumVisitMinutes(props.rows);
  const totalDrgPoints = props.rows.reduce(
    (sum, row) =>
      sum + calculateDrgPoints(toNumber(row.visits), toNumber(row.drg_average)),
    0
  );
  const presenceNeed = calculatePresenceNeed(totalVisitMinutes);

  return (
    <Paper sx={processPanelSx}>
      <SectionTitle
        overline="Nästa steg"
        title="Fortsätt från produktionsplanen"
        description="Välj om vårdtillfällen ska fördelas till OO eller om planen ska användas direkt i dimensioneringen."
      />

      <Box sx={dimensioningSupportSx}>
        <Typography variant="caption" sx={overlineSx}>
          Beräknat stödvärde för senare dimensionering
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
          <SupportMetric
            label="Total besökstid"
            value={`${roundToWholeNumber(totalVisitMinutes)} min`}
          />
          <SupportMetric label="Total DRG" value={roundToOneDecimal(totalDrgPoints)} />
          <SupportMetric
            label="Närvarobehov"
            value={roundToTwoDecimals(presenceNeed)}
          />
        </Box>
        <Typography variant="caption" sx={mutedTextSx}>
          Räknas från vårdtillfällen, snitt-tid och DRG-snitt. Fylls inte i
          manuellt.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <Button variant="outlined" size="large" href="/production/oo-distribution">
          Fördela till OO
        </Button>
        <Button variant="contained" size="large" href="/dimensioning">
          Gå till Dimensionering
        </Button>
      </Box>
    </Paper>
  );
}

function SupportMetric(props: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" sx={mutedTextSx}>
        {props.label}
      </Typography>
      <Typography sx={{ color: "#005883", fontWeight: 700 }}>
        {props.value}
      </Typography>
    </Box>
  );
}

const processPanelSx = {
  p: 2,
  border: "1px solid #d0d7de",
  borderRadius: 1,
  boxShadow: "none",
  bgcolor: "#f8fbfd",
};

const dimensioningSupportSx = {
  bgcolor: "#ffffff",
  border: "1px solid #d0d7de",
  borderRadius: 1,
  p: 1.5,
  mb: 2,
};

const overlineSx = {
  color: "#005883",
  fontWeight: 700,
  letterSpacing: 0,
  textTransform: "uppercase",
};

const mutedTextSx = {
  color: "text.secondary",
};
