"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { PageHeader } from "@/shared/components/page-header";
import { SectionCard } from "@/shared/components/section-card";
import {
  formatTwoDecimals,
  formatWholeNumber,
} from "@/shared/utils/format-number";
import { useOutpatientDimensioningResults } from "../hooks/use-outpatient-dimensioning-results";
import type {
  DimensioningResultFilters,
  DimensioningResultOptions,
  DimensioningResultRow,
  DimensioningResultSummary,
} from "../types/outpatient-dimensioning-results.types";

export function OutpatientDimensioningResultsView() {
  const results = useOutpatientDimensioningResults();

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", bgcolor: "var(--page-background)", p: 2 }}
    >
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <PageHeader title="Resultat dimensionering - öppenvård" />

          {results.isLoading ? (
            <SectionCard>
              <CircularProgress />
            </SectionCard>
          ) : results.errorMessage ? (
            <Alert severity="error">{results.errorMessage}</Alert>
          ) : (
            <>
              <FilterSection
                filters={results.filters}
                options={results.options}
                onFilterChange={results.handleFilterChange}
                onClearFilters={results.clearFilters}
              />

              {results.resultRows.length === 0 ? (
                <Alert severity="info">
                  Det finns inga sparade dimensioneringsresultat att visa ännu.
                </Alert>
              ) : (
                <Stack spacing={2}>
                  <SummaryStrip summary={results.summary} />

                  <PresenceSection rows={results.groupedRows} />

                  <StaffingCostSection rows={results.groupedRows} />

                  <CostPerProductionSection rows={results.groupedRows} />
                </Stack>
              )}
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

function FilterSection(props: {
  filters: DimensioningResultFilters;
  options: DimensioningResultOptions;
  onFilterChange: (
    field: keyof DimensioningResultFilters,
    value: string
  ) => void;
  onClearFilters: () => void;
}) {
  const showCompetenceFilter = props.options.competenceLevels.some(
    (option) => option !== "OO"
  );

  return (
    <SectionCard>
      <FormSection
        overline="Filter"
        title="Resultatnivå"
      />

      <Box sx={filterGridSx}>
        <TextField
          select
          label="Resultatperiod"
          size="small"
          value={props.filters.periodization}
          onChange={(event) =>
            props.onFilterChange("periodization", event.target.value)
          }
          sx={fieldSx}
        >
          <MenuItem value="year">År</MenuItem>
        </TextField>
        <FilterSelect
          label="Ekonomisk kombika/sektion"
          value={props.filters.section}
          options={props.options.sections}
          onChange={(value) => props.onFilterChange("section", value)}
        />
        <FilterSelect
          label="Yrkeskategori"
          value={props.filters.roleCategory}
          options={props.options.roleCategories}
          onChange={(value) => props.onFilterChange("roleCategory", value)}
        />
        {showCompetenceFilter ? (
          <FilterSelect
            label="Kompetensnivå"
            value={props.filters.competenceLevel}
            options={props.options.competenceLevels}
            onChange={(value) =>
              props.onFilterChange("competenceLevel", value)
            }
          />
        ) : null}
        <TextField
          select
          label="Vårdtyp"
          size="small"
          value={props.filters.careType}
          onChange={(event) =>
            props.onFilterChange("careType", event.target.value)
          }
          sx={fieldSx}
        >
          <MenuItem value="">Alla</MenuItem>
          {props.options.careTypes.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <Button
          type="button"
          variant="outlined"
          onClick={props.onClearFilters}
          sx={{ alignSelf: "center" }}
        >
          Rensa filter
        </Button>
      </Box>
    </SectionCard>
  );
}

function FilterSelect(props: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <TextField
      select
      label={props.label}
      size="small"
      value={props.value}
      onChange={(event) => props.onChange(event.target.value)}
      sx={fieldSx}
    >
      <MenuItem value="">Alla</MenuItem>
      {props.options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  );
}

function SummaryStrip(props: { summary: DimensioningResultSummary }) {
  return (
    <SectionCard>
      <Box sx={summaryGridSx}>
        <MetricValue
          label="Total närvaro"
          value={formatTwoDecimals(props.summary.totalPresence)}
        />
        <MetricValue
          label="Total bemanningskostnad"
          value={formatCurrency(props.summary.staffingCost)}
        />
        <MetricValue
          label="Kostnad per DRG"
          value={formatCurrency(props.summary.costPerDrg)}
        />
        <MetricValue
          label="Kostnad per vårdhändelse"
          value={formatCurrency(props.summary.costPerCareEvent)}
        />
      </Box>
    </SectionCard>
  );
}

function PresenceSection(props: { rows: DimensioningResultRow[] }) {
  const showCompetenceLevel = shouldShowCompetenceLevel(props.rows);

  return (
    <ResultSection
      overline="1. Närvaro"
      title="Närvaro"
      emptyText="Inga närvarorader matchar valt filter."
      headerSx={
        showCompetenceLevel ? presenceGridSx : presenceGridWithoutCompetenceSx
      }
      rowSx={
        showCompetenceLevel ? presenceGridSx : presenceGridWithoutCompetenceSx
      }
      headers={
        showCompetenceLevel
          ? [
              "År",
              "Yrkeskategori",
              "Kompetensnivå",
              "Ekonomisk kombika/sektion",
              "Produktionsnärvaro",
              "Admin/övrigt",
              "ST som inte bidrar",
              "Total närvaro",
            ]
          : [
              "År",
              "Yrkeskategori",
              "Ekonomisk kombika/sektion",
              "Produktionsnärvaro",
              "Admin/övrigt",
              "ST som inte bidrar",
              "Total närvaro",
            ]
      }
      rows={props.rows.map((row) => ({
        id: `presence-${row.id}`,
        values: [
          { value: row.period },
          { value: row.roleCategory },
          ...(showCompetenceLevel ? [{ value: row.competenceLevel }] : []),
          { value: formatSection(row) },
          { value: formatTwoDecimals(row.productionPresence) },
          { value: formatTwoDecimals(row.adminOtherPresence) },
          { value: formatTwoDecimals(row.nonContributingPresence) },
          { value: formatTwoDecimals(row.totalPresence), strong: true },
        ],
      }))}
    />
  );
}

function StaffingCostSection(props: { rows: DimensioningResultRow[] }) {
  const showCompetenceLevel = shouldShowCompetenceLevel(props.rows);

  return (
    <ResultSection
      overline="2. Bemanningskostnader"
      title="Bemanningskostnader"
      emptyText="Inga kostnadsrader matchar valt filter."
      headerSx={
        showCompetenceLevel ? staffingGridSx : staffingGridWithoutCompetenceSx
      }
      rowSx={
        showCompetenceLevel ? staffingGridSx : staffingGridWithoutCompetenceSx
      }
      headers={
        showCompetenceLevel
          ? [
              "År",
              "Yrkeskategori",
              "Kompetensnivå",
              "Ekonomisk kombika/sektion",
              "Total närvaro",
              "Lönekostnad/närvaro",
              "Bemanningskostnad",
            ]
          : [
              "År",
              "Yrkeskategori",
              "Ekonomisk kombika/sektion",
              "Total närvaro",
              "Lönekostnad/närvaro",
              "Bemanningskostnad",
            ]
      }
      rows={props.rows.map((row) => ({
        id: `staffing-${row.id}`,
        values: [
          { value: row.period },
          { value: row.roleCategory },
          ...(showCompetenceLevel ? [{ value: row.competenceLevel }] : []),
          { value: formatSection(row) },
          { value: formatTwoDecimals(row.totalPresence) },
          { value: formatCurrency(row.salaryCostPerPresence) },
          { value: formatCurrency(row.staffingCost), strong: true },
        ],
      }))}
    />
  );
}

function CostPerProductionSection(props: { rows: DimensioningResultRow[] }) {
  const showCompetenceLevel = shouldShowCompetenceLevel(props.rows);

  return (
    <ResultSection
      overline="3. Bemanningskostnader per DRG/vårdhändelse"
      title="Bemanningskostnader per DRG/vårdhändelse"
      emptyText="Inga nyckeltalsrader matchar valt filter."
      headerSx={
        showCompetenceLevel
          ? productionCostGridSx
          : productionCostGridWithoutCompetenceSx
      }
      rowSx={
        showCompetenceLevel
          ? productionCostGridSx
          : productionCostGridWithoutCompetenceSx
      }
      headers={
        showCompetenceLevel
          ? [
              "År",
              "Yrkeskategori",
              "Kompetensnivå",
              "Ekonomisk kombika/sektion",
              "Bemanningskostnad",
              "Vårdhändelser",
              "DRG",
              "Kostnad per DRG",
              "Kostnad per vårdhändelse",
            ]
          : [
              "År",
              "Yrkeskategori",
              "Ekonomisk kombika/sektion",
              "Bemanningskostnad",
              "Vårdhändelser",
              "DRG",
              "Kostnad per DRG",
              "Kostnad per vårdhändelse",
            ]
      }
      rows={props.rows.map((row) => ({
        id: `production-cost-${row.id}`,
        values: [
          { value: row.period },
          { value: row.roleCategory },
          ...(showCompetenceLevel ? [{ value: row.competenceLevel }] : []),
          { value: formatSection(row) },
          { value: formatCurrency(row.staffingCost) },
          { value: formatWholeNumber(row.visits) },
          { value: formatTwoDecimals(row.drgTotal) },
          { value: formatCurrency(row.costPerDrg) },
          { value: formatCurrency(row.costPerCareEvent), strong: true },
        ],
      }))}
    />
  );
}

function ResultSection(props: {
  overline: string;
  title: string;
  emptyText: string;
  headers: string[];
  rows: Array<{ id: string; values: Array<{ value: string; strong?: boolean }> }>;
  headerSx: object;
  rowSx: object;
}) {
  return (
    <SectionCard>
      <FormSection
        overline={props.overline}
        title={props.title}
      />

      {props.rows.length === 0 ? (
        <Alert severity="info">{props.emptyText}</Alert>
      ) : (
        <Box sx={{ display: "grid", gap: 0.75 }}>
          <Box sx={props.headerSx}>
            {props.headers.map((header) => (
              <HeaderCell key={header}>{header}</HeaderCell>
            ))}
          </Box>
          {props.rows.map((row) => (
            <Box key={row.id} sx={props.rowSx}>
              {row.values.map((cell, index) => (
                <ResultCell
                  key={`${row.id}-${props.headers[index]}`}
                  label={props.headers[index]}
                  value={cell.value}
                  strong={cell.strong}
                />
              ))}
            </Box>
          ))}
        </Box>
      )}
    </SectionCard>
  );
}

function HeaderCell(props: { children: string }) {
  return (
    <Typography variant="caption" sx={headerCellSx}>
      {props.children}
    </Typography>
  );
}

function ResultCell(props: { label: string; value: string; strong?: boolean }) {
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

function formatSection(row: DimensioningResultRow): string {
  return `${row.economicSection}\nVårdande: ${row.careCostCenter}`;
}

function formatCurrency(value: number): string {
  return `${formatWholeNumber(value)} kr`;
}

function shouldShowCompetenceLevel(rows: DimensioningResultRow[]): boolean {
  return rows.some((row) => row.competenceLevel !== "OO");
}

const filterGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
    lg: "repeat(4, minmax(0, 1fr))",
  },
  gap: 1.5,
};

const fieldSx = {
  minWidth: 0,
  width: "100%",
};

const summaryGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
    xl: "repeat(4, minmax(0, 1fr))",
  },
  gap: 1.5,
};

const metricSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  p: 1.5,
  bgcolor: "var(--section-background)",
};

