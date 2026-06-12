"use client";

import type { ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
import { SectionCard } from "@/shared/components/section-card";
import { appRoutes } from "@/shared/routes";
import {
  formatOneDecimal,
  formatWholeNumber,
} from "@/shared/utils/format-number";
import { useOutpatientProductionResults } from "../hooks/use-outpatient-production-results";
import type {
  DrgResultRow,
  ProductionPlanningComparisonRow,
  ProductionPlanningResultRow,
  ProductionPlanningVisitTimeComment,
} from "../types/outpatient-production-results.types";
import {
  calculateDrgRows,
  formatCareUnit,
  formatComparisonEconomicUnit,
  formatDrgEconomicUnit,
  formatEconomicUnit,
  periodizeProductionPlanningResultRows,
} from "../utils/outpatient-production-results-calculations";

export function OutpatientProductionResultsView() {
  const results = useOutpatientProductionResults();

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", bgcolor: "var(--page-background)", p: 2 }}
    >
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <PageHeader
            overline="Resultat produktionsplan"
            title="Resultat produktionsplan öppenvård"
          />

          {results.isLoading ? (
            <SectionCard>
              <CircularProgress />
            </SectionCard>
          ) : results.errorMessage ? (
            <Alert severity="error">{results.errorMessage}</Alert>
          ) : (
            <Stack spacing={2}>
              {results.resultRows.length === 0 ? (
                <Alert severity="info">
                  Det finns inga sparade produktionsrader att visa ännu.
                </Alert>
              ) : (
                <>
                  {results.summary.undistributedRows > 0 ? (
                    <Alert severity="warning">
                      {results.summary.undistributedRows} produktionsrad(er)
                      saknar OO-fördelning och visas som ej fördelade.
                    </Alert>
                  ) : null}

                  <VisitCountSection rows={results.resultRows} />
                  <VisitTimeSection rows={results.resultRows} />
                  <DrgSection rows={results.resultRows} />

                  <VisitTimeCommentsSection
                    comments={results.visitTimeComments}
                  />

                  <ComparisonSection rows={results.comparisonRows} />
                </>
              )}
            </Stack>
          )}

          <ActionsSection />
        </Stack>
      </Container>
    </Box>
  );
}

function VisitCountSection(props: { rows: ProductionPlanningResultRow[] }) {
  const dailyRows = periodizeProductionPlanningResultRows(props.rows, "day");
  const totalVisits = sumResultRows(props.rows, "visits");
  const dailyVisits = sumResultRows(dailyRows, "visits");
  const economicCareRows = groupRowsByEconomicCareUnit(props.rows);
  const dailyEconomicRows = groupRowsByEconomicUnit(dailyRows);
  const roleRows = groupRowsByRole(props.rows);

  return (
    <SectionCard>
      <FormSection
        overline="1. Antal vårdhändelser"
        title="Antal vårdhändelser"
        description="Visar den sparade produktionsvolymen för öppenvård, uppdelad enligt produktionsplan och OO-fördelning."
      />

      <Box sx={resultSummaryGridSx}>
        <MetricValue
          label="Årets vårdhändelser"
          value={formatOneDecimal(totalVisits)}
        />
        <MetricValue
          label="Vårdhändelser per dag"
          value={formatOneDecimal(dailyVisits)}
        />
        <MetricValue
          label="Yrkeskategorier"
          value={formatWholeNumber(roleRows.length)}
        />
      </Box>

      <Stack spacing={2}>
        <ResultSubSection title="Per ekonomisk kombika och vårdande enhet">
          <ResultTable
            emptyText="Det finns inga vårdhändelser per ekonomisk kombika och vårdande enhet."
            columns={annualVisitColumns}
            rows={economicCareRows.map((row) => ({
              id: row.id,
              cells: {
                primary: textCell(row.label),
                careUnit: textCell(row.secondaryLabel ?? "Saknas"),
                year: textCell(row.year),
                metric: rightCell(formatOneDecimal(row.visits)),
              },
            }))}
          />
        </ResultSubSection>

        <ResultSubSection title="Per dag">
          <ResultTable
            emptyText="Det finns inga dagvärden för vårdhändelser."
            columns={dailyVisitColumns}
            rows={dailyEconomicRows.map((row) => ({
              id: row.id,
              cells: {
                primary: textCell(row.label),
                year: textCell(row.year),
                metric: rightCell(formatOneDecimal(row.visits)),
              },
            }))}
          />
        </ResultSubSection>

        <ResultSubSection title="Per yrkeskategori">
          <ResultTable
            emptyText="Det finns inga vårdhändelser per yrkeskategori."
            columns={roleVisitColumns}
            rows={roleRows.map((row) => ({
              id: row.id,
              cells: {
                primary: textCell(row.label),
                year: textCell(row.year),
                metric: rightCell(formatOneDecimal(row.visits)),
              },
            }))}
          />
        </ResultSubSection>
      </Stack>
    </SectionCard>
  );
}

