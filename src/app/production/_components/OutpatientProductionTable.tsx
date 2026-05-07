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
import { SectionTitle } from "@/components/SectionTitle";
import {
  calculateDrgPoints,
  calculateTotalVisitMinutes,
  roundToOneDecimal,
  roundToWholeNumber,
  toNumber,
} from "@/lib/calculations/outpatientProductionCalculations";
import type { OutpatientProductionRow } from "@/types/production";

type OutpatientProductionTableProps = {
  rows: OutpatientProductionRow[];
  onEditRow: (row: OutpatientProductionRow) => void;
};

export function OutpatientProductionTable(
  props: OutpatientProductionTableProps
) {
  return (
    <Paper sx={panelSx}>
      <SectionTitle
        overline="Produktionsrader"
        title="Inmatade rader"
        description="Raderna nedan är användarens produktionsplan. Beräknade kolumner visas som stöd och sparas inte som manuell input."
      />

      <TableContainer>
        <Table size="small" aria-label="Inmatade produktionsrader">
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Kombika</TableCell>
              <TableCell sx={headerCellSx}>Dag</TableCell>
              <TableCell sx={headerCellSx}>Vårdtillfällen</TableCell>
              <TableCell sx={headerCellSx}>Yrkeskategori</TableCell>
              <TableCell sx={headerCellSx}>Sekundär</TableCell>
              <TableCell sx={headerCellSx}>SLL/UULP</TableCell>
              <TableCell sx={headerCellSx}>Akut/elektivt</TableCell>
              <TableCell sx={headerCellSx}>Typ av besök</TableCell>
              <TableCell sx={headerCellSx}>Snitt-tid</TableCell>
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
