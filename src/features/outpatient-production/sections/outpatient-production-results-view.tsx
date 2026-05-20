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
  formatOneDecimal,
  formatTwoDecimals,
  formatWholeNumber,
} from "@/shared/utils/format-number";
import { useOutpatientProductionResults } from "../hooks/use-outpatient-production-results";
import type {
  DrgResultRow,
  ProductionPlanningResultFilters,
  ProductionPlanningResultOptions,
  ProductionPlanningResultRow,
  ProductionPlanningResultSummary,
} from "../types/outpatient-production-results.types";
import {
  formatCareUnit,
  formatDrgEconomicUnit,
  formatEconomicUnit,
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
          ) : results.resultRows.length === 0 ? (
            <Alert severity="info">
              Det finns inga sparade produktionsrader att visa ännu.
            </Alert>
          ) : (
            <Stack spacing={2}>
              <FilterSection
                filters={results.filters}
                options={results.options}
                onClearFilters={results.clearFilters}
                onFilterChange={results.handleFilterChange}
              />

              {results.summary.undistributedRows > 0 ? (
                <Alert severity="warning">
                  {results.summary.undistributedRows} produktionsrad(er) saknar
                  OO-fördelning och visas som ej fördelade.
                </Alert>
              ) : null}

              <SummaryStrip summary={results.summary} />

              <VisitsSection rows={results.groupedRows} />

              <VisitTimeSection rows={results.groupedRows} />

              <DrgSection rows={results.drgRows} />

              <ActionsSection />
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

function FilterSection(props: {
  filters: ProductionPlanningResultFilters;
  options: ProductionPlanningResultOptions;
  onFilterChange: (
    field: keyof ProductionPlanningResultFilters,
    value: string
  ) => void;
  onClearFilters: () => void;
}) {
  return (
    <SectionCard>
      <FormSection
        overline="Filter"
        title="Resultatnivå"
        description="Resultat per ekonomisk kombika, vårdande enhet, dag och yrkeskategori."
      />

      <Box sx={filterGridSx}>
        <FilterSelect
          label="Ekonomisk kombika"
          value={props.filters.economicUnit}
          options={props.options.economicUnits}
          onChange={(value) => props.onFilterChange("economicUnit", value)}
        />
        <FilterSelect
          label="Vårdande enhet"
          value={props.filters.careUnit}
          options={props.options.careUnits}
          onChange={(value) => props.onFilterChange("careUnit", value)}
        />
        <FilterSelect
          label="Yrkeskategori"
          value={props.filters.roleCategory}
          options={props.options.roleCategories}
          onChange={(value) => props.onFilterChange("roleCategory", value)}
        />
        <TextField
          label="Från datum"
          type="date"
          size="small"
          value={props.filters.startDate}
          onChange={(event) =>
            props.onFilterChange("startDate", event.target.value)
          }
          slotProps={{ inputLabel: { shrink: true } }}
          sx={fieldSx}
        />
        <TextField
          label="Till datum"
          type="date"
          size="small"
          value={props.filters.endDate}
          onChange={(event) =>
            props.onFilterChange("endDate", event.target.value)
          }
          slotProps={{ inputLabel: { shrink: true } }}
          sx={fieldSx}
        />
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

function SummaryStrip(props: { summary: ProductionPlanningResultSummary }) {
  return (
    <SectionCard>
      <Box sx={summaryGridSx}>
        <MetricValue
          label="Antal vårdtillfällen"
          value={formatOneDecimal(props.summary.visits)}
        />
        <MetricValue
          label="Besökstid"
          value={`${formatWholeNumber(props.summary.totalVisitMinutes)} min`}
        />
        <MetricValue
          label="Antal DRG"
          value={formatTwoDecimals(props.summary.drgPoints)}
        />
        <MetricValue
          label="Ofördelade rader"
          value={formatWholeNumber(props.summary.undistributedRows)}
        />
      </Box>
    </SectionCard>
  );
}

function VisitsSection(props: { rows: ProductionPlanningResultRow[] }) {
  return (
    <ResultSection
      overline="1. Antal vårdtillfällen"
      title="Antal vårdtillfällen"
      emptyText="Inga vårdtillfällen matchar valt filter."
      headerSx={visitGridSx}
      rowSx={visitGridSx}
      headers={[
        "Dag",
        "Ekonomisk kombika",
        "Vårdande enhet",
        "Yrkeskategori",
        "Vårdtillfällen",
      ]}
      rows={props.rows.map((row) => ({
        id: `visits-${row.id}`,
        values: [
          { value: row.day },
          { value: formatEconomicUnit(row) },
          { value: formatCareUnit(row) },
          { value: row.roleCategory },
          { value: formatOneDecimal(row.visits), strong: true },
        ],
      }))}
    />
  );
}

function VisitTimeSection(props: { rows: ProductionPlanningResultRow[] }) {
  return (
    <ResultSection
      overline="2. Besökstid"
      title="Besökstid"
      emptyText="Inga besökstider matchar valt filter."
      headerSx={visitTimeGridSx}
      rowSx={visitTimeGridSx}
      headers={[
        "Dag",
        "Ekonomisk kombika",
        "Vårdande enhet",
        "Yrkeskategori",
        "Snitt-tid",
        "Total tid",
      ]}
      rows={props.rows.map((row) => ({
        id: `visit-time-${row.id}`,
        values: [
          { value: row.day },
          { value: formatEconomicUnit(row) },
          { value: formatCareUnit(row) },
          { value: row.roleCategory },
          { value: `${formatOneDecimal(row.averageMinutesPerVisit)} min` },
          {
            value: `${formatWholeNumber(row.totalVisitMinutes)} min`,
            strong: true,
          },
        ],
      }))}
    />
  );
}

function DrgSection(props: { rows: DrgResultRow[] }) {
  return (
    <ResultSection
      overline="3. Antal DRG"
      title="Antal DRG"
      emptyText="Inga DRG-rader matchar valt filter."
      headerSx={drgGridSx}
      rowSx={drgGridSx}
      headers={["Dag", "Ekonomisk kombika", "Vårdtillfällen", "DRG"]}
      rows={props.rows.map((row) => ({
        id: `drg-${row.id}`,
        values: [
          { value: row.day },
          { value: formatDrgEconomicUnit(row) },
          { value: formatOneDecimal(row.visits) },
          { value: formatTwoDecimals(row.drgPoints), strong: true },
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
      <FormSection overline={props.overline} title={props.title} />

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

function ActionsSection() {
  return (
    <SectionCard>
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <Button variant="outlined" href="/outpatient/production/oo-distribution">
          Tillbaka till OO-fördelning
        </Button>
        <Button
          variant="outlined"
          href="/outpatient/production/production-planning"
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

const filterGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
    lg: "repeat(3, minmax(0, 1fr))",
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
  border: "1px solid #d0d7de",
  borderRadius: 1,
  p: 1.5,
  bgcolor: "var(--page-background)",
};

const baseResultRowSx = {
  display: "grid",
  gap: 1,
  alignItems: "center",
  borderTop: "1px solid #d0d7de",
  pt: 1,
};

const visitGridSx = {
  ...baseResultRowSx,
  gridTemplateColumns: {
    xs: "1fr",
    xl: "minmax(82px, 0.6fr) minmax(170px, 1.2fr) minmax(170px, 1.2fr) minmax(150px, 1fr) minmax(112px, 0.8fr)",
  },
};

const visitTimeGridSx = {
  ...baseResultRowSx,
  gridTemplateColumns: {
    xs: "1fr",
    xl: "minmax(82px, 0.6fr) minmax(170px, 1.2fr) minmax(170px, 1.2fr) minmax(150px, 1fr) minmax(96px, 0.7fr) minmax(106px, 0.8fr)",
  },
};

const drgGridSx = {
  ...baseResultRowSx,
  gridTemplateColumns: {
    xs: "1fr",
    xl: "minmax(82px, 0.6fr) minmax(190px, 1.4fr) minmax(120px, 0.8fr) minmax(110px, 0.8fr)",
  },
};

const headerCellSx = {
  color: "#005883",
  display: { xs: "none", xl: "block" },
  fontWeight: 700,
  minWidth: 0,
};
