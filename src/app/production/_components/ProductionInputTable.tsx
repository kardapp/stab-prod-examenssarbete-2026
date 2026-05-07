"use client";

import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  calculateDrgPoints,
  calculateTotalVisitMinutes,
  roundToOneDecimal,
  roundToWholeNumber,
  toNumber,
} from "@/lib/calculations/outpatientProductionCalculations";
import type { OutpatientProductionRow } from "@/types/production";
import { ProductionSectionTitle } from "./ProductionSectionTitle";

type ProductionInputTableProps = {
  rows: OutpatientProductionRow[];
  onEditRow: (row: OutpatientProductionRow) => void;
};

export function ProductionInputTable(props: ProductionInputTableProps) {
  return (
    <Paper sx={panelSx}>
      <ProductionSectionTitle
        overline="Produktionsrader"
        title="Inmatade produktionsrader"
        description="Tabellen visar användarens planerade produktion och enkla beräknade värden."
      />

      <TableContainer>
        <Table size="small" aria-label="Inmatade produktionsrader">
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Ekonomisk kombika</TableCell>
              <TableCell sx={headerCellSx}>Dag/datum</TableCell>
              <TableCell sx={headerCellSx}>Antal vårdtillfällen</TableCell>
              <TableCell sx={headerCellSx}>Yrkeskategori</TableCell>
              <TableCell sx={headerCellSx}>Sekundär yrkeskategori</TableCell>
              <TableCell sx={headerCellSx}>SLL/UULP</TableCell>
              <TableCell sx={headerCellSx}>Akut/elektivt</TableCell>
              <TableCell sx={headerCellSx}>Typ av besök</TableCell>
              <TableCell sx={headerCellSx}>Snitt-tid per besök</TableCell>
              <TableCell sx={headerCellSx}>DRG-snitt</TableCell>
              <TableCell sx={headerCellSx}>Besökstid</TableCell>
              <TableCell sx={headerCellSx}>DRG</TableCell>
              <TableCell sx={headerCellSx}>Åtgärd</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.rows.map((row) => {
              const visits = toNumber(row.visits);
              const averageMinutes = toNumber(row.average_minutes_per_visit);
              const drgAverage = toNumber(row.drg_average);

              return (
                <TableRow key={row.id} hover>
                  <TableCell>{row.kombika_pf_id}</TableCell>
                  <TableCell>{row.period_value}</TableCell>
                  <TableCell sx={numericCellSx}>{row.visits}</TableCell>
                  <TableCell>{row.primary_role_category}</TableCell>
                  <TableCell>{row.secondary_role_category ?? "-"}</TableCell>
                  <TableCell>{row.sll_uulp}</TableCell>
                  <TableCell>{row.acute_elective}</TableCell>
                  <TableCell>{row.visit_type}</TableCell>
                  <TableCell sx={numericCellSx}>
                    {row.average_minutes_per_visit}
                  </TableCell>
                  <TableCell sx={numericCellSx}>{row.drg_average}</TableCell>
                  <TableCell sx={numericCellSx}>
                    {roundToWholeNumber(
                      calculateTotalVisitMinutes(visits, averageMinutes)
                    )}
                  </TableCell>
                  <TableCell sx={numericCellSx}>
                    {roundToOneDecimal(calculateDrgPoints(visits, drgAverage))}
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => props.onEditRow(row)}>
                      Redigera
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

const panelSx = {
  p: 2,
  border: "1px solid #d0d7de",
  borderRadius: 1,
  boxShadow: "none",
};

const headerCellSx = {
  color: "#005883",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const numericCellSx = {
  textAlign: "right",
  whiteSpace: "nowrap",
};
