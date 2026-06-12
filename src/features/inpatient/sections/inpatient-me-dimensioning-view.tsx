"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
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
  TextField,
} from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { PageHeader } from "@/shared/components/page-header";
import { PlanningMetricCard } from "@/shared/components/planning-metric-card";
import { SectionCard } from "@/shared/components/section-card";
import { PeriodizationCurveSection } from "@/features/outpatient-production/sections/periodization-curve-section";
import type { WeeklyCurveSourceRow } from "@/features/outpatient-production/sections/periodization-curve/periodization-curve-model";
import { appRoutes } from "@/shared/routes";
import {
  formatTwoDecimals,
  formatWholeNumber,
} from "@/shared/utils/format-number";
import type {
  InpatientMeDimensioningRow,
  InpatientProductionRow,
} from "../types/inpatient.types";
import {
  calculateMeDimensioningPresence,
  toNumber,
} from "../utils/inpatient-calculations";
import {
  hasCurrentInpatientMeDimensioning,
  readCurrentInpatientMeDimensioningRows,
  readCurrentInpatientProductionRow,
  saveCurrentInpatientMeDimensioning,
} from "../utils/current-inpatient-session";

type MeNumberField = Exclude<
  keyof InpatientMeDimensioningRow,
  "id" | "competenceLevel" | "doctorsPerTenInpatients"
>;
type InpatientMeResultRow = InpatientMeDimensioningRow & {
  presence: number;
  staffingCost: number;
};

const PERIODIZATION_WEEKLY_WORKING_MINUTES = 40 * 60;
const PERIODIZATION_WEEKS_PER_YEAR = 52;

export function InpatientMeDimensioningView() {
  const hasLoadedSession = useSyncExternalStore(
    subscribeToClientHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );

  if (!hasLoadedSession) {
    return (
      <Box component="main" sx={pageSx}>
        <Container maxWidth={false}>
          <Stack spacing={2}>
            <PageHeader
              overline="Dimensionering ME slutenvård"
              title="Läkarnärvaro kopplad till inskrivna per dag"
            />
            <Alert severity="info">Laddar sparat underlag...</Alert>
          </Stack>
        </Container>
      </Box>
    );
  }

  return <LoadedInpatientMeDimensioningView />;
}