function VisitTimeSection(props: { rows: ProductionPlanningResultRow[] }) {
  const dailyRows = periodizeProductionPlanningResultRows(props.rows, "day");
  const totalVisitMinutes = sumResultRows(props.rows, "totalVisitMinutes");
  const dailyVisitMinutes = sumResultRows(dailyRows, "totalVisitMinutes");
  const averageMinutesPerVisit = safeDivide(
    totalVisitMinutes,
    sumResultRows(props.rows, "visits")
  );
  const economicCareRows = groupRowsByEconomicCareUnit(props.rows);
  const dailyEconomicRows = groupRowsByEconomicUnit(dailyRows);
  const roleRows = groupRowsByRole(props.rows);

  return (
    <SectionCard>
      <FormSection
        overline="2. Besökstid"
        title="Besökstid"
        description="Visar beräknad tid för vårdhändelser utifrån snittid och volym."
      />

      <Box sx={resultSummaryGridSx}>
        <MetricValue
          label="Total besökstid"
          value={formatMinutes(totalVisitMinutes)}
        />
        <MetricValue
          label="Besökstid per dag"
          value={formatMinutes(dailyVisitMinutes)}
        />
        <MetricValue
          label="Snitt per vårdhändelse"
          value={`${formatOneDecimal(averageMinutesPerVisit)} min`}
        />
      </Box>

      <Stack spacing={2}>
        <ResultSubSection title="Per ekonomisk kombika och vårdande enhet">
          <ResultTable
            emptyText="Det finns ingen besökstid per ekonomisk kombika och vårdande enhet."
            columns={annualVisitTimeColumns}
            rows={economicCareRows.map((row) => ({
              id: row.id,
              cells: {
                primary: textCell(row.label),
                careUnit: textCell(row.secondaryLabel ?? "Saknas"),
                year: textCell(row.year),
                metric: rightCell(formatMinutes(row.totalVisitMinutes)),
                secondaryMetric: rightCell(formatAverageMinutes(row)),
              },
            }))}
          />
        </ResultSubSection>

        <ResultSubSection title="Per dag">
          <ResultTable
            emptyText="Det finns inga dagvärden för besökstid."
            columns={dailyVisitTimeColumns}
            rows={dailyEconomicRows.map((row) => ({
              id: row.id,
              cells: {
                primary: textCell(row.label),
                year: textCell(row.year),
                metric: rightCell(formatMinutes(row.totalVisitMinutes)),
                secondaryMetric: rightCell(formatAverageMinutes(row)),
              },
            }))}
          />
        </ResultSubSection>

        <ResultSubSection title="Per yrkeskategori">
          <ResultTable
            emptyText="Det finns ingen besökstid per yrkeskategori."
            columns={roleVisitTimeColumns}
            rows={roleRows.map((row) => ({
              id: row.id,
              cells: {
                primary: textCell(row.label),
                year: textCell(row.year),
                metric: rightCell(formatMinutes(row.totalVisitMinutes)),
                secondaryMetric: rightCell(formatAverageMinutes(row)),
              },
            }))}
          />
        </ResultSubSection>
      </Stack>
    </SectionCard>
  );
}

