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
} from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { FormattedNumberTextField } from "@/shared/components/formatted-number-text-field";
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
  hasCurrentInpatientOoDimensioning,
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
type InpatientOoResultRow = InpatientOoDimensioningRow & {
  careDaysFromProductionPlan: number;
  presence: number;
  staffingCost: number;
  weeklyHours: number;
};

const PERIODIZATION_WEEKLY_WORKING_MINUTES = 40 * 60;
const PERIODIZATION_WEEKS_PER_YEAR = 52;

export function InpatientOoDimensioningView() {
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
              overline="Dimensionering OO slutenvård"
              title="Bemanning kopplad till vårddygn och vårdplatser"
            />
            <Alert severity="info">Laddar sparat underlag...</Alert>
          </Stack>
        </Container>
      </Box>
    );
  }

  return <LoadedInpatientOoDimensioningView />;
}

function LoadedInpatientOoDimensioningView() {
  const [productionRow] = useState<InpatientProductionRow | null>(() =>
    readCurrentInpatientProductionRow()
  );
  const [distributions] = useState<InpatientOoDistributionRow[]>(() => {
    const savedProductionRow = readCurrentInpatientProductionRow();
    const savedDistributions = readCurrentInpatientOoDistributions();

    return savedProductionRow
      ? savedDistributions.filter(
          (row) => row.productionRowId === savedProductionRow.id
        )
      : [];
  });
  const [rows, setRows] = useState<InpatientOoDimensioningRow[]>(() =>
    readCurrentInpatientOoDimensioningRows()
  );
  const [settings, setSettings] = useState<InpatientOoDimensioningSettings>(
    () => readCurrentInpatientOoDimensioningSettings()
  );
  const [saveMessage, setSaveMessage] = useState("");
  const [hasSavedRows, setHasSavedRows] = useState(() =>
    hasCurrentInpatientOoDimensioning()
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
          careDaysFromProductionPlan: annualCareDays,
          presence,
          weeklyHours:
            averageCarePlaces * toNumber(row.hoursPerCarePlacePerDay) * 7,
          staffingCost: presence * toNumber(row.salaryCostPerPresence),
        };
      }),
    [annualCareDays, averageCarePlaces, rows]
  );
  const supportPresence = calculateOoSupportPresence(settings);
  const totalPresence =
    resultRows.reduce((sum, row) => sum + row.presence, 0) + supportPresence;
  const totalCost = resultRows.reduce((sum, row) => sum + row.staffingCost, 0);
  const periodizationRows = useMemo(
    () =>
      productionRow
        ? buildInpatientOoPeriodizationRows({
            productionRow,
            rows: resultRows,
            supportPresence,
          })
        : [],
    [productionRow, resultRows, supportPresence]
  );
  const canOpenResults = hasSavedRows && !hasUnsavedChanges;

  function updateRow(
    rowId: string,
    field: OoRowNumberField,
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

  function updateSetting(field: OoSettingsField, value: string) {
    setSaveMessage("");
    setHasUnsavedChanges(true);
    setSettings((current) => ({ ...current, [field]: Number(value) }));
  }

  function saveRows() {
    saveCurrentInpatientOoDimensioning(rows, settings);
    setHasSavedRows(true);
    setHasUnsavedChanges(false);
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
                  overline="Steg 1"
                  title="Bemanningstid per vårdplats"
                  description="Fyll i hur många arbetstimmar varje yrkeskategori behöver per genomsnittlig vårdplats och dygn. Timmar/vecka räknas som snitt vårdplatser × timmar × 7."
                />
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headerCellSx}>Yrkeskategori</TableCell>
                        <TableCell sx={headerCellSx} align="right">
                          Vårddygn från produktionsplan
                        </TableCell>
                        <TableCell sx={headerCellSx} align="right">
                          Arbetstimmar per vårdplats och dygn
                        </TableCell>
                        <TableCell sx={headerCellSx} align="right">
                          Veckoarbetstid
                        </TableCell>
                        <TableCell sx={headerCellSx} align="right">
                          Lönekostnad per historisk närvaro
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
                          <TableCell align="right">
                            {formatWholeNumber(row.careDaysFromProductionPlan)}
                          </TableCell>
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
                  overline="Steg 2"
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

              <PeriodizationCurveSection
                rows={periodizationRows}
                overline="Steg 3"
                title="Produktionstakt per vecka"
                description="OO-dimensioneringen för slutenvård periodiseras över 52 veckor. Klicka på en vecka för att justera produktionstakten för en vald period."
                emptyText="Periodiseringskurvan visas när det finns OO-dimensionering att räkna på."
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
                      Spara OO-dimensioneringen innan du går till resultat.
                      Standardvärden i tabellen räknas inte in förrän de är
                      sparade.
                    </Alert>
                  ) : hasUnsavedChanges ? (
                    <Alert severity="warning">
                      Du har osparade ändringar. Spara OO-dimensioneringen innan
                      du går till resultat.
                    </Alert>
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

function buildInpatientOoPeriodizationRows(params: {
  productionRow: InpatientProductionRow;
  rows: InpatientOoResultRow[];
  supportPresence: number;
}): WeeklyCurveSourceRow[] {
  const productionPresence = params.rows.reduce(
    (sum, row) => sum + row.presence,
    0
  );
  const productionRows = params.rows
    .filter((row) => row.presence > 0)
    .map((row) => {
      const share =
        productionPresence > 0 ? row.presence / productionPresence : 0;

      return {
        id: `oo-${row.id}`,
        careUnitName: "OO slutenvård",
        roleCategory: row.roleCategory,
        visits: params.productionRow.careEvents * share,
        totalVisitMinutes:
          row.presence *
          PERIODIZATION_WEEKLY_WORKING_MINUTES *
          PERIODIZATION_WEEKS_PER_YEAR,
        drgPoints: params.productionRow.drgPoints * share,
      };
    });

  if (params.supportPresence <= 0) {
    return productionRows;
  }

  return [
    ...productionRows,
    {
      id: "oo-support-admin",
      careUnitName: "Vårdnära stöd/admin",
      roleCategory: "Stöd/admin",
      visits: 0,
      totalVisitMinutes:
        params.supportPresence *
        PERIODIZATION_WEEKLY_WORKING_MINUTES *
        PERIODIZATION_WEEKS_PER_YEAR,
      drgPoints: 0,
    },
  ];
}

function EditableNumberCell(props: {
  onChange: (value: string) => void;
  value: number;
}) {
  return (
    <TableCell align="right">
      <FormattedNumberTextField
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
    <FormattedNumberTextField
      label={props.label}
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
  lineHeight: 1.25,
  whiteSpace: "normal",
};

const actionRowSx = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1.5,
};