function LoadedInpatientMeDimensioningView() {
  const [productionRow] = useState<InpatientProductionRow | null>(() =>
    readCurrentInpatientProductionRow()
  );
  const [rows, setRows] = useState<InpatientMeDimensioningRow[]>(() =>
    readCurrentInpatientMeDimensioningRows().map((row) =>
      normalizeMeDimensioningRow(row, productionRow?.averageCarePlaces ?? 0)
    )
  );
  const [saveMessage, setSaveMessage] = useState("");
  const [hasSavedRows, setHasSavedRows] = useState(() =>
    hasCurrentInpatientMeDimensioning()
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const resultRows = useMemo(
    () =>
      rows.map((row) => {
        const presence = productionRow
          ? calculateMeDimensioningPresence(
              productionRow.averageCarePlaces,
              row
            )
          : 0;

        return {
          ...row,
          presence,
          staffingCost: presence * toNumber(row.salaryCostPerPresence),
        };
      }),
    [productionRow, rows]
  );
  const totalPresence = resultRows.reduce((sum, row) => sum + row.presence, 0);
  const totalCost = resultRows.reduce((sum, row) => sum + row.staffingCost, 0);
  const periodizationRows = useMemo(
    () =>
      productionRow
        ? buildInpatientMePeriodizationRows(productionRow, resultRows)
        : [],
    [productionRow, resultRows]
  );
  const canOpenResults = hasSavedRows && !hasUnsavedChanges;

  function updateRow(
    rowId: string,
    field: MeNumberField,
    value: string
  ) {
    setSaveMessage("");
    setHasUnsavedChanges(true);
    setRows((current) =>
      current.map((row) =>
        row.id === rowId ? { ...row, [field]: Number(value) } : row
      )
    );
  }

  function saveRows() {
    saveCurrentInpatientMeDimensioning(rows);
    setHasSavedRows(true);
    setHasUnsavedChanges(false);
    setSaveMessage("Dimensionering ME slutenvård sparad.");
  }

  return (
    <Box component="main" sx={pageSx}>
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <PageHeader
            overline="Dimensionering ME slutenvård"
            title="Läkarnärvaro kopplad till inskrivna per dag"
          />

          {!productionRow ? (
            <Alert severity="info">
              Spara en produktionsplan för slutenvård innan dimensionering.
            </Alert>
          ) : (
            <>
              <SectionCard>
                <FormSection
                  overline="Hämtat från produktionsplan"
                  title="Produktionsunderlag slutenvård"
                />
                <Box sx={metricGridSx}>
                  <PlanningMetricCard
                    label="Ekonomisk kombika"
                    value={productionRow.economicKombika}
                  />
                  <PlanningMetricCard
                    label="Antal vårdtillfällen"
                    value={formatWholeNumber(productionRow.careEvents)}
                  />
                  <PlanningMetricCard
                    label="Vårddygn"
                    value={formatWholeNumber(productionRow.careDays)}
                  />
                  <PlanningMetricCard
                    label="Antal inskrivna per dag"
                    value={formatTwoDecimals(productionRow.averageCarePlaces)}
                  />
                </Box>
              </SectionCard>

              <SectionCard>
                <FormSection
                  overline="1. Kompetensnivåer"
                  title="Läkarnärvaro per kompetensnivå"
                  description="Antal inskrivna per dag hämtas från produktionen och används som underlag när läkarnärvaro fylls i per kompetensnivå."
                />
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headerCellSx}>Kompetensnivå</TableCell>
                        <TableCell sx={headerCellSx} align="right">
                          Läkarnärvaro
                        </TableCell>
                        <TableCell sx={headerCellSx} align="right">
                          ST som inte bidrar
                        </TableCell>
                        <TableCell sx={headerCellSx} align="right">
                          Admin/övrigt
                        </TableCell>
                        <TableCell sx={headerCellSx} align="right">
                          Lönekostnad/närvaro (historik)
                        </TableCell>
                        <TableCell sx={headerCellSx} align="right">
                          Total närvaro
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resultRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.competenceLevel}</TableCell>
                          <EditableNumberCell
                            value={row.doctorPresence}
                            onChange={(value) =>
                              updateRow(
                                row.id,
                                "doctorPresence",
                                value
                              )
                            }
                          />
                          <EditableNumberCell
                            value={row.nonContributingPresence}
                            onChange={(value) =>
                              updateRow(
                                row.id,
                                "nonContributingPresence",
                                value
                              )
                            }
                          />
                          <EditableNumberCell
                            value={row.adminOtherPresence}
                            onChange={(value) =>
                              updateRow(row.id, "adminOtherPresence", value)
                            }
                          />
                          <EditableNumberCell
                            value={row.salaryCostPerPresence}
                            onChange={(value) =>
                              updateRow(row.id, "salaryCostPerPresence", value)
                            }
                          />
                          <TableCell align="right">
                            {formatTwoDecimals(row.presence)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </SectionCard>

              <SectionCard>
                <FormSection overline="Summering" title="ME-resultat" />
                <Box sx={metricGridSx}>
                  <PlanningMetricCard
                    label="Total närvaro ME"
                    value={formatTwoDecimals(totalPresence)}
                  />
                  <PlanningMetricCard
                    label="Bemanningskostnad ME"
                    value={`${formatWholeNumber(totalCost)} kr`}
                  />
                </Box>
              </SectionCard>

              <PeriodizationCurveSection
                rows={periodizationRows}
                overline="Periodisering över året"
                title="Personalbehov per vecka"
                description="ME-dimensioneringen för slutenvård periodiseras över 52 veckor. Klicka på en vecka för att se detaljer och lägga till påverkan."
                emptyText="Periodiseringskurvan visas när det finns ME-dimensionering att räkna på."
                volumeLabel="Vårdtillfällen"
                volumeLabelLower="vårdtillfällen"
              />

              <SectionCard tone="action">
                <Stack spacing={2}>
                  {saveMessage ? (
                    <Alert severity="success">{saveMessage}</Alert>
                  ) : null}
                  {!hasSavedRows ? (
                    <Alert severity="warning">
                      Spara ME-dimensioneringen innan du går till resultat.
                      Standardvärden i tabellen räknas inte in förrän de är
                      sparade.
                    </Alert>
                  ) : hasUnsavedChanges ? (
                    <Alert severity="warning">
                      Du har osparade ändringar. Spara ME-dimensioneringen innan
                      du går till resultat.
                    </Alert>
                  ) : null}
                  <Box sx={actionRowSx}>
                    <Button variant="contained" onClick={saveRows}>
                      Spara dimensionering ME
                    </Button>
                    <Button
                      variant="outlined"
                      href={appRoutes.inpatientProductionPlanning}
                    >
                      Gå till produktionsplanering
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={!canOpenResults}
                      href={
                        canOpenResults
                          ? appRoutes.inpatientDimensioningResults
                          : undefined
                      }
                    >
                      Gå till resultat
                    </Button>
                  </Box>
                </Stack>
              </SectionCard>
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

function subscribeToClientHydration() {
  return () => undefined;
}

function getClientHydrationSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

function normalizeMeDimensioningRow(
  row: InpatientMeDimensioningRow,
  averageInpatientsPerDay: number
): InpatientMeDimensioningRow {
  if (typeof row.doctorPresence !== "undefined") {
    return {
      ...row,
      doctorPresence: toNumber(row.doctorPresence),
    };
  }

  return {
    ...row,
    doctorPresence:
      (toNumber(averageInpatientsPerDay) / 10) *
      toNumber(row.doctorsPerTenInpatients),
  };
}

function buildInpatientMePeriodizationRows(
  productionRow: InpatientProductionRow,
  rows: InpatientMeResultRow[]
): WeeklyCurveSourceRow[] {
  const totalPresence = rows.reduce((sum, row) => sum + row.presence, 0);

  return rows
    .filter((row) => row.presence > 0)
    .map((row) => {
      const share = totalPresence > 0 ? row.presence / totalPresence : 0;

      return {
        id: `me-${row.id}`,
        careUnitName: "ME slutenvård",
        roleCategory: row.competenceLevel,
        visits: productionRow.careEvents * share,
        totalVisitMinutes:
          row.presence *
          PERIODIZATION_WEEKLY_WORKING_MINUTES *
          PERIODIZATION_WEEKS_PER_YEAR,
        drgPoints: productionRow.drgPoints * share,
      };
    });
}

function EditableNumberCell(props: {
  onChange: (value: string) => void;
  value: number;
}) {
  return (
    <TableCell align="right">
      <TextField
        type="number"
        size="small"
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        sx={{ width: 120 }}
        slotProps={{ htmlInput: { min: 0, step: 0.1 } }}
      />
    </TableCell>
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