function DrgSection(props: { rows: ProductionPlanningResultRow[] }) {
  const annualRows = calculateDrgRows(props.rows);
  const dailyRows = calculateDrgRows(
    periodizeProductionPlanningResultRows(props.rows, "day")
  );
  const totalDrg = sumDrgRows(annualRows, "drgPoints");
  const dailyDrg = sumDrgRows(dailyRows, "drgPoints");

  return (
    <SectionCard>
      <FormSection
        overline="3. Antal DRG"
        title="Antal DRG"
        description="Visar DRG-volymen för öppenvårdens produktionsplan."
      />

      <Box sx={resultSummaryGridSx}>
        <MetricValue label="Årets DRG" value={formatOneDecimal(totalDrg)} />
        <MetricValue label="DRG per dag" value={formatOneDecimal(dailyDrg)} />
      </Box>

      <Stack spacing={2}>
        <ResultSubSection title="Per ekonomisk enhet (kombika)">
          <ResultTable
            emptyText="Det finns inga DRG-värden per ekonomisk enhet."
            columns={annualDrgColumns}
            rows={annualRows.map((row) => ({
              id: row.id,
              cells: {
                primary: textCell(formatDrgEconomicUnit(row)),
                year: textCell(row.year),
                metric: rightCell(formatOneDecimal(row.drgPoints)),
                secondaryMetric: rightCell(
                  formatOneDecimal(safeDivide(row.drgPoints, row.visits))
                ),
              },
            }))}
          />
        </ResultSubSection>

        <ResultSubSection title="Per dag">
          <ResultTable
            emptyText="Det finns inga dagvärden för DRG."
            columns={dailyDrgColumns}
            rows={dailyRows.map((row) => ({
              id: row.id,
              cells: {
                primary: textCell(formatDrgEconomicUnit(row)),
                year: textCell(row.year),
                metric: rightCell(formatOneDecimal(row.drgPoints)),
              },
            }))}
          />
        </ResultSubSection>
      </Stack>
    </SectionCard>
  );
}

function VisitTimeCommentsSection(props: {
  comments: ProductionPlanningVisitTimeComment[];
}) {
  if (props.comments.length === 0) {
    return null;
  }

  return (
    <SectionCard>
      <FormSection
        overline="Kommentar"
        title="Kommentarer om tid per vårdhändelse"
        description="Kommentarer som sparades tillsammans med snitt-tiden i produktionsplaneringen."
      />

      <Box sx={commentListSx}>
        {props.comments.map((comment) => (
          <Box key={comment.id} sx={commentItemSx}>
            <Typography variant="caption" color="text.secondary">
              {comment.economicKombika} · {comment.visitType} ·{" "}
              {formatOneDecimal(comment.averageMinutesPerVisit)} min
            </Typography>
            <Typography sx={{ overflowWrap: "anywhere" }}>
              {comment.comment}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {comment.rowLabels.join(", ")}
            </Typography>
          </Box>
        ))}
      </Box>
    </SectionCard>
  );
}

function ComparisonSection(props: { rows: ProductionPlanningComparisonRow[] }) {
  const summary = props.rows.reduce(
    (current, row) => ({
      currentVisits: current.currentVisits + row.currentVisits,
      previousYearVisits: current.previousYearVisits + row.previousYearVisits,
    }),
    {
      currentVisits: 0,
      previousYearVisits: 0,
    }
  );
  const difference = summary.currentVisits - summary.previousYearVisits;
  const percentageDifference =
    summary.previousYearVisits > 0
      ? (difference / summary.previousYearVisits) * 100
      : null;

  return (
    <SectionCard>
      <FormSection
        overline="4. Jämförelse"
        title="Aktuell plan jämfört med samma period föregående år"
        description="Resultatet visar den senast sparade planen och jämför med föregående års mockdata."
      />

      <Box sx={comparisonSummaryGridSx}>
        <MetricValue
          label="Aktuell plan"
          value={formatOneDecimal(summary.currentVisits)}
        />
        <MetricValue
          label="Samma period föregående år"
          value={formatOneDecimal(summary.previousYearVisits)}
        />
        <MetricValue label="Skillnad" value={formatSignedNumber(difference)} />
        <MetricValue
          label="Förändring"
          value={formatPercentageDifference(percentageDifference)}
        />
      </Box>

      {props.rows.length === 0 ? (
        <Alert severity="info">Det finns inga jämförelserader att visa.</Alert>
      ) : (
        <Box sx={{ display: "grid", gap: 0.75, mt: 2 }}>
          <Box sx={comparisonGridSx}>
            {[
              "Ekonomisk kombika",
              "År",
              "Aktuell plan",
              "Föregående år",
              "Skillnad",
              "Förändring",
              "Källa",
            ].map((header) => (
              <HeaderCell key={header}>{header}</HeaderCell>
            ))}
          </Box>
          {props.rows.map((row) => (
            <Box key={row.id} sx={comparisonGridSx}>
              <ResultCell
                label="Ekonomisk kombika"
                value={formatComparisonEconomicUnit(row)}
              />
              <ResultCell label="År" value={row.year} />
              <ResultCell
                label="Aktuell plan"
                value={formatOneDecimal(row.currentVisits)}
                strong
              />
              <ResultCell
                label="Föregående år"
                value={formatOneDecimal(row.previousYearVisits)}
              />
              <ResultCell
                label="Skillnad"
                value={formatSignedNumber(row.difference)}
              />
              <ResultCell
                label="Förändring"
                value={formatPercentageDifference(row.percentageDifference)}
              />
              <ResultCell label="Källa" value={row.source} />
            </Box>
          ))}
        </Box>
      )}
    </SectionCard>
  );
}

