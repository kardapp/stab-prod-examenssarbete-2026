"use client";

import {
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { BarChart, LineChart } from "@mui/x-charts";
import { FormSection } from "@/shared/components/form-section";
import { PlanningMetricCard } from "@/shared/components/planning-metric-card";
import { SectionCard } from "@/shared/components/section-card";
import {
  formatOneDecimal,
  formatTwoDecimals,
  formatWholeNumber,
} from "@/shared/utils/format-number";
import type {
  InpatientKombikaOption,
  InpatientProductionHistoryYear,
} from "../types/inpatient.types";

type InpatientProductionHistorySectionProps = {
  historyRows: InpatientProductionHistoryYear[];
  selectedKombika: InpatientKombikaOption;
};

const chartMargin = { left: 70, right: 16, top: 24, bottom: 40 };
const colors = {
  plan: "#005883",
  r12: "#2e7d32",
  careDays: "#6a4c93",
  lengthOfStay: "#8c6d31",
  drg: "#7b1fa2",
  sll: "#005883",
  uulp: "#8c6d31",
  acute: "#c62828",
  elective: "#1565c0",
};

export function InpatientProductionHistorySection(
  props: InpatientProductionHistorySectionProps
) {
  const availableYears = useMemo(
    () => props.historyRows.map((row) => row.year),
    [props.historyRows]
  );
  const [selectedYears, setSelectedYears] = useState<number[]>(availableYears);
  const selectedRows = useMemo(
    () => props.historyRows.filter((row) => selectedYears.includes(row.year)),
    [props.historyRows, selectedYears]
  );
  const yearLabels = selectedRows.map((row) => String(row.year));
  const latestRow = selectedRows.at(-1);

  function handleYearChange(
    _event: MouseEvent<HTMLElement>,
    nextYears: number[]
  ) {
    if (nextYears.length === 0) {
      return;
    }

    setSelectedYears([...nextYears].sort((first, second) => first - second));
  }

  return (
    <SectionCard>
      <FormSection
        overline="Historik"
        title="Jämförelsevärden från tidigare år"
        description={`Mockad femårshistorik för ${props.selectedKombika.code}: plan, R12, vårddygn, vårdplatser, DRG-snitt och fördelningar.`}
      />

      {props.historyRows.length > 0 && latestRow ? (
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            sx={{
              alignItems: { xs: "stretch", md: "center" },
              justifyContent: "space-between",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Välj år att jämföra
            </Typography>
            <ToggleButtonGroup
              size="small"
              value={selectedYears}
              onChange={handleYearChange}
              sx={{
                flexWrap: "wrap",
                gap: 0.75,
                "& .MuiToggleButtonGroup-grouped": {
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  m: 0,
                },
              }}
            >
              {availableYears.map((year) => (
                <ToggleButton key={year} value={year} sx={{ minWidth: 68 }}>
                  {year}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>

          <Box sx={summaryGridSx}>
            <PlanningMetricCard
              label="Plan föregående år"
              value={formatWholeNumber(latestRow.plannedCareEvents)}
              helperText={`${latestRow.year}, vårdtillfällen`}
            />
            <PlanningMetricCard
              label="Utfall R12"
              value={formatWholeNumber(latestRow.r12CareEvents)}
              helperText={`${latestRow.year}, vårdtillfällen`}
            />
            <PlanningMetricCard
              label="Vårddygn"
              value={formatWholeNumber(latestRow.careDays)}
              helperText={`${latestRow.year}`}
            />
            <PlanningMetricCard
              label="Snitt vårdplatser"
              value={formatOneDecimal(latestRow.averageCarePlaces)}
              helperText={`${latestRow.year}`}
            />
            <PlanningMetricCard
              label="Medelvårdtid"
              value={formatOneDecimal(latestRow.averageLengthOfStay)}
              helperText={`${latestRow.year}, dygn`}
            />
            <PlanningMetricCard
              label="DRG-snitt"
              value={formatTwoDecimals(latestRow.drgAverage)}
              helperText={`${latestRow.year}`}
            />
          </Box>

          <Box sx={chartGridSx}>
            <ChartPanel title="Plan och R12">
              <ChartFrame>
                <BarChart
                  height={280}
                  margin={chartMargin}
                  grid={{ horizontal: true }}
                  xAxis={[{ data: yearLabels, scaleType: "band" }]}
                  yAxis={[{ valueFormatter: formatAxisWholeNumber }]}
                  series={[
                    {
                      data: selectedRows.map((row) => row.plannedCareEvents),
                      label: "Plan föreg. år",
                      color: colors.plan,
                    },
                    {
                      data: selectedRows.map((row) => row.r12CareEvents),
                      label: "Utfall R12",
                      color: colors.r12,
                    },
                  ]}
                />
              </ChartFrame>
            </ChartPanel>

            <ChartPanel title="Vårddygn">
              <ChartFrame>
                <BarChart
                  height={280}
                  margin={chartMargin}
                  grid={{ horizontal: true }}
                  xAxis={[{ data: yearLabels, scaleType: "band" }]}
                  yAxis={[{ valueFormatter: formatAxisWholeNumber }]}
                  series={[
                    {
                      data: selectedRows.map((row) => row.careDays),
                      label: "Vårddygn",
                      color: colors.careDays,
                    },
                  ]}
                />
              </ChartFrame>
            </ChartPanel>

            <ChartPanel title="Medelvårdtid och DRG-snitt">
              <ChartFrame>
                <LineChart
                  height={280}
                  margin={chartMargin}
                  grid={{ horizontal: true }}
                  xAxis={[{ data: yearLabels, scaleType: "point" }]}
                  yAxis={[{ valueFormatter: formatAxisDecimal }]}
                  series={[
                    {
                      data: selectedRows.map(
                        (row) => row.averageLengthOfStay
                      ),
                      label: "Medelvårdtid",
                      color: colors.lengthOfStay,
                      showMark: true,
                    },
                    {
                      data: selectedRows.map((row) => row.drgAverage),
                      label: "DRG-snitt",
                      color: colors.drg,
                      showMark: true,
                    },
                  ]}
                />
              </ChartFrame>
            </ChartPanel>

            <ChartPanel title="SLL / UULP">
              <ChartFrame>
                <BarChart
                  height={280}
                  margin={chartMargin}
                  grid={{ horizontal: true }}
                  xAxis={[{ data: yearLabels, scaleType: "band" }]}
                  yAxis={[{ valueFormatter: formatAxisWholeNumber }]}
                  series={[
                    {
                      data: selectedRows.map((row) => row.sllCareEvents),
                      label: "SLL",
                      stack: "payer",
                      color: colors.sll,
                    },
                    {
                      data: selectedRows.map((row) => row.uulpCareEvents),
                      label: "UULP",
                      stack: "payer",
                      color: colors.uulp,
                    },
                  ]}
                />
              </ChartFrame>
            </ChartPanel>

            <ChartPanel title="Akut / elektivt">
              <ChartFrame>
                <BarChart
                  height={280}
                  margin={chartMargin}
                  grid={{ horizontal: true }}
                  xAxis={[{ data: yearLabels, scaleType: "band" }]}
                  yAxis={[{ valueFormatter: formatAxisWholeNumber }]}
                  series={[
                    {
                      data: selectedRows.map((row) => row.acuteCareEvents),
                      label: "Akut",
                      stack: "urgency",
                      color: colors.acute,
                    },
                    {
                      data: selectedRows.map((row) => row.electiveCareEvents),
                      label: "Elektivt",
                      stack: "urgency",
                      color: colors.elective,
                    },
                  ]}
                />
              </ChartFrame>
            </ChartPanel>
          </Box>

          <TableContainer sx={tableContainerSx}>
            <Table size="small" aria-label="Historik per år">
              <TableHead>
                <TableRow>
                  <TableCell>År</TableCell>
                  <TableCell align="right">Plan föreg. år</TableCell>
                  <TableCell align="right">Utfall R12</TableCell>
                  <TableCell align="right">Medelvårdtid</TableCell>
                  <TableCell align="right">Vårddygn</TableCell>
                  <TableCell align="right">Snitt vårdplatser</TableCell>
                  <TableCell align="right">DRG-snitt</TableCell>
                  <TableCell align="right">SLL / UULP</TableCell>
                  <TableCell align="right">Akut / elektivt</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedRows.map((row) => (
                  <TableRow key={row.year}>
                    <TableCell component="th" scope="row">
                      {row.year}
                    </TableCell>
                    <TableCell align="right">
                      {formatWholeNumber(row.plannedCareEvents)}
                    </TableCell>
                    <TableCell align="right">
                      {formatWholeNumber(row.r12CareEvents)}
                    </TableCell>
                    <TableCell align="right">
                      {formatOneDecimal(row.averageLengthOfStay)}
                    </TableCell>
                    <TableCell align="right">
                      {formatWholeNumber(row.careDays)}
                    </TableCell>
                    <TableCell align="right">
                      {formatOneDecimal(row.averageCarePlaces)}
                    </TableCell>
                    <TableCell align="right">
                      {formatTwoDecimals(row.drgAverage)}
                    </TableCell>
                    <TableCell align="right">
                      {formatWholeNumber(row.sllCareEvents)} /{" "}
                      {formatWholeNumber(row.uulpCareEvents)}
                    </TableCell>
                    <TableCell align="right">
                      {formatWholeNumber(row.acuteCareEvents)} /{" "}
                      {formatWholeNumber(row.electiveCareEvents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      ) : (
        <Typography color="text.secondary">
          Ingen historik finns för vald kombika.
        </Typography>
      )}
    </SectionCard>
  );
}

function ChartPanel(props: { title: string; children: ReactNode }) {
  return (
    <Stack spacing={1} sx={{ minWidth: 0 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {props.title}
      </Typography>
      {props.children}
    </Stack>
  );
}

function ChartFrame(props: { children: ReactNode }) {
  return <Box sx={chartFrameSx}>{props.children}</Box>;
}

function formatAxisWholeNumber(value: number | Date | string): string {
  return formatWholeNumber(Number(value));
}

function formatAxisDecimal(value: number | Date | string): string {
  return formatOneDecimal(Number(value));
}

const summaryGridSx = {
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(3, minmax(0, 1fr))",
    xl: "repeat(6, minmax(0, 1fr))",
  },
};

const chartGridSx = {
  display: "grid",
  gap: 2,
  gridTemplateColumns: {
    xs: "1fr",
    lg: "repeat(2, minmax(0, 1fr))",
  },
};

const chartFrameSx = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  minWidth: 0,
  overflow: "hidden",
  "& .MuiChartsLegend-root": {
    fontSize: "0.75rem",
  },
};

const tableContainerSx = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  overflowX: "auto",
  "& th": {
    bgcolor: "var(--section-background)",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  "& td": {
    whiteSpace: "nowrap",
  },
};
