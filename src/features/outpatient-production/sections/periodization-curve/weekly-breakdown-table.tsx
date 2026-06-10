import {
  Alert,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  formatOneDecimal,
  formatTwoDecimals,
  formatWholeNumber,
} from "@/shared/utils/format-number";
import type { WeeklyCurvePoint } from "./periodization-curve-model";

type WeeklyBreakdownTableProps = {
  selectedPoint: WeeklyCurvePoint;
  showDrg?: boolean;
};

export function WeeklyBreakdownTable(props: WeeklyBreakdownTableProps) {
  const rowCount = props.selectedPoint.rows.length;
  const rowCountLabel = rowCount === 1 ? "1 rad" : `${rowCount} rader`;

  return (
    <Box sx={breakdownSectionSx}>
      <Box sx={breakdownTitleRowSx}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={breakdownOverlineSx}>
            Detaljfördelning
          </Typography>
          <Typography variant="subtitle2" sx={breakdownTitleSx}>
            Vecka {props.selectedPoint.week} per vårdande enhet
          </Typography>
        </Box>
        <Typography variant="caption" sx={rowCountSx}>
          {rowCountLabel}
        </Typography>
      </Box>

      {rowCount === 0 ? (
        <Alert severity="info">Det finns inga rader för vald vecka.</Alert>
      ) : (
        <TableContainer sx={tableContainerSx}>
          <Table
            aria-label={`Vecka ${props.selectedPoint.week} per vårdande enhet`}
            size="small"
            sx={tableSx}
          >
            <TableHead sx={tableHeadSx}>
              <TableRow>
                <HeaderCell>Vårdande enhet</HeaderCell>
                <HeaderCell>Yrkeskategori</HeaderCell>
                <HeaderCell align="right">Vårdhändelser</HeaderCell>
                <HeaderCell align="right">Besökstid</HeaderCell>
                {props.showDrg !== false ? (
                  <HeaderCell align="right">DRG</HeaderCell>
                ) : null}
                <HeaderCell align="right">Personalbehov</HeaderCell>
              </TableRow>
            </TableHead>
            <TableBody sx={tableBodySx}>
              {props.selectedPoint.rows.map((row) => (
                <TableRow key={row.id} sx={bodyRowSx}>
                  <BreakdownCell
                    label="Vårdande enhet"
                    mobileFull
                    value={row.careUnit}
                  />
                  <BreakdownCell
                    label="Yrkeskategori"
                    mobileFull
                    value={row.roleCategory}
                  />
                  <BreakdownCell
                    align="right"
                    label="Vårdhändelser"
                    value={formatOneDecimal(row.visits)}
                  />
                  <BreakdownCell
                    align="right"
                    label="Besökstid"
                    value={`${formatWholeNumber(row.visitMinutes)} min`}
                  />
                  {props.showDrg !== false ? (
                    <BreakdownCell
                      align="right"
                      label="DRG"
                      value={formatTwoDecimals(row.drgPoints)}
                    />
                  ) : null}
                  <BreakdownCell
                    align="right"
                    label="Personalbehov"
                    value={`${formatTwoDecimals(row.staffingNeed)} heltid`}
                    strong
                  />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

function HeaderCell(props: { align?: "left" | "right"; children: string }) {
  return (
    <TableCell align={props.align ?? "left"} sx={headerCellSx}>
      {props.children}
    </TableCell>
  );
}

function BreakdownCell(props: {
  align?: "left" | "right";
  label: string;
  mobileFull?: boolean;
  strong?: boolean;
  value: string;
}) {
  return (
    <TableCell
      sx={[
        dataCellSx,
        { textAlign: { xs: "left", md: props.align ?? "left" } },
        props.mobileFull ? mobileFullCellSx : {},
      ]}
    >
      <Typography variant="caption" sx={mobileLabelSx}>
        {props.label}
      </Typography>
      <Typography
        sx={[
          valueTextSx,
          props.align === "right" ? numericTextSx : {},
          props.strong ? strongValueTextSx : {},
        ]}
      >
        {props.value}
      </Typography>
    </TableCell>
  );
}

const breakdownSectionSx = {
  mt: 2,
};

const breakdownTitleRowSx = {
  alignItems: { xs: "flex-start", sm: "center" },
  display: "flex",
  gap: 1,
  justifyContent: "space-between",
  mb: 1,
};

const breakdownOverlineSx = {
  color: "text.secondary",
  display: "block",
  fontWeight: 700,
  lineHeight: 1.2,
  mb: 0.25,
};

const breakdownTitleSx = {
  fontWeight: 700,
  lineHeight: 1.3,
};

const rowCountSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  color: "#005883",
  flexShrink: 0,
  fontWeight: 700,
  lineHeight: 1,
  px: 1,
  py: 0.75,
};

const tableContainerSx = {
  bgcolor: "var(--page-background)",
  border: {
    xs: 0,
    md: "1px solid var(--color-border)",
  },
  borderRadius: 1,
  overflow: {
    xs: "visible",
    md: "hidden",
  },
};

const tableSx = {
  borderCollapse: {
    xs: "separate",
    md: "collapse",
  },
  borderSpacing: {
    xs: "0 8px",
    md: 0,
  },
  width: "100%",
};

const tableHeadSx = {
  display: {
    xs: "none",
    md: "table-header-group",
  },
  "& .MuiTableCell-root": {
    bgcolor: "var(--section-background)",
  },
};

const tableBodySx = {
  display: {
    xs: "grid",
    md: "table-row-group",
  },
  gap: {
    xs: 1,
    md: 0,
  },
};

const bodyRowSx = {
  bgcolor: "var(--page-background)",
  border: {
    xs: "1px solid var(--color-border)",
    md: 0,
  },
  borderRadius: {
    xs: 1,
    md: 0,
  },
  display: {
    xs: "grid",
    md: "table-row",
  },
  gap: {
    xs: 1,
    md: 0,
  },
  gridTemplateColumns: {
    xs: "repeat(2, minmax(0, 1fr))",
    sm: "repeat(3, minmax(0, 1fr))",
  },
  p: {
    xs: 1.25,
    md: 0,
  },
  transition: "background-color 120ms ease",
  "&:hover": {
    bgcolor: {
      md: "rgba(0, 88, 131, 0.04)",
    },
  },
  "&:last-of-type .MuiTableCell-root": {
    borderBottom: 0,
  },
};

const headerCellSx = {
  borderBottom: "1px solid var(--color-border)",
  color: "#005883",
  fontSize: "0.75rem",
  fontWeight: 700,
  letterSpacing: 0,
  lineHeight: 1.3,
  px: 1.5,
  py: 1,
  whiteSpace: "nowrap",
};

const dataCellSx = {
  borderBottom: {
    xs: 0,
    md: "1px solid var(--color-border)",
  },
  display: {
    xs: "block",
    md: "table-cell",
  },
  minWidth: 0,
  p: {
    xs: 0,
    md: 1.5,
  },
  verticalAlign: "top",
};

const mobileFullCellSx = {
  gridColumn: {
    xs: "1 / -1",
    md: "auto",
  },
};

const mobileLabelSx = {
  color: "text.secondary",
  display: {
    xs: "block",
    md: "none",
  },
  fontWeight: 700,
  lineHeight: 1.2,
  mb: 0.25,
};

const valueTextSx = {
  fontWeight: 500,
  lineHeight: 1.35,
  overflowWrap: "anywhere",
};

const numericTextSx = {
  fontVariantNumeric: "tabular-nums",
};

const strongValueTextSx = {
  color: "#005883",
  fontWeight: 800,
};