function ActionsSection() {
  return (
    <SectionCard tone="action">
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <Button variant="outlined" href={appRoutes.outpatientOoDistribution}>
          Tillbaka till OO-fördelning
        </Button>
        <Button
          variant="outlined"
          href={appRoutes.outpatientProductionPlanning}
        >
          Tillbaka till produktionsplanering
        </Button>
      </Box>
    </SectionCard>
  );
}

function MetricValue(props: { label: string; value: string }) {
  return (
    <Stack spacing={0.25} sx={metricSx}>
      <Typography variant="caption" color="text.secondary">
        {props.label}
      </Typography>
      <Typography sx={{ color: "#005883", fontWeight: 700 }}>
        {props.value}
      </Typography>
    </Stack>
  );
}

function HeaderCell(props: { children: string }) {
  return (
    <Typography variant="caption" sx={headerCellSx}>
      {props.children}
    </Typography>
  );
}

function ResultCell(props: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: { xs: "block", xl: "none" }, mb: 0.25 }}
      >
        {props.label}
      </Typography>
      <Typography
        sx={{
          fontWeight: props.strong ? 700 : 400,
          overflowWrap: "anywhere",
          whiteSpace: "pre-line",
        }}
      >
        {props.value}
      </Typography>
    </Box>
  );
}

type ResultTableCell = {
  align?: "left" | "right";
  value: string;
};

type ResultTableColumn = {
  align?: "left" | "right";
  header: string;
  isSpacer?: boolean;
  key: string;
  width: string;
};

type ResultTableRow = {
  cells: Partial<Record<string, ResultTableCell>>;
  id: string;
};

