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
  TextField,
} from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { PageHeader } from "@/shared/components/page-header";
import { PlanningMetricCard } from "@/shared/components/planning-metric-card";
import { SectionCard } from "@/shared/components/section-card";
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
  readCurrentInpatientMeDimensioningRows,
  readCurrentInpatientProductionRow,
  saveCurrentInpatientMeDimensioning,
} from "../utils/current-inpatient-session";

type MeNumberField = Exclude<
  keyof InpatientMeDimensioningRow,
  "id" | "competenceLevel"
>;

export function InpatientMeDimensioningView() {
  const [productionRow] = useState<InpatientProductionRow | null>(() =>
    readCurrentInpatientProductionRow()
  );
  const [rows, setRows] = useState<InpatientMeDimensioningRow[]>(() =>
    readCurrentInpatientMeDimensioningRows()
  );
  const [saveMessage, setSaveMessage] = useState("");

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

  function updateRow(
    rowId: string,
    field: MeNumberField,
    value: string
  ) {
    setSaveMessage("");
    setRows((current) =>
      current.map((row) =>
        row.id === rowId ? { ...row, [field]: Number(value) } : row
      )
    );
  }

  function saveRows() {
    saveCurrentInpatientMeDimensioning(rows);
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
                  description="Närvaron räknas från antal inskrivna per dag, inte från besökstid."
                />
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headerCellSx}>Kompetensnivå</TableCell>
                        <TableCell sx={headerCellSx} align="right">
                          Läkare / 10 inskrivna
                        </TableCell>
                        <TableCell sx={headerCellSx} align="right">
                          ST som inte bidrar
                        </TableCell>
                        <TableCell sx={headerCellSx} align="right">
                          Admin/övrigt
                        </TableCell>
                        <TableCell sx={headerCellSx} align="right">
                          Lönekostnad/närvaro
                        </TableCell>
                        <TableCell sx={headerCellSx} align="right">
                          Närvaro
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resultRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.competenceLevel}</TableCell>
                          <EditableNumberCell
                            value={row.doctorsPerTenInpatients}
                            onChange={(value) =>
                              updateRow(
                                row.id,
                                "doctorsPerTenInpatients",
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

              <SectionCard>
                <Stack spacing={2}>
                  {saveMessage ? (
                    <Alert severity="success">{saveMessage}</Alert>
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
                      href={appRoutes.inpatientDimensioningResults}
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
