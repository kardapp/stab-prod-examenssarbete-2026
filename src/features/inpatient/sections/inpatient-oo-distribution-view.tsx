"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { PageHeader } from "@/shared/components/page-header";
import { PlanningMetricCard } from "@/shared/components/planning-metric-card";
import { SectionCard } from "@/shared/components/section-card";
import { appRoutes } from "@/shared/routes";
import { formatOneDecimal, formatWholeNumber } from "@/shared/utils/format-number";
import {
  inpatientCareProvidingUnits,
} from "../constants/inpatient-options";
import type {
  InpatientOoDistributionRow,
  InpatientProductionRow,
} from "../types/inpatient.types";
import {
  calculateDistributedCareDays,
  calculateDistributionPercentage,
  toNumber,
} from "../utils/inpatient-calculations";
import {
  hasCurrentInpatientOoDistributions,
  readCurrentInpatientOoDistributions,
  readCurrentInpatientProductionRow,
  saveCurrentInpatientOoDistributions,
} from "../utils/current-inpatient-session";

export function InpatientOoDistributionView() {
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
              overline="OO-fördelning slutenvård"
              title="Fördelning av vårddygn till OO"
            />
            <Alert severity="info">Laddar sparat underlag...</Alert>
          </Stack>
        </Container>
      </Box>
    );
  }

  return <LoadedInpatientOoDistributionView />;
}

