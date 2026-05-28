"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { PageHeader } from "@/shared/components/page-header";
import { SectionCard } from "@/shared/components/section-card";
import { formatOneDecimal } from "@/shared/utils/format-number";
import { useOutpatientProductionResults } from "../hooks/use-outpatient-production-results";
import { PeriodizationCurveSection } from "./periodization-curve-section";
import type { ProductionPlanningComparisonRow } from "../types/outpatient-production-results.types";
import { formatComparisonEconomicUnit } from "../utils/outpatient-production-results-calculations";

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

                  <ComparisonSection rows={results.comparisonRows} />
                </>
              )}

              <PeriodizationCurveSection rows={results.annualRows} />

              <ActionsSection />
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
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
        overline="1. Jämförelse"
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
