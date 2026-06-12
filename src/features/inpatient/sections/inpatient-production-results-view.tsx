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

const DAYS_PER_YEAR = 365;

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
  const acuteCareEvents = productionRow
    ? (productionRow.careEvents * productionRow.acutePercentage) / 100
    : 0;
  const electiveCareEvents = productionRow
    ? (productionRow.careEvents * productionRow.electivePercentage) / 100
    : 0;
  const sllCareEvents = productionRow
    ? (productionRow.careEvents * productionRow.sllPercentage) / 100
    : 0;
  const uulpCareEvents = productionRow
    ? (productionRow.careEvents * productionRow.uulpPercentage) / 100
    : 0;
  const sllDrgPoints = productionRow
    ? productionRow.sllDrgPoints ??
      sllCareEvents * (productionRow.sllDrgAverage ?? productionRow.drgAverage)
    : 0;
  const uulpDrgPoints = productionRow
    ? productionRow.uulpDrgPoints ??
      uulpCareEvents * (productionRow.uulpDrgAverage ?? productionRow.drgAverage)
    : 0;

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
                  overline="1. Antal vårdtillfällen"
                  title="Antal vårdtillfällen"
                  description="Visar planerade vårdtillfällen per dag och uppdelat på akut/elektivt samt SLL/UULP."
                />
                <Box sx={metricGridSx}>
                  <PlanningMetricCard
                    label="Årets vårdtillfällen"
                    value={formatWholeNumber(productionRow.careEvents)}
                  />
                  <PlanningMetricCard
                    label="Per dag"
                    value={formatOneDecimal(
                      productionRow.careEvents / DAYS_PER_YEAR
                    )}
                  />
                  <PlanningMetricCard
                    label="Akut / elektivt"
                    value={`${formatWholeNumber(
                      acuteCareEvents
                    )} / ${formatWholeNumber(electiveCareEvents)}`}
                    helperText={`${formatOneDecimal(
                      productionRow.acutePercentage
                    )}% / ${formatOneDecimal(productionRow.electivePercentage)}%`}
                  />
                  <PlanningMetricCard
                    label="SLL / UULP"
                    value={`${formatWholeNumber(
                      sllCareEvents
                    )} / ${formatWholeNumber(uulpCareEvents)}`}
                    helperText={`${formatOneDecimal(
                      productionRow.sllPercentage
                    )}% / ${formatOneDecimal(productionRow.uulpPercentage)}%`}
                  />
                </Box>
              </SectionCard>

              <SectionCard>
                <FormSection
                  overline="2. Antal vårddygn"
                  title="Antal vårddygn"
                  description="Medelvårdtid × vårdtillfällen = vårddygn."
                />
                <Box sx={metricGridSx}>
                  <PlanningMetricCard
                    label="Vårddygn"
                    value={formatWholeNumber(productionRow.careDays)}
                    helperText={`${formatOneDecimal(
                      productionRow.averageLengthOfStay
                    )} × ${formatWholeNumber(productionRow.careEvents)}`}
                  />
                  <PlanningMetricCard
                    label="Per dag"
                    value={formatOneDecimal(
                      productionRow.careDays / DAYS_PER_YEAR
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
                  overline="3. Antal DRG-poäng"
                  title="Antal DRG-poäng"
                  description="DRG-snitt SLL/UULP × vårdtillfällen per betalare = DRG-poäng."
                />
                <Box sx={metricGridSx}>
                  <PlanningMetricCard
                    label="DRG-poäng"
                    value={formatOneDecimal(productionRow.drgPoints)}
                    helperText={`${formatTwoDecimals(
                      productionRow.drgAverage
                    )} viktat DRG-snitt`}
                  />
                  <PlanningMetricCard
                    label="Per dag"
                    value={formatOneDecimal(
                      productionRow.drgPoints / DAYS_PER_YEAR
                    )}
                  />
                  <PlanningMetricCard
                    label="SLL"
                    value={formatOneDecimal(sllDrgPoints)}
                    helperText={`${formatTwoDecimals(
                      productionRow.sllDrgAverage ?? productionRow.drgAverage
                    )} × ${formatWholeNumber(sllCareEvents)}`}
                  />
                  <PlanningMetricCard
                    label="UULP"
                    value={formatOneDecimal(uulpDrgPoints)}
                    helperText={`${formatTwoDecimals(
                      productionRow.uulpDrgAverage ?? productionRow.drgAverage
                    )} × ${formatWholeNumber(uulpCareEvents)}`}
                  />
                </Box>
              </SectionCard>

              <SectionCard>
                <FormSection
                  overline="4. Snitt antal vårdplatser"
                  title="Snitt antal vårdplatser"
                  description="Vårddygn / 365 = snitt antal vårdplatser."
                />
                <Box sx={metricGridSx}>
                  <PlanningMetricCard
                    label="Snitt antal vårdplatser"
                    value={formatTwoDecimals(productionRow.averageCarePlaces)}
                    helperText={`${formatWholeNumber(
                      productionRow.careDays
                    )} / ${DAYS_PER_YEAR}`}
                  />
                </Box>
              </SectionCard>

              <SectionCard>
                <FormSection
                  overline="5. OO-fördelning"
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

              <SectionCard tone="action">
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
