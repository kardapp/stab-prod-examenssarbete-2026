"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { PageHeader } from "@/shared/components/page-header";
import { PlanningMetricCard } from "@/shared/components/planning-metric-card";
import { SectionCard } from "@/shared/components/section-card";
import {
  formatTwoDecimals,
  formatWholeNumber,
} from "@/shared/utils/format-number";
import type {
  InpatientDimensioningResultRow,
  InpatientMeDimensioningRow,
  InpatientOoDimensioningRow,
  InpatientOoDimensioningSettings,
  InpatientOoDistributionRow,
  InpatientProductionRow,
} from "../types/inpatient.types";
import {
  buildInpatientDimensioningResultRows,
  buildMonthlyDimensioningRows,
  calculateCostPerValue,
} from "../utils/inpatient-calculations";
import {
  readCurrentInpatientMeDimensioningRows,
  readCurrentInpatientOoDimensioningRows,
  readCurrentInpatientOoDimensioningSettings,
  readCurrentInpatientOoDistributions,
  readCurrentInpatientProductionRow,
} from "../utils/current-inpatient-session";

export function InpatientDimensioningResultsView() {
  const [productionRow] = useState<InpatientProductionRow | null>(() =>
    readCurrentInpatientProductionRow()
  );
  const [distributions] = useState<InpatientOoDistributionRow[]>(() =>
    readCurrentInpatientOoDistributions()
  );
  const [meRows] = useState<InpatientMeDimensioningRow[]>(() =>
    readCurrentInpatientMeDimensioningRows()
  );
  const [ooRows] = useState<InpatientOoDimensioningRow[]>(() =>
    readCurrentInpatientOoDimensioningRows()
  );
  const [ooSettings] = useState<InpatientOoDimensioningSettings>(() =>
    readCurrentInpatientOoDimensioningSettings()
  );

  const annualRows = useMemo(
    () =>
      buildInpatientDimensioningResultRows({
        productionRow,
        distributions,
        meRows,
        ooRows,
        ooSettings,
      }),
    [distributions, meRows, ooRows, ooSettings, productionRow]
  );
  const monthlyRows = useMemo(
    () => buildMonthlyDimensioningRows(annualRows),
    [annualRows]
  );
  const totalPresence = annualRows.reduce((sum, row) => sum + row.presence, 0);
  const totalStaffingCost = annualRows.reduce(
    (sum, row) => sum + row.staffingCost,
    0
  );

  return (
    <Box component="main" sx={pageSx}>
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <PageHeader
            overline="Resultat dimensionering"
            title="Resultat dimensionering slutenvård"
          />

          {!productionRow ? (
            <Alert severity="info">
              Spara en produktionsplan för slutenvård innan resultat visas.
            </Alert>
          ) : (
            <>
              <SectionCard>
                <FormSection
                  overline="1. Sammanfattning"
                  title="Närvaro och bemanningskostnader"
                />
                <Box sx={metricGridSx}>
                  <PlanningMetricCard
                    label="Total närvaro"
                    value={formatTwoDecimals(totalPresence)}
                  />
                  <PlanningMetricCard
                    label="Bemanningskostnad"
                    value={`${formatWholeNumber(totalStaffingCost)} kr`}
                  />
                  <PlanningMetricCard
                    label="Kostnad per DRG"
                    value={`${formatWholeNumber(
                      calculateCostPerValue(
                        totalStaffingCost,
                        productionRow.drgPoints
                      )
                    )} kr`}
                  />
                  <PlanningMetricCard
                    label="Kostnad per vårddygn"
                    value={`${formatWholeNumber(
                      calculateCostPerValue(
                        totalStaffingCost,
                        productionRow.careDays
                      )
                    )} kr`}
                  />
                  <PlanningMetricCard
                    label="Kostnad per vårdplats"
                    value={`${formatWholeNumber(
                      calculateCostPerValue(
                        totalStaffingCost,
                        productionRow.averageCarePlaces
                      )
                    )} kr`}
                  />
                </Box>
              </SectionCard>

              <ResultTable
                overline="2. Närvaro"
                title="Närvaro per område"
                rows={annualRows}
              />

              <ResultTable
                overline="3. Månad"
                title="Periodisering per månad"
                rows={monthlyRows}
              />
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

function ResultTable(props: {
  overline: string;
  rows: InpatientDimensioningResultRow[];
  title: string;
}) {
  return (
    <SectionCard>
      <FormSection overline={props.overline} title={props.title} />
      {props.rows.length === 0 ? (
        <Alert severity="info">Det finns inga dimensioneringsrader ännu.</Alert>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={headerCellSx}>Område</TableCell>
                <TableCell sx={headerCellSx}>Kategori</TableCell>
                <TableCell sx={headerCellSx}>Ekonomisk sektion</TableCell>
                <TableCell sx={headerCellSx}>Vårdande kostnadsställe</TableCell>
                <TableCell sx={headerCellSx}>Period</TableCell>
                <TableCell sx={headerCellSx} align="right">
                  Närvaro
                </TableCell>
                <TableCell sx={headerCellSx} align="right">
                  Bemanningskostnad
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.source}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.section}</TableCell>
                  <TableCell>{row.careProvidingUnit}</TableCell>
                  <TableCell>{row.month}</TableCell>
                  <TableCell align="right">
                    {formatTwoDecimals(row.presence)}
                  </TableCell>
                  <TableCell align="right">
                    {formatWholeNumber(row.staffingCost)} kr
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </SectionCard>
  );
}

const pageSx = {
  bgcolor: "var(--page-background)",
  minHeight: "100vh",
  p: 2,
};

const metricGridSx = {
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
    xl: "repeat(5, minmax(0, 1fr))",
  },
};

const headerCellSx = {
  color: "#005883",
  fontWeight: 700,
  whiteSpace: "nowrap",
};