type AggregatedProductionResultRow = {
  id: string;
  label: string;
  secondaryLabel?: string;
  year: string;
  visits: number;
  totalVisitMinutes: number;
  drgPoints: number;
};

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
  columns: ResultTableColumn[];
  emptyText: string;
  rows: ResultTableRow[];
}) {
  return props.rows.length === 0 ? (
    <Alert severity="info">{props.emptyText}</Alert>
  ) : (
    <Box sx={tableWrapSx}>
      <Table
        size="small"
        sx={{
          minWidth: props.columns.length > 4 ? 920 : 760,
          tableLayout: "fixed",
        }}
      >
        <colgroup>
          {props.columns.map((column) => (
            <col key={column.key} style={{ width: column.width }} />
          ))}
        </colgroup>
        <TableHead>
          <TableRow>
            {props.columns.map((column) => (
              <TableCell
                key={column.key}
                align={column.align ?? "left"}
                aria-hidden={column.isSpacer ? true : undefined}
                sx={{
                  ...tableHeaderCellSx,
                  ...(column.isSpacer ? tableSpacerCellSx : {}),
                }}
              >
                {column.isSpacer ? null : column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.rows.map((row) => (
            <TableRow key={row.id}>
              {props.columns.map((column) => {
                const cell = row.cells[column.key] ?? textCell("");
                const align = cell.align ?? column.align ?? "left";

                return (
                  <TableCell
                    key={`${row.id}-${column.key}`}
                    align={align}
                    aria-hidden={column.isSpacer ? true : undefined}
                    sx={{
                      ...tableBodyCellSx,
                      ...(align === "right" ? tableNumericCellSx : {}),
                      ...(column.isSpacer ? tableSpacerCellSx : {}),
                    }}
                  >
                    {cell.value}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

function textCell(value: string): ResultTableCell {
  return { value };
}

function rightCell(value: string): ResultTableCell {
  return { align: "right", value };
}

function groupRowsByEconomicCareUnit(
  rows: ProductionPlanningResultRow[]
): AggregatedProductionResultRow[] {
  return groupResultRows(
    rows,
    (row) => [formatEconomicUnit(row), formatCareUnit(row), row.year].join("|"),
    (row) => ({
      label: formatEconomicUnit(row),
      secondaryLabel: formatCareUnit(row),
      year: row.year,
    })
  );
}

function groupRowsByEconomicUnit(
  rows: ProductionPlanningResultRow[]
): AggregatedProductionResultRow[] {
  return groupResultRows(
    rows,
    (row) => [formatEconomicUnit(row), row.year].join("|"),
    (row) => ({
      label: formatEconomicUnit(row),
      year: row.year,
    })
  );
}

function groupRowsByRole(
  rows: ProductionPlanningResultRow[]
): AggregatedProductionResultRow[] {
  return groupResultRows(
    rows,
    (row) => [row.roleCategory, row.year].join("|"),
    (row) => ({
      label: row.roleCategory,
      year: row.year,
    })
  );
}

function groupResultRows(
  rows: ProductionPlanningResultRow[],
  getKey: (row: ProductionPlanningResultRow) => string,
  getLabels: (row: ProductionPlanningResultRow) => {
    label: string;
    secondaryLabel?: string;
    year: string;
  }
): AggregatedProductionResultRow[] {
  const groupedRows = new Map<string, AggregatedProductionResultRow>();

  for (const row of rows) {
    const key = getKey(row);
    const current = groupedRows.get(key);

    if (current) {
      current.visits += row.visits;
      current.totalVisitMinutes += row.totalVisitMinutes;
      current.drgPoints += row.drgPoints;
      continue;
    }

    groupedRows.set(key, {
      id: key,
      ...getLabels(row),
      visits: row.visits,
      totalVisitMinutes: row.totalVisitMinutes,
      drgPoints: row.drgPoints,
    });
  }

  return Array.from(groupedRows.values()).sort(compareAggregatedRows);
}

function compareAggregatedRows(
  first: AggregatedProductionResultRow,
  second: AggregatedProductionResultRow
): number {
  return (
    first.year.localeCompare(second.year, "sv") ||
    first.label.localeCompare(second.label, "sv") ||
    (first.secondaryLabel ?? "").localeCompare(second.secondaryLabel ?? "", "sv")
  );
}

function sumResultRows(
  rows: ProductionPlanningResultRow[],
  field: "drgPoints" | "totalVisitMinutes" | "visits"
): number {
  return rows.reduce((sum, row) => sum + row[field], 0);
}

function sumDrgRows(
  rows: DrgResultRow[],
  field: "drgPoints" | "visits"
): number {
  return rows.reduce((sum, row) => sum + row[field], 0);
}

function formatAverageMinutes(row: AggregatedProductionResultRow): string {
  return `${formatOneDecimal(safeDivide(row.totalVisitMinutes, row.visits))} min`;
}

function formatMinutes(value: number): string {
  return `${formatWholeNumber(value)} min`;
}

function safeDivide(value: number, divisor: number): number {
  if (divisor <= 0) {
    return 0;
  }

  return value / divisor;
}

function formatSignedNumber(value: number): string {
  const formattedValue = formatOneDecimal(value);

  return value > 0 ? `+${formattedValue}` : formattedValue;
}

function formatPercentageDifference(value: number | null): string {
  if (value === null) {
    return "Saknas";
  }

  return `${formatSignedNumber(value)}%`;
}

function createEconomicCareColumns(
  primaryHeader: string,
  metricHeader: string
): ResultTableColumn[] {
  return [
    { key: "primary", header: primaryHeader, width: "34%" },
    { key: "careUnit", header: "Vårdande enhet", width: "28%" },
    { key: "year", header: "År", width: "12%" },
    { key: "metric", header: metricHeader, align: "right", width: "26%" },
  ];
}

function createEconomicCareColumnsWithSecondaryMetric(
  primaryHeader: string,
  metricHeader: string,
  secondaryMetricHeader: string
): ResultTableColumn[] {
  return [
    { key: "primary", header: primaryHeader, width: "30%" },
    { key: "careUnit", header: "Vårdande enhet", width: "24%" },
    { key: "year", header: "År", width: "10%" },
    { key: "metric", header: metricHeader, align: "right", width: "18%" },
    {
      key: "secondaryMetric",
      header: secondaryMetricHeader,
      align: "right",
      width: "18%",
    },
  ];
}

function createGroupedColumns(
  primaryHeader: string,
  metricHeader: string
): ResultTableColumn[] {
  return [
    { key: "primary", header: primaryHeader, width: "34%" },
    { key: "careUnitSpacer", header: "", isSpacer: true, width: "28%" },
    { key: "year", header: "År", width: "12%" },
    { key: "metric", header: metricHeader, align: "right", width: "26%" },
  ];
}

function createGroupedColumnsWithSecondaryMetric(
  primaryHeader: string,
  metricHeader: string,
  secondaryMetricHeader: string
): ResultTableColumn[] {
  return [
    { key: "primary", header: primaryHeader, width: "30%" },
    { key: "careUnitSpacer", header: "", isSpacer: true, width: "24%" },
    { key: "year", header: "År", width: "10%" },
    { key: "metric", header: metricHeader, align: "right", width: "18%" },
    {
      key: "secondaryMetric",
      header: secondaryMetricHeader,
      align: "right",
      width: "18%",
    },
  ];
}

function createGroupedColumnsWithReservedSecondaryMetric(
  primaryHeader: string,
  metricHeader: string
): ResultTableColumn[] {
  return [
    { key: "primary", header: primaryHeader, width: "30%" },
    { key: "careUnitSpacer", header: "", isSpacer: true, width: "24%" },
    { key: "year", header: "År", width: "10%" },
    { key: "metric", header: metricHeader, align: "right", width: "18%" },
    { key: "secondaryMetricSpacer", header: "", isSpacer: true, width: "18%" },
  ];
}

const annualVisitColumns = createEconomicCareColumns(
  "Ekonomisk kombika",
  "Vårdhändelser"
);
const dailyVisitColumns = createGroupedColumns(
  "Ekonomisk kombika",
  "Vårdhändelser per dag"
);
const roleVisitColumns = createGroupedColumns(
  "Yrkeskategori",
  "Vårdhändelser"
);
const annualVisitTimeColumns = createEconomicCareColumnsWithSecondaryMetric(
  "Ekonomisk kombika",
  "Besökstid",
  "Min per vårdhändelse"
);
const dailyVisitTimeColumns = createGroupedColumnsWithSecondaryMetric(
  "Ekonomisk kombika",
  "Besökstid per dag",
  "Min per vårdhändelse"
);
const roleVisitTimeColumns = createGroupedColumnsWithSecondaryMetric(
  "Yrkeskategori",
  "Besökstid",
  "Min per vårdhändelse"
);
const annualDrgColumns = createGroupedColumnsWithSecondaryMetric(
  "Ekonomisk kombika",
  "Antal DRG",
  "DRG-snitt"
);
const dailyDrgColumns = createGroupedColumnsWithReservedSecondaryMetric(
  "Ekonomisk kombika",
  "DRG per dag"
);

const comparisonSummaryGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
    xl: "repeat(4, minmax(0, 1fr))",
  },
  gap: 1.5,
  mb: 2,
};

const resultSummaryGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
    xl: "repeat(3, minmax(0, 1fr))",
  },
  gap: 1.5,
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
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  overflowX: "auto",
  "& .MuiTableCell-root": {
    borderColor: "var(--color-border)",
  },
  "& .MuiTableRow-root:last-of-type .MuiTableCell-root": {
    borderBottom: 0,
  },
};

const tableHeaderCellSx = {
  bgcolor: "var(--section-background)",
  color: "#005883",
  fontWeight: 700,
  lineHeight: 1.25,
};

const tableBodyCellSx = {
  overflowWrap: "anywhere",
  verticalAlign: "top",
  whiteSpace: "normal",
};

const tableNumericCellSx = {
  overflowWrap: "normal",
  whiteSpace: "nowrap",
};

const tableSpacerCellSx = {
  p: 0,
};

const commentListSx = {
  display: "grid",
  gap: 1,
};

const commentItemSx = {
  bgcolor: "var(--section-background)",
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  display: "grid",
  gap: 0.35,
  p: 1.5,
};

const baseResultRowSx = {
  display: "grid",
  gap: 1,
  alignItems: "center",
  borderTop: "1px solid var(--color-border)",
  pt: 1,
};

const comparisonGridSx = {
  ...baseResultRowSx,
  gridTemplateColumns: {
    xs: "1fr",
    xl: "minmax(180px, 1.4fr) minmax(72px, 0.5fr) repeat(4, minmax(112px, 0.75fr)) minmax(150px, 1fr)",
  },
};

const metricSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  p: 1.5,
  bgcolor: "var(--section-background)",
};

const headerCellSx = {
  color: "#005883",
  display: { xs: "none", xl: "block" },
  fontWeight: 700,
  minWidth: 0,
};
