"use client";

import { type ReactNode, useMemo, useSyncExternalStore } from "react";
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
  Typography,
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
  InpatientDimensioningResultRow,
  InpatientProductionRow,
} from "../types/inpatient.types";
import {
  buildInpatientDimensioningResultRows,
  buildMonthlyDimensioningRows,
  calculateCostPerValue,
} from "../utils/inpatient-calculations";
import {
  hasCurrentInpatientMeDimensioning,
  hasCurrentInpatientOoDimensioning,
  hasCurrentInpatientOoDistributions,
  readCurrentInpatientMeDimensioningRows,
  readCurrentInpatientOoDimensioningRows,
  readCurrentInpatientOoDimensioningSettings,
  readCurrentInpatientOoDistributions,
  readCurrentInpatientProductionRow,
} from "../utils/current-inpatient-session";

const MONTHS_PER_YEAR = 12;

type AggregatedResultRow = {
  id: string;
  label: string;
  secondaryLabel?: string;
  presence: number;
  staffingCost: number;
};

type ResultTableCell = {
  align?: "left" | "right";
  value: string;
};

export function InpatientDimensioningResultsView() {
  const hasLoadedSession = useSyncExternalStore(
    subscribeToClientHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );
  const session = useMemo(() => {
    if (!hasLoadedSession) {
      return {
        distributions: [],
        hasSavedMeDimensioning: false,
        hasSavedOoDimensioning: false,
        hasSavedOoDistributions: false,
        meRows: [],
        ooRows: [],
        ooSettings: null,
        productionRow: null,
      };
    }

    const productionRow = readCurrentInpatientProductionRow();
    const hasSavedMeDimensioning = hasCurrentInpatientMeDimensioning();
    const hasSavedOoDimensioning = hasCurrentInpatientOoDimensioning();
    const savedDistributions = readCurrentInpatientOoDistributions();

    return {
      distributions: productionRow
        ? savedDistributions.filter(
            (row) => row.productionRowId === productionRow.id
          )
        : [],
      hasSavedMeDimensioning,
      hasSavedOoDimensioning,
      hasSavedOoDistributions: hasCurrentInpatientOoDistributions(),
      meRows: hasSavedMeDimensioning
        ? readCurrentInpatientMeDimensioningRows()
        : [],
      ooRows: hasSavedOoDimensioning
        ? readCurrentInpatientOoDimensioningRows()
        : [],
      ooSettings: hasSavedOoDimensioning
        ? readCurrentInpatientOoDimensioningSettings()
        : null,
      productionRow,
    };
  }, [hasLoadedSession]);

  const annualRows = useMemo(
    () =>
      buildInpatientDimensioningResultRows({
        productionRow: session.productionRow,
        distributions: session.distributions,
        meRows: session.meRows,
        ooRows: session.ooRows,
        ooSettings: session.ooSettings,
      }),
    [session]
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

          {!hasLoadedSession ? (
            <SectionCard>
              <Typography variant="body2" color="text.secondary">
                Laddar resultat...
              </Typography>
            </SectionCard>
          ) : !session.productionRow ? (
            <Alert severity="info">
              Spara en produktionsplan för slutenvård innan resultat visas.
            </Alert>
          ) : (
            <>
              <ResultBasisSection
                hasSavedMeDimensioning={session.hasSavedMeDimensioning}
                hasSavedOoDimensioning={session.hasSavedOoDimensioning}
                hasSavedOoDistributions={
                  session.hasSavedOoDistributions &&
                  session.distributions.length > 0
                }
                productionRow={session.productionRow}
              />

              {annualRows.length === 0 ? (
                <SectionCard tone="action">
                  <Stack spacing={2}>
                    <Alert severity="warning">
                      Spara dimensionering ME eller OO innan resultatet
                      sammanställs. Standardrader räknas inte som sparat
                      underlag.
                    </Alert>
                    <Box sx={actionRowSx}>
                      <Button
                        variant="contained"
                        href={appRoutes.inpatientDimensioning}
                      >
                        Gå till dimensionering ME
                      </Button>
                      <Button
                        variant="outlined"
                        href={appRoutes.inpatientOoDimensioning}
                      >
                        Gå till dimensionering OO
                      </Button>
                    </Box>
                  </Stack>
                </SectionCard>
              ) : (
                <>
                  <PresenceSection
                    annualRows={annualRows}
                    monthlyRows={monthlyRows}
                    totalPresence={totalPresence}
                  />

                  <StaffingCostSection
                    annualRows={annualRows}
                    monthlyRows={monthlyRows}
                    totalStaffingCost={totalStaffingCost}
                  />

                  <CostPerProductionSection
                    annualRows={annualRows}
                    monthlyRows={monthlyRows}
                    productionRow={session.productionRow}
                    totalStaffingCost={totalStaffingCost}
                  />
                </>
              )}
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

function ResultBasisSection(props: {
  hasSavedMeDimensioning: boolean;
  hasSavedOoDimensioning: boolean;
  hasSavedOoDistributions: boolean;
  productionRow: InpatientProductionRow;
}) {
  const includedParts = [
    props.hasSavedMeDimensioning ? "ME" : "",
    props.hasSavedOoDimensioning ? "OO" : "",
  ].filter(Boolean);

  return (
    <SectionCard>
      <FormSection
        overline="Resultatunderlag"
        title="Sparade steg som ingår"
        description="Resultatet bygger bara på sparade steg. Standardvärden i formulär räknas inte in förrän användaren sparar."
      />
      <Box sx={metricGridSx}>
        <PlanningMetricCard
          label="Produktionsplan"
          value={props.productionRow.economicKombika}
        />
        <PlanningMetricCard
          label="Sparad"
          value={formatSavedAt(props.productionRow.savedAt)}
        />
        <PlanningMetricCard
          label="Dimensionering som ingår"
          value={includedParts.join(" + ") || "Saknas"}
        />
        <PlanningMetricCard
          label="OO-fördelning"
          value={props.hasSavedOoDistributions ? "Sparad" : "Ingår inte"}
        />
      </Box>
    </SectionCard>
  );
}

function PresenceSection(props: {
  annualRows: InpatientDimensioningResultRow[];
  monthlyRows: InpatientDimensioningResultRow[];
  totalPresence: number;
}) {
  const categoryRows = groupRows(
    props.annualRows,
    (row) => row.category,
    (row) => ({ label: row.category })
  );
  const sectionRows = groupRows(
    props.annualRows,
    (row) => `${row.section}|${row.careProvidingUnit}`,
    (row) => ({
      label: row.section,
      secondaryLabel: row.careProvidingUnit,
    })
  );
  const monthRows = groupRows(
    props.monthlyRows,
    (row) => row.month,
    (row) => ({ label: row.month })
  );
  const areaRows = groupRows(
    props.annualRows,
    (row) => formatArea(row),
    (row) => ({ label: formatArea(row) })
  );

  return (
    <SectionCard>
      <FormSection
        overline="1. Närvaro"
        title="Närvaro"
        description="Dimensionerad närvaro summerad på de nivåer användaren jämför mot."
      />
      <Box sx={metricGridSx}>
        <PlanningMetricCard
          label="Total närvaro"
          value={formatTwoDecimals(props.totalPresence)}
        />
      </Box>

      <Stack spacing={2.5}>
        <ResultSubSection title="Per yrkeskategori">
          <ResultTable
            emptyText="Det finns inga närvarorader ännu."
            headers={["Yrkeskategori", "Närvaro"]}
            rows={categoryRows.map((row) => ({
              id: `presence-category-${row.id}`,
              cells: [
                { value: row.label },
                { value: formatTwoDecimals(row.presence), align: "right" },
              ],
            }))}
          />
        </ResultSubSection>

        <ResultSubSection title="Per ekonomisk sektion samt vårdande kostnadsställe">
          <ResultTable
            emptyText="Det finns inga sektionsrader ännu."
            headers={[
              "Ekonomisk sektion",
              "Vårdande kostnadsställe",
              "Närvaro",
            ]}
            rows={sectionRows.map((row) => ({
              id: `presence-section-${row.id}`,
              cells: [
                { value: row.label },
                { value: row.secondaryLabel ?? "" },
                { value: formatTwoDecimals(row.presence), align: "right" },
              ],
            }))}
          />
        </ResultSubSection>

        <ResultSubSection
          title="Per månad"
          description="ProdN och lönekostnad finns på månadsnivå, därför visas månad som egen sammanställning."
        >
          <ResultTable
            emptyText="Det finns inga månadsrader ännu."
            headers={["Månad", "Närvaro"]}
            rows={monthRows.map((row) => ({
              id: `presence-month-${row.id}`,
              cells: [
                { value: row.label },
                { value: formatTwoDecimals(row.presence), align: "right" },
              ],
            }))}
          />
        </ResultSubSection>

        <ResultSubSection title="Per område">
          <ResultTable
            emptyText="Det finns inga områdesrader ännu."
            headers={["Område", "Närvaro"]}
            rows={areaRows.map((row) => ({
              id: `presence-area-${row.id}`,
              cells: [
                { value: row.label },
                { value: formatTwoDecimals(row.presence), align: "right" },
              ],
            }))}
          />
        </ResultSubSection>
      </Stack>
    </SectionCard>
  );
}

function StaffingCostSection(props: {
  annualRows: InpatientDimensioningResultRow[];
  monthlyRows: InpatientDimensioningResultRow[];
  totalStaffingCost: number;
}) {
  const categoryRows = groupRows(
    props.annualRows,
    (row) => row.category,
    (row) => ({ label: row.category })
  );
  const sectionRows = groupRows(
    props.annualRows,
    (row) => `${row.section}|${row.careProvidingUnit}`,
    (row) => ({
      label: row.section,
      secondaryLabel: row.careProvidingUnit,
    })
  );
  const monthRows = groupRows(
    props.monthlyRows,
    (row) => row.month,
    (row) => ({ label: row.month })
  );
  const areaRows = groupRows(
    props.annualRows,
    (row) => formatArea(row),
    (row) => ({ label: formatArea(row) })
  );

  return (
    <SectionCard>
      <FormSection
        overline="2. Bemanningskostnader"
        title="Bemanningskostnader"
        description="Bemanningskostnad summerad på samma nivåer som närvaron."
      />
      <Box sx={metricGridSx}>
        <PlanningMetricCard
          label="Total bemanningskostnad"
          value={formatCurrency(props.totalStaffingCost)}
        />
      </Box>

      <Stack spacing={2.5}>
        <ResultSubSection title="Per yrkeskategori">
          <ResultTable
            emptyText="Det finns inga kostnadsrader ännu."
            headers={["Yrkeskategori", "Närvaro", "Bemanningskostnad"]}
            rows={categoryRows.map((row) => ({
              id: `staffing-category-${row.id}`,
              cells: [
                { value: row.label },
                { value: formatTwoDecimals(row.presence), align: "right" },
                { value: formatCurrency(row.staffingCost), align: "right" },
              ],
            }))}
          />
        </ResultSubSection>

        <ResultSubSection title="Per ekonomisk sektion samt vårdande kostnadsställe">
          <ResultTable
            emptyText="Det finns inga sektionsrader ännu."
            headers={[
              "Ekonomisk sektion",
              "Vårdande kostnadsställe",
              "Bemanningskostnad",
            ]}
            rows={sectionRows.map((row) => ({
              id: `staffing-section-${row.id}`,
              cells: [
                { value: row.label },
                { value: row.secondaryLabel ?? "" },
                { value: formatCurrency(row.staffingCost), align: "right" },
              ],
            }))}
          />
        </ResultSubSection>

        <ResultSubSection title="Per månad">
          <ResultTable
            emptyText="Det finns inga månadsrader ännu."
            headers={["Månad", "Bemanningskostnad"]}
            rows={monthRows.map((row) => ({
              id: `staffing-month-${row.id}`,
              cells: [
                { value: row.label },
                { value: formatCurrency(row.staffingCost), align: "right" },
              ],
            }))}
          />
        </ResultSubSection>

        <ResultSubSection title="Per område">
          <ResultTable
            emptyText="Det finns inga områdesrader ännu."
            headers={["Område", "Bemanningskostnad"]}
            rows={areaRows.map((row) => ({
              id: `staffing-area-${row.id}`,
              cells: [
                { value: row.label },
                { value: formatCurrency(row.staffingCost), align: "right" },
              ],
            }))}
          />
        </ResultSubSection>
      </Stack>
    </SectionCard>
  );
}

function CostPerProductionSection(props: {
  annualRows: InpatientDimensioningResultRow[];
  monthlyRows: InpatientDimensioningResultRow[];
  productionRow: InpatientProductionRow;
  totalStaffingCost: number;
}) {
  const monthlyDrgPoints = props.productionRow.drgPoints / MONTHS_PER_YEAR;
  const monthlyCareDays = props.productionRow.careDays / MONTHS_PER_YEAR;
  const categoryRows = groupRows(
    props.annualRows,
    (row) => row.category,
    (row) => ({ label: row.category })
  );
  const sectionRows = groupRows(
    props.annualRows,
    (row) => `${row.section}|${row.careProvidingUnit}`,
    (row) => ({
      label: row.section,
      secondaryLabel: row.careProvidingUnit,
    })
  );
  const monthRows = groupRows(
    props.monthlyRows,
    (row) => row.month,
    (row) => ({ label: row.month })
  );

  return (
    <SectionCard>
      <FormSection
        overline="3. Bemanningskostnader per DRG/vårddygn/vårdplats"
        title="Bemanningskostnader per DRG/vårddygn/vårdplats"
        description="Nyckeltal som jämför bemanningskostnad mot slutenvårdens produktionsmått."
      />
      <Box sx={metricGridSx}>
        <PlanningMetricCard
          label="Kostnad per DRG"
          value={formatCurrency(
            calculateCostPerValue(
              props.totalStaffingCost,
              props.productionRow.drgPoints
            )
          )}
        />
        <PlanningMetricCard
          label="Kostnad per vårddygn"
          value={formatCurrency(
            calculateCostPerValue(
              props.totalStaffingCost,
              props.productionRow.careDays
            )
          )}
        />
        <PlanningMetricCard
          label="Kostnad per vårdplats"
          value={formatCurrency(
            calculateCostPerValue(
              props.totalStaffingCost,
              props.productionRow.averageCarePlaces
            )
          )}
        />
      </Box>

      <Stack spacing={2.5}>
        <ResultSubSection title="Per yrkeskategori">
          <ProductionCostTable
            rows={categoryRows}
            drgPoints={props.productionRow.drgPoints}
            careDays={props.productionRow.careDays}
            averageCarePlaces={props.productionRow.averageCarePlaces}
            firstHeader="Yrkeskategori"
            rowIdPrefix="production-cost-category"
          />
        </ResultSubSection>

        <ResultSubSection title="Per ekonomisk sektion samt vårdande kostnadsställe">
          <ProductionCostTable
            rows={sectionRows}
            drgPoints={props.productionRow.drgPoints}
            careDays={props.productionRow.careDays}
            averageCarePlaces={props.productionRow.averageCarePlaces}
            firstHeader="Ekonomisk sektion"
            includeSecondaryLabel
            rowIdPrefix="production-cost-section"
          />
        </ResultSubSection>

        <ResultSubSection title="Per månad">
          <ProductionCostTable
            rows={monthRows}
            drgPoints={monthlyDrgPoints}
            careDays={monthlyCareDays}
            averageCarePlaces={props.productionRow.averageCarePlaces}
            firstHeader="Månad"
            includeProductionVolumes
            rowIdPrefix="production-cost-month"
          />
        </ResultSubSection>
      </Stack>
    </SectionCard>
  );
}

function ProductionCostTable(props: {
  averageCarePlaces: number;
  careDays: number;
  drgPoints: number;
  firstHeader: string;
  includeProductionVolumes?: boolean;
  includeSecondaryLabel?: boolean;
  rowIdPrefix: string;
  rows: AggregatedResultRow[];
}) {
  const headers = [
    props.firstHeader,
    ...(props.includeSecondaryLabel ? ["Vårdande kostnadsställe"] : []),
    "Bemanningskostnad",
    ...(props.includeProductionVolumes ? ["DRG"] : []),
    "Kostnad per DRG",
    ...(props.includeProductionVolumes ? ["Vårddygn"] : []),
    "Kostnad per vårddygn",
    ...(props.includeProductionVolumes ? ["Vårdplats"] : []),
    "Kostnad per vårdplats",
  ];

  return (
    <ResultTable
      emptyText="Det finns inga nyckeltalsrader ännu."
      headers={headers}
      rows={props.rows.map((row) => {
        const cells: ResultTableCell[] = [
          textCell(row.label),
          ...(props.includeSecondaryLabel
            ? [textCell(row.secondaryLabel ?? "")]
            : []),
          rightCell(formatCurrency(row.staffingCost)),
          ...(props.includeProductionVolumes
            ? [rightCell(formatTwoDecimals(props.drgPoints))]
            : []),
          rightCell(
            formatCurrency(
              calculateCostPerValue(row.staffingCost, props.drgPoints)
            )
          ),
          ...(props.includeProductionVolumes
            ? [rightCell(formatTwoDecimals(props.careDays))]
            : []),
          rightCell(
            formatCurrency(
              calculateCostPerValue(row.staffingCost, props.careDays)
            )
          ),
          ...(props.includeProductionVolumes
            ? [rightCell(formatTwoDecimals(props.averageCarePlaces))]
            : []),
          rightCell(
            formatCurrency(
              calculateCostPerValue(
                row.staffingCost,
                props.averageCarePlaces
              )
            )
          ),
        ];

        return {
          id: `${props.rowIdPrefix}-${row.id}`,
          cells,
        };
      })}
    />
  );
}

function textCell(value: string): ResultTableCell {
  return { value };
}

function rightCell(value: string): ResultTableCell {
  return { value, align: "right" };
}

function ResultSubSection(props: {
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <Box sx={subSectionSx}>
      <Typography variant="subtitle2" sx={subSectionTitleSx}>
        {props.title}
      </Typography>
      {props.description ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {props.description}
        </Typography>
      ) : null}
      {props.children}
    </Box>
  );
}

function ResultTable(props: {
  emptyText: string;
  headers: string[];
  rows: Array<{
    id: string;
    cells: ResultTableCell[];
  }>;
}) {
  return props.rows.length === 0 ? (
    <Alert severity="info">{props.emptyText}</Alert>
  ) : (
    <Box sx={tableWrapSx}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {props.headers.map((header) => (
              <TableCell
                key={header}
                sx={headerCellSx}
                align={isNumericHeader(header) ? "right" : "left"}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.rows.map((row) => (
            <TableRow key={row.id}>
              {row.cells.map((cell, index) => (
                <TableCell
                  key={`${row.id}-${props.headers[index]}`}
                  align={cell.align ?? "left"}
                  sx={bodyCellSx}
                >
                  {cell.value}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

function groupRows(
  rows: InpatientDimensioningResultRow[],
  getKey: (row: InpatientDimensioningResultRow) => string,
  getLabels: (row: InpatientDimensioningResultRow) => {
    label: string;
    secondaryLabel?: string;
  }
): AggregatedResultRow[] {
  const groupedRows = new Map<string, AggregatedResultRow>();

  for (const row of rows) {
    const key = getKey(row);
    const existingRow = groupedRows.get(key);

    if (existingRow) {
      existingRow.presence += row.presence;
      existingRow.staffingCost += row.staffingCost;
    } else {
      groupedRows.set(key, {
        id: key,
        ...getLabels(row),
        presence: row.presence,
        staffingCost: row.staffingCost,
      });
    }
  }

  return Array.from(groupedRows.values());
}

function formatArea(row: InpatientDimensioningResultRow): string {
  const category = row.category.toLocaleLowerCase("sv-SE");

  if (category.includes("admin") || category.includes("stöd")) {
    return "Admin";
  }

  return "SLV";
}

function formatCurrency(value: number): string {
  return `${formatWholeNumber(value)} kr`;
}

function formatSavedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Saknas";
  }

  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  const hours = padDatePart(date.getHours());
  const minutes = padDatePart(date.getMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function padDatePart(value: number): string {
  return String(value).padStart(2, "0");
}

function isNumericHeader(header: string): boolean {
  return [
    "Närvaro",
    "Bemanningskostnad",
    "DRG",
    "Kostnad per DRG",
    "Vårddygn",
    "Kostnad per vårddygn",
    "Vårdplats",
    "Kostnad per vårdplats",
  ].includes(header);
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
    xl: "repeat(3, minmax(0, 1fr))",
  },
  mb: 2,
};

const subSectionSx = {
  borderTop: "1px solid var(--color-border)",
  pt: 1.5,
};

const subSectionTitleSx = {
  color: "#005883",
  fontWeight: 700,
  mb: 1,
};

const tableWrapSx = {
  overflowX: "auto",
};

const actionRowSx = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1.5,
};

const headerCellSx = {
  color: "#005883",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const bodyCellSx = {
  verticalAlign: "top",
  whiteSpace: "nowrap",
};
