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
  InpatientOoDimensioningRow,
  InpatientOoDimensioningSettings,
  InpatientOoDistributionRow,
  InpatientProductionRow,
} from "../types/inpatient.types";
import {
  calculateOoDimensioningPresence,
  calculateOoSupportPresence,
  getAnnualCareDaysFromDistributions,
  toNumber,
} from "../utils/inpatient-calculations";
import {
  readCurrentInpatientOoDimensioningRows,
  readCurrentInpatientOoDimensioningSettings,
  readCurrentInpatientOoDistributions,
  readCurrentInpatientProductionRow,
  saveCurrentInpatientOoDimensioning,
} from "../utils/current-inpatient-session";

type OoRowNumberField = Exclude<
  keyof InpatientOoDimensioningRow,
  "id" | "roleCategory"
>;
type OoSettingsField = keyof InpatientOoDimensioningSettings;

export function InpatientOoDimensioningView() {
  const [productionRow] = useState<InpatientProductionRow | null>(() =>
    readCurrentInpatientProductionRow()
  );
  const [distributions] = useState<InpatientOoDistributionRow[]>(() =>
    readCurrentInpatientOoDistributions()
  );
  const [rows, setRows] = useState<InpatientOoDimensioningRow[]>(() =>
    readCurrentInpatientOoDimensioningRows()
  );
  const [settings, setSettings] = useState<InpatientOoDimensioningSettings>(
    () => readCurrentInpatientOoDimensioningSettings()
  );
  const [saveMessage, setSaveMessage] = useState("");

  const annualCareDays = getAnnualCareDaysFromDistributions(
    productionRow,
    distributions
  );
  const averageCarePlaces = annualCareDays / 365;
  const resultRows = useMemo(
    () =>
      rows.map((row) => {
        const presence = calculateOoDimensioningPresence(
          averageCarePlaces,
          row
        );

        return {
          ...row,
          presence,
          weeklyHours:
            averageCarePlaces * toNumber(row.hoursPerCarePlacePerDay) * 7,
          staffingCost: presence * toNumber(row.salaryCostPerPresence),
        };
      }),
    [averageCarePlaces, rows]
  );
  const supportPresence = calculateOoSupportPresence(settings);
  const totalPresence =
    resultRows.reduce((sum, row) => sum + row.presence, 0) + supportPresence;
  const totalCost = resultRows.reduce((sum, row) => sum + row.staffingCost, 0);

  function updateRow(
    rowId: string,
    field: OoRowNumberField,
    value: string
  ) {
    setSaveMessage("");
    setRows((current) =>
      current.map((row) =>
        row.id === rowId ? { ...row, [field]: Number(value) } : row
      )
    );
  }

  function updateSetting(field: OoSettingsField, value: string) {
    setSaveMessage("");
    setSettings((current) => ({ ...current, [field]: Number(value) }));
  }

  function saveRows() {
    saveCurrentInpatientOoDimensioning(rows, settings);
    setSaveMessage("Dimensionering OO slutenvård sparad.");
  }

  return (
    <Box component="main" sx={pageSx}>
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <PageHeader
            overline="Dimensionering OO slutenvård"
            title="Bemanning kopplad till vårddygn och vårdplatser"
          />

          {!productionRow ? (
            <Alert severity="info">
              Spara en produktionsplan för slutenvård innan OO-dimensionering.
            </Alert>
          ) : (
            <>
              <SectionCard>
                <FormSection
                  overline="Hämtat från produktionsplan"
                  title="Vårddygn och vårdplatser"
                />
                <Box sx={metricGridSx}>
                  <PlanningMetricCard
                    label="Ekonomisk kombika"
                    value={productionRow.economicKombika}
                  />
                  <PlanningMetricCard
                    label="Vårddygn"
                    value={formatWholeNumber(annualCareDays)}
                  />
                  <PlanningMetricCard
                    label="Snitt antal vårdplatser"
                    value={formatTwoDecimals(averageCarePlaces)}
                  />
                  <PlanningMetricCard
                    label="Vårdande enheter"
                    value={
                      distributions
                        .map((row) => row.careProvidingUnit)
                        .join(", ") || "Ej fördelad"
                    }
                  />
                </Box>
              </SectionCard>

              <SectionCard>
                <FormSection
                  overline="1. Produktion per yrkeskategori"
                  title="Timmar per vårdplats och dygn"
                />
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headerCellSx}>Yrkeskategori</TableCell>
                        <TableCell sx={headerCellSx} align="right">
                          Tim/vårdplats/dygn
                        </TableCell>
                        <TableCell sx={headerCellSx} align="right">
                          Veckoarbetstid
                        </TableCell>
                        <TableCell sx={headerCellSx} align="right">
                          Lönekostnad/närvaro
                        </TableCell>
                        <TableCell sx={headerCellSx} align="right">
                          Timmar/vecka
                        </TableCell>
                        <TableCell sx={headerCellSx} align="right">
                          Närvaro
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resultRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.roleCategory}</TableCell>
                          <EditableNumberCell
                            value={row.hoursPerCarePlacePerDay}
                            onChange={(value) =>
                              updateRow(row.id, "hoursPerCarePlacePerDay", value)
                            }
                          />
                          <EditableNumberCell
                            value={row.weeklyWorkHours}
                            onChange={(value) =>
                              updateRow(row.id, "weeklyWorkHours", value)
                            }
                          />
                          <EditableNumberCell
                            value={row.salaryCostPerPresence}
                            onChange={(value) =>
                              updateRow(row.id, "salaryCostPerPresence", value)
                            }
                          />
                          <TableCell align="right">
                            {formatTwoDecimals(row.weeklyHours)}
                          </TableCell>
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
                <FormSection
                  overline="2. Vårdnära stöd och övrig tid"
                  title="Timmar per vecka"
                />
                <Box sx={inputGridSx}>
                  <SettingsField
                    label="Vårdnära stöd"
                    value={settings.careSupportHoursPerWeek}
                    onChange={(value) =>
                      updateSetting("careSupportHoursPerWeek", value)
                    }
                  />
                  <SettingsField
                    label="Admin"
                    value={settings.adminHoursPerWeek}
                    onChange={(value) =>
                      updateSetting("adminHoursPerWeek", value)
                    }
                  />
                  <SettingsField
                    label="Inskolning"
                    value={settings.trainingHoursPerWeek}
                    onChange={(value) =>
                      updateSetting("trainingHoursPerWeek", value)
                    }
                  />
                  <SettingsField
                    label="Kompetensutveckling"
                    value={settings.competenceDevelopmentHoursPerWeek}
                    onChange={(value) =>
                      updateSetting("competenceDevelopmentHoursPerWeek", value)
                    }
                  />
                  <SettingsField
                    label="Övrig tid"
                    value={settings.otherHoursPerWeek}
                    onChange={(value) => updateSetting("otherHoursPerWeek", value)}
                  />
                </Box>
              </SectionCard>

              <SectionCard>
                <FormSection overline="Summering" title="OO-resultat" />
                <Box sx={metricGridSx}>
                  <PlanningMetricCard
                    label="Produktionsnärvaro OO"
                    value={formatTwoDecimals(totalPresence - supportPresence)}
                  />
                  <PlanningMetricCard
                    label="Stöd/admin-närvaro"
                    value={formatTwoDecimals(supportPresence)}
                  />
                  <PlanningMetricCard
                    label="Total närvaro OO"
                    value={formatTwoDecimals(totalPresence)}
                  />
                  <PlanningMetricCard
                    label="Bemanningskostnad OO"
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
                      Spara dimensionering OO
                    </Button>
                    <Button
                      variant="outlined"
                      href={appRoutes.inpatientOoDistribution}
                    >
                      Tillbaka till OO-fördelning
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

function SettingsField(props: {
  label: string;
  onChange: (value: string) => void;
  value: number;
}) {
  return (
    <TextField
      label={props.label}
      type="number"
      size="small"
      value={props.value}
      onChange={(event) => props.onChange(event.target.value)}
      fullWidth
      slotProps={{ htmlInput: { min: 0, step: 1 } }}
    />
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

const inputGridSx = {
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(3, minmax(0, 1fr))",
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