function LoadedInpatientOoDistributionView() {
  const [initialSession] = useState(readInpatientOoDistributionSession);
  const productionRow = initialSession.productionRow;
  const [rows, setRows] = useState<InpatientOoDistributionRow[]>(
    initialSession.rows
  );
  const [saveMessage, setSaveMessage] = useState("");
  const [hasSavedRows, setHasSavedRows] = useState(
    initialSession.hasSavedRows
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const summary = useMemo(() => {
    const totalDistributedCareDays = rows.reduce(
      (sum, row) => sum + toNumber(row.distributedCareDays),
      0
    );
    const totalPercentage = productionRow
      ? calculateDistributionPercentage(
          productionRow.careDays,
          totalDistributedCareDays
        )
      : 0;

    return {
      totalDistributedCareDays,
      totalPercentage,
      remainingCareDays: productionRow
        ? productionRow.careDays - totalDistributedCareDays
        : 0,
    };
  }, [productionRow, rows]);
  const distributionError =
    productionRow && summary.totalDistributedCareDays > productionRow.careDays + 0.01
      ? "Fördelade vårddygn får inte överstiga beräknade vårddygn."
      : "";
  const canContinue = Boolean(
    productionRow && hasSavedRows && !hasUnsavedChanges && !distributionError
  );

  function updateRow(
    rowId: string,
    changes: Partial<InpatientOoDistributionRow>
  ) {
    setSaveMessage("");
    setHasUnsavedChanges(true);
    setRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, ...changes } : row))
    );
  }

  function handlePercentageChange(rowId: string, percentage: number) {
    updateRow(rowId, {
      percentage,
      distributedCareDays: productionRow
        ? calculateDistributedCareDays(productionRow.careDays, percentage)
        : 0,
    });
  }

  function handleCareDaysChange(rowId: string, distributedCareDays: number) {
    updateRow(rowId, {
      distributedCareDays,
      percentage: productionRow
        ? calculateDistributionPercentage(productionRow.careDays, distributedCareDays)
        : 0,
    });
  }

  function addDistributionRow() {
    if (!productionRow) {
      return;
    }

    setSaveMessage("");
    setHasUnsavedChanges(true);
    setRows((current) => [
      ...current,
      createDistributionRow(productionRow, current.length, 0),
    ]);
  }

  function removeDistributionRow(rowId: string) {
    setSaveMessage("");
    setHasUnsavedChanges(true);
    setRows((current) => current.filter((row) => row.id !== rowId));
  }

  function saveDistribution() {
    if (!productionRow) {
      return;
    }

    if (distributionError) {
      setHasSavedRows(false);
      setSaveMessage(distributionError);
      return;
    }

    saveCurrentInpatientOoDistributions(rows);
    setHasSavedRows(true);
    setHasUnsavedChanges(false);
    setSaveMessage("OO-fördelning för slutenvård sparad.");
  }

  return (
    <Box component="main" sx={pageSx}>
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <PageHeader
            overline="OO-fördelning slutenvård"
            title="Fördelning av vårddygn till OO"
          />

          {!productionRow ? (
            <Alert severity="info">
              Spara en produktionsplan för slutenvård innan vårddygn fördelas.
            </Alert>
          ) : (
            <>
              <SectionCard>
                <FormSection
                  overline="Produktionsunderlag"
                  title="Vårddygn från produktionsplanen"
                />
                <Box sx={metricGridSx}>
                  <PlanningMetricCard
                    label="Ekonomisk kombika"
                    value={productionRow.economicKombika}
                  />
                  <PlanningMetricCard
                    label="Vårdtillfällen"
                    value={formatWholeNumber(productionRow.careEvents)}
                  />
                  <PlanningMetricCard
                    label="Vårddygn att fördela"
                    value={formatWholeNumber(productionRow.careDays)}
                  />
                  <PlanningMetricCard
                    label="Snitt antal vårdplatser"
                    value={formatOneDecimal(productionRow.averageCarePlaces)}
                  />
                </Box>
              </SectionCard>

              <SectionCard>
                <FormSection
                  overline="OO-fördelning"
                  title="Fördela vårddygn"
                />
                <Box sx={metricGridSx}>
                  <PlanningMetricCard
                    label="Fördelade vårddygn"
                    value={formatOneDecimal(summary.totalDistributedCareDays)}
                  />
                  <PlanningMetricCard
                    label="Fördelad andel"
                    value={`${formatOneDecimal(summary.totalPercentage)}%`}
                  />
                  <PlanningMetricCard
                    label="Kvar att fördela"
                    value={formatOneDecimal(summary.remainingCareDays)}
                  />
                </Box>

                <Box sx={[tableStackSx, { mt: 2 }]}>
                  {rows.map((row) => (
                    <Box key={row.id} sx={distributionRowSx}>
                      <TextField
                        select
                        label="Vårdande enhet"
                        size="small"
                        value={row.careProvidingUnit}
                        onChange={(event) =>
                          updateRow(row.id, {
                            careProvidingUnit: event.target.value,
                          })
                        }
                        fullWidth
                      >
                        {inpatientCareProvidingUnits.map((unit) => (
                          <MenuItem key={unit} value={unit}>
                            {unit}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        label="Andel"
                        type="number"
                        size="small"
                        value={formatInputNumber(row.percentage)}
                        onChange={(event) =>
                          handlePercentageChange(row.id, Number(event.target.value))
                        }
                        fullWidth
                        slotProps={{ htmlInput: { min: 0, max: 100, step: 0.1 } }}
                      />
                      <TextField
                        label="Vårddygn"
                        type="number"
                        size="small"
                        value={formatInputNumber(row.distributedCareDays)}
                        onChange={(event) =>
                          handleCareDaysChange(
                            row.id,
                            Number(event.target.value)
                          )
                        }
                        fullWidth
                        slotProps={{ htmlInput: { min: 0, step: 1 } }}
                      />
                      <Button
                        variant="outlined"
                        color="error"
                        disabled={rows.length <= 1}
                        onClick={() => removeDistributionRow(row.id)}
                      >
                        Ta bort
                      </Button>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ mt: 1.5 }}>
                  <Button variant="outlined" onClick={addDistributionRow}>
                    Lägg till fördelningsrad
                  </Button>
                </Box>
              </SectionCard>

              <SectionCard tone="action">
                <Stack spacing={2}>
                  {saveMessage ? (
                    <Alert
                      severity={
                        saveMessage.includes("inte") ? "error" : "success"
                      }
                    >
                      {saveMessage}
                    </Alert>
                  ) : null}
                  {!hasSavedRows ? (
                    <Alert severity="warning">
                      Spara OO-fördelningen innan du går vidare. Förslagsraderna
                      räknas inte in förrän de är sparade.
                    </Alert>
                  ) : hasUnsavedChanges ? (
                    <Alert severity="warning">
                      Du har osparade ändringar. Spara OO-fördelningen innan du
                      går vidare.
                    </Alert>
                  ) : null}
                  {distributionError && saveMessage !== distributionError ? (
                    <Alert severity="error">{distributionError}</Alert>
                  ) : null}
                  <Box sx={actionRowSx}>
                    <Button variant="contained" onClick={saveDistribution}>
                      Spara OO-fördelning
                    </Button>
                    <Button
                      variant="outlined"
                      href={appRoutes.inpatientProductionPlanning}
                    >
                      Tillbaka till produktionsplanering
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={!canContinue}
                      href={
                        canContinue
                          ? appRoutes.inpatientOoDimensioning
                          : undefined
                      }
                    >
                      Gå till dimensionering OO
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={!canContinue}
                      href={
                        canContinue
                          ? appRoutes.inpatientProductionPlanningResults
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

function readInpatientOoDistributionSession(): {
  hasSavedRows: boolean;
  productionRow: InpatientProductionRow | null;
  rows: InpatientOoDistributionRow[];
} {
  const productionRow = readCurrentInpatientProductionRow();
  const savedRows = readCurrentInpatientOoDistributions();
  const rowsForProduction = productionRow
    ? savedRows.filter((row) => row.productionRowId === productionRow.id)
    : [];

  return {
    hasSavedRows:
      hasCurrentInpatientOoDistributions() && rowsForProduction.length > 0,
    productionRow,
    rows:
      productionRow && rowsForProduction.length === 0
        ? [
            createDistributionRow(productionRow, 0, 60),
            createDistributionRow(productionRow, 1, 40),
          ]
        : rowsForProduction,
  };
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

function createDistributionRow(
  productionRow: InpatientProductionRow,
  index: number,
  percentage: number
): InpatientOoDistributionRow {
  return {
    id: `inpatient-oo-${index + 1}`,
    productionRowId: productionRow.id,
    careProvidingUnit:
      inpatientCareProvidingUnits[index] ?? inpatientCareProvidingUnits[0],
    percentage,
    distributedCareDays: calculateDistributedCareDays(
      productionRow.careDays,
      percentage
    ),
  };
}

function formatInputNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
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

const tableStackSx = {
  display: "grid",
  gap: 1,
};

const distributionRowSx = {
  alignItems: "center",
  bgcolor: "background.default",
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  display: "grid",
  gap: 1,
  gridTemplateColumns: {
    xs: "1fr",
    lg: "minmax(220px, 1.2fr) minmax(120px, 0.55fr) minmax(140px, 0.65fr) auto",
  },
  p: 1.5,
};

const actionRowSx = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1.5,
};