const baseResultRowSx = {
  display: "grid",
  gap: 1,
  alignItems: "center",
  borderTop: "1px solid var(--color-border)",
  pt: 1,
};

const presenceGridSx = {
  ...baseResultRowSx,
  gridTemplateColumns: {
    xs: "1fr",
    xl: "minmax(70px, 0.6fr) minmax(100px, 0.8fr) minmax(86px, 0.7fr) minmax(160px, 1.2fr) repeat(4, minmax(92px, 0.8fr))",
  },
};

const presenceGridWithoutCompetenceSx = {
  ...baseResultRowSx,
  gridTemplateColumns: {
    xs: "1fr",
    xl: "minmax(70px, 0.6fr) minmax(100px, 0.8fr) minmax(160px, 1.2fr) repeat(4, minmax(92px, 0.8fr))",
  },
};

const staffingGridSx = {
  ...baseResultRowSx,
  gridTemplateColumns: {
    xs: "1fr",
    xl: "minmax(70px, 0.6fr) minmax(100px, 0.8fr) minmax(86px, 0.7fr) minmax(160px, 1.2fr) repeat(3, minmax(110px, 0.9fr))",
  },
};

const staffingGridWithoutCompetenceSx = {
  ...baseResultRowSx,
  gridTemplateColumns: {
    xs: "1fr",
    xl: "minmax(70px, 0.6fr) minmax(100px, 0.8fr) minmax(160px, 1.2fr) repeat(3, minmax(110px, 0.9fr))",
  },
};

const productionCostGridSx = {
  ...baseResultRowSx,
  gridTemplateColumns: {
    xs: "1fr",
    xl: "minmax(70px, 0.6fr) minmax(100px, 0.8fr) minmax(86px, 0.7fr) minmax(150px, 1.1fr) repeat(5, minmax(96px, 0.8fr))",
  },
};

const productionCostGridWithoutCompetenceSx = {
  ...baseResultRowSx,
  gridTemplateColumns: {
    xs: "1fr",
    xl: "minmax(70px, 0.6fr) minmax(100px, 0.8fr) minmax(150px, 1.1fr) repeat(5, minmax(96px, 0.8fr))",
  },
};

const headerCellSx = {
  color: "#005883",
  display: { xs: "none", xl: "block" },
  fontWeight: 700,
  minWidth: 0,
};
