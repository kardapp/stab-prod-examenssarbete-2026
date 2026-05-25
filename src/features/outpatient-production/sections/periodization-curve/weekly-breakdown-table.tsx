import { Box, Typography } from "@mui/material";
import {
  formatOneDecimal,
  formatTwoDecimals,
  formatWholeNumber,
} from "@/shared/utils/format-number";
import type { WeeklyCurvePoint } from "./periodization-curve-model";

type WeeklyBreakdownTableProps = {
  selectedPoint: WeeklyCurvePoint;
};

export function WeeklyBreakdownTable(props: WeeklyBreakdownTableProps) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        Vecka {props.selectedPoint.week} per vårdande enhet
      </Typography>
      <Box sx={breakdownTableSx}>
        <Box sx={breakdownHeaderSx}>
          <HeaderCell>Vårdande enhet</HeaderCell>
          <HeaderCell>Yrkeskategori</HeaderCell>
          <HeaderCell align="right">Vårdtillfällen</HeaderCell>
          <HeaderCell align="right">Besökstid</HeaderCell>
          <HeaderCell align="right">DRG</HeaderCell>
          <HeaderCell align="right">Personalbehov</HeaderCell>
        </Box>
        {props.selectedPoint.rows.map((row) => (
          <Box key={row.id} sx={breakdownRowSx}>
            <BreakdownCell label="Vårdande enhet" value={row.careUnit} />
            <BreakdownCell label="Yrkeskategori" value={row.roleCategory} />
            <BreakdownCell
              align="right"
              label="Vårdtillfällen"
              value={formatOneDecimal(row.visits)}
            />
            <BreakdownCell
              align="right"
              label="Besökstid"
              value={`${formatWholeNumber(row.visitMinutes)} min`}
            />
            <BreakdownCell
              align="right"
              label="DRG"
              value={formatTwoDecimals(row.drgPoints)}
            />
            <BreakdownCell
              align="right"
              label="Personalbehov"
              value={`${formatTwoDecimals(row.staffingNeed)} heltid`}
              strong
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function HeaderCell(props: {
  align?: "left" | "right";
  children: string;
}) {
  return (
    <Typography
      variant="caption"
      sx={{
        color: "#005883",
        display: { xs: "none", xl: "block" },
        fontWeight: 700,
        minWidth: 0,
        textAlign: props.align ?? "left",
      }}
    >
      {props.children}
    </Typography>
  );
}

function BreakdownCell(props: {
  align?: "left" | "right";
  label: string;
  strong?: boolean;
  value: string;
}) {
  return (
    <Box sx={{ minWidth: 0, textAlign: { xs: "left", xl: props.align } }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: { xs: "block", xl: "none" }, mb: 0.25 }}
      >
        {props.label}
      </Typography>
      <Typography
        sx={{
          fontWeight: props.strong ? 700 : 400,
          overflowWrap: "anywhere",
        }}
      >
        {props.value}
      </Typography>
    </Box>
  );
}

const breakdownTableSx = {
  display: "grid",
  gap: 0.75,
};

const breakdownBaseRowSx = {
  display: "grid",
  gap: 1,
  gridTemplateColumns: {
    xs: "1fr",
    xl: "minmax(180px, 1.2fr) minmax(150px, 1fr) repeat(4, minmax(110px, 0.8fr))",
  },
  minWidth: 0,
};

const breakdownHeaderSx = {
  ...breakdownBaseRowSx,
  alignItems: "center",
};

const breakdownRowSx = {
  ...breakdownBaseRowSx,
  alignItems: "start",
  borderTop: "1px solid #d0d7de",
  pt: 1,
};
