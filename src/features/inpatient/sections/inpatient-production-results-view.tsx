"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
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
import { appRoutes } from "@/shared/routes";
import {
  formatOneDecimal,
  formatTwoDecimals,
  formatWholeNumber,
} from "@/shared/utils/format-number";
import type {
  InpatientOoDistributionRow,
  InpatientProductionRow,
} from "../types/inpatient.types";
import {
  readCurrentInpatientOoDistributions,
  readCurrentInpatientProductionRow,
} from "../utils/current-inpatient-session";
import { calculateCostPerValue } from "../utils/inpatient-calculations";

export function InpatientProductionResultsView() {
  const [productionRow] = useState<InpatientProductionRow | null>(() =>
    readCurrentInpatientProductionRow()
  );
  const [distributions] = useState<InpatientOoDistributionRow[]>(() =>
    readCurrentInpatientOoDistributions()
  );

  const distributedCareDays = useMemo(
    () =>
      distributions.reduce(
        (sum, row) => sum + Number(row.distributedCareDays || 0),
        0
      ),
    [distributions]
  );

  return (
    <Box component="main" sx={pageSx}>
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <PageHeader
            overline="Resultat produktionsplan"
            title="Resultat produktionsplan slutenvård"
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
                  title="Slutenvårdsvolym och kapacitet"
                />
                <Box sx={metricGridSx}>
                  <PlanningMetricCard
                    label="Vårdtillfällen"
                    value={formatWholeNumber(productionRow.careEvents)}
                    helperText={`${formatOneDecimal(
                      productionRow.careEvents / 365
                    )} per dag`}
                  />
                  <PlanningMetricCard
                    label="Vårddygn"
                    value={formatWholeNumber(productionRow.careDays)}
                    helperText={`${formatOneDecimal(
                      productionRow.careDays / 365
                    )} per dag`}
                  />
                  <PlanningMetricCard
                    label="DRG-poäng"
                    value={formatOneDecimal(productionRow.drgPoints)}
                    helperText={`${formatOneDecimal(
                      productionRow.drgPoints / 365
                    )} per dag`}
                  />
                  <PlanningMetricCard
                    label="Snitt antal vårdplatser"
                    value={formatTwoDecimals(productionRow.averageCarePlaces)}
                  />
                  <PlanningMetricCard
                    label="Akut / elektivt"
                    value={`${formatOneDecimal(
                      productionRow.acutePercentage
                    )}% / ${formatOneDecimal(productionRow.electivePercentage)}%`}
                  />
                  <PlanningMetricCard
                    label="SLL / UULP"
                    value={`${formatOneDecimal(
                      productionRow.sllPercentage
                    )}% / ${formatOneDecimal(productionRow.uulpPercentage)}%`}
                  />
                  <PlanningMetricCard
                    label="DRG per vårddygn"
                    value={formatTwoDecimals(
                      calculateCostPerValue(
                        productionRow.drgPoints,
                        productionRow.careDays
                      )
                    )}
                  />
                  <PlanningMetricCard
                    label="Fördelade vårddygn OO"
                    value={formatOneDecimal(distributedCareDays)}
                  />
                </Box>
              </SectionCard>

              <SectionCard>
                <FormSection
                  overline="2. OO-fördelning"
                  title="Vårddygn per vårdande enhet"
                />
                {distributions.length === 0 ? (
                  <Alert severity="warning">
                    Inga vårddygn har fördelats till OO ännu.
                  </Alert>
                ) : (
                  <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={headerCellSx}>
                            Vårdande enhet
                          </TableCell>
                          <TableCell sx={headerCellSx} align="right">
                            Andel
                          </TableCell>
                          <TableCell sx={headerCellSx} align="right">
                            Vårddygn
                          </TableCell>
                          <TableCell sx={headerCellSx} align="right">
                            Snitt vårdplatser
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {distributions.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.careProvidingUnit}</TableCell>
                            <TableCell align="right">
                              {formatOneDecimal(row.percentage)}%
                            </TableCell>
                            <TableCell align="right">
                              {formatOneDecimal(row.distributedCareDays)}
                            </TableCell>
                            <TableCell align="right">
                              {formatTwoDecimals(row.distributedCareDays / 365)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </SectionCard>

              <SectionCard>
                <Box sx={actionRowSx}>
                  <Button
                    variant="outlined"
                    href={appRoutes.inpatientOoDistribution}
                  >
                    Tillbaka till OO-fördelning
                  </Button>
                  <Button
                    variant="outlined"
                    href={appRoutes.inpatientProductionPlanning}
                  >
                    Tillbaka till produktionsplanering
                  </Button>
                </Box>
              </SectionCard>
            </>
          )}
        </Stack>
      </Container>
    </Box>
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
    xl: "repeat(4, minmax(0, 1fr))",
  },
};

const headerCellSx = {
  color: "#005883",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const actionRowSx = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1.5,
};
