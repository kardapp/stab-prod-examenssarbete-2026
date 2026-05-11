"use client";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import {
  calculateProductionRowMetrics,
} from "../utils/outpatient-production-calculations";
import { formatOneDecimal, formatWholeNumber } from "@/shared/utils/format-number";
import type { OutpatientProductionRow } from "@/types/production";

type OutpatientProductionTableProps = {
  rows: OutpatientProductionRow[];
  onEditRow: (row: OutpatientProductionRow) => void;
};

export function OutpatientProductionTable(
  props: OutpatientProductionTableProps
) {
  return (
    <SectionCard>
      <FormSection
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
              const metrics = calculateProductionRowMetrics(row);

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
                    {formatWholeNumber(metrics.totalVisitMinutes)}
                  </TableCell>
                  <TableCell sx={numericCellSx}>
                    {formatOneDecimal(metrics.drgPoints)}
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
    </SectionCard>
  );
}

const headerCellSx = {
  color: "#005883",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const numericCellSx = {
  textAlign: "right",
  whiteSpace: "nowrap",
};
