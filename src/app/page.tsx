"use client";

import { type ReactNode } from "react";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { BarChart } from "@mui/x-charts";
import { productionHistoryByKombikaId } from "@/features/outpatient-production/constants/outpatient-production-options";
import { appRoutes } from "@/shared/routes";
import { formatWholeNumber } from "@/shared/utils/format-number";

type DashboardHistoryRow = {
  year: number;
  plannedCareEvents: number;
  r12CareEvents: number;
  acuteCareEvents: number;
  electiveCareEvents: number;
};

const planningAreas = [
  {
    label: "ÖPV",
    href: appRoutes.outpatientProductionPlanning,
  },
  {
    label: "SLV",
    href: appRoutes.inpatientProductionPlanning,
  },
  {
    label: "Ingrepp",
    href: undefined,
  },
  {
    label: "Radiologi",
    href: undefined,
  },
] as const satisfies readonly { label: string; href?: string }[];

const dashboardRows = buildDashboardHistoryRows();
const yearLabels = dashboardRows.map((row) => String(row.year));
const chartMargin = { left: 72, right: 16, top: 24, bottom: 40 };
const chartColors = {
  plan: "#005883",
  careEvents: "#2e7d32",
  acute: "#c62828",
  elective: "#1565c0",
};

export default function HomePage() {
  return (
    <Box component="main" sx={pageSx}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Box component="header" sx={headerSx}>
            <Typography variant="caption" sx={headerOverlineSx}>
              Planering
            </Typography>
            <Typography variant="h4" component="h1" sx={headerTitleSx}>
              Planeringsverktyg
            </Typography>
            <Typography sx={headerDescriptionSx}>
              Produktionsplanering och dimensionering för öppenvård,
              slutenvård, ingrepp och radiologi.
            </Typography>
          </Box>

          <Box component="section" sx={sectionSx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography variant="h5">Sektion</Typography>

              <TextField
                select
                label="Välj sektion"
                defaultValue=""
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="sektion-1">Sektion 1</MenuItem>
                <MenuItem value="sektion-2">Sektion 2</MenuItem>
                <MenuItem value="sektion-3">Sektion 3</MenuItem>
              </TextField>
            </Box>

            <Box sx={areaGridSx}>
              {planningAreas.map((area) => (
                <Button
                  key={area.label}
                  href={area.href}
                  type="button"
                  variant="contained"
                  sx={areaButtonSx}
                >
                  {area.label}
                </Button>
              ))}
            </Box>
          </Box>

          <Box component="section" sx={sectionSx}>
            <Stack spacing={0.75} sx={{ mb: 2 }}>
              <Typography variant="caption" sx={sectionOverlineSx}>
                Översikt
              </Typography>
              <Typography variant="h6" component="h2" sx={sectionTitleSx}>
                Historik för vårdhändelser
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Summerad exempeldata från befintlig ÖPV-historik.
              </Typography>
            </Stack>

            <Box sx={chartGridSx}>
              <ChartPanel title="Plan och vårdhändelser">
                <ChartFrame>
                  <BarChart
                    height={300}
                    margin={chartMargin}
                    grid={{ horizontal: true }}
                    xAxis={[{ data: yearLabels, scaleType: "band" }]}
                    yAxis={[{ valueFormatter: formatAxisWholeNumber }]}
                    series={[
                      {
                        data: dashboardRows.map(
                          (row) => row.plannedCareEvents
                        ),
                        label: "Föreg. års plan",
                        color: chartColors.plan,
                      },
                      {
                        data: dashboardRows.map((row) => row.r12CareEvents),
                        label: "Vårdhändelser",
                        color: chartColors.careEvents,
                      },
                    ]}
                  />
                </ChartFrame>
              </ChartPanel>

              <ChartPanel title="Akut / elektivt">
                <ChartFrame>
                  <BarChart
                    height={300}
                    margin={chartMargin}
                    grid={{ horizontal: true }}
                    xAxis={[{ data: yearLabels, scaleType: "band" }]}
                    yAxis={[{ valueFormatter: formatAxisWholeNumber }]}
                    series={[
                      {
                        data: dashboardRows.map((row) => row.acuteCareEvents),
                        label: "Akut",
                        stack: "urgency",
                        color: chartColors.acute,
                      },
                      {
                        data: dashboardRows.map(
                          (row) => row.electiveCareEvents
                        ),
                        label: "Elektivt",
                        stack: "urgency",
                        color: chartColors.elective,
                      },
                    ]}
                  />
                </ChartFrame>
              </ChartPanel>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
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

function buildDashboardHistoryRows(): DashboardHistoryRow[] {
  const rowsByYear = new Map<number, DashboardHistoryRow>();

  for (const historyRows of Object.values(productionHistoryByKombikaId)) {
    for (const row of historyRows) {
      const current = rowsByYear.get(row.year) ?? {
        year: row.year,
        plannedCareEvents: 0,
        r12CareEvents: 0,
        acuteCareEvents: 0,
        electiveCareEvents: 0,
      };

      current.plannedCareEvents += row.plannedCareEvents;
      current.r12CareEvents += row.r12CareEvents;
      current.acuteCareEvents += row.acuteCareEvents;
      current.electiveCareEvents += row.electiveCareEvents;
      rowsByYear.set(row.year, current);
    }
  }

  return Array.from(rowsByYear.values()).sort(
    (first, second) => first.year - second.year
  );
}

function formatAxisWholeNumber(value: number | Date | string): string {
  return formatWholeNumber(Number(value));
}

const pageSx = {
  minHeight: "100vh",
  bgcolor: "var(--page-background)",
  py: { xs: 3, md: 5 },
};

const headerSx = {
  bgcolor: "primary.main",
  borderRadius: 1,
  color: "primary.contrastText",
  p: { xs: 2, md: 3 },
};

const headerOverlineSx = {
  color: "primary.contrastText",
  display: "block",
  fontWeight: 700,
  letterSpacing: 0,
  textTransform: "uppercase",
};

const headerTitleSx = {
  fontWeight: 700,
  mt: 0.5,
};

const headerDescriptionSx = {
  color: "primary.contrastText",
  maxWidth: 720,
  mt: 1,
};

const sectionSx = {
  minWidth: 0,
};

const sectionOverlineSx = {
  color: "primary.main",
  fontWeight: 700,
  letterSpacing: 0,
  textTransform: "uppercase",
};

const sectionTitleSx = {
  fontWeight: 700,
};

const areaGridSx = {
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    lg: "repeat(4, minmax(0, 1fr))",
  },
};

const areaButtonSx = {
  alignItems: "center",
  bgcolor: "primary.main",
  border: "1px solid",
  borderColor: "primary.main",
  borderRadius: 1,
  color: "primary.contrastText",
  justifyContent: "center",
  minHeight: 68,
  p: 1.5,
  fontSize: { xs: "1rem", md: "1.1rem" },
  fontWeight: 700,
  lineHeight: 1.15,
  letterSpacing: 0,
  textAlign: "center",
  transition:
    "background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease",
  "&:hover": {
    bgcolor: "primary.main",
    borderColor: "primary.main",
    boxShadow: "0 3px 10px rgba(0, 88, 131, 0.22)",
    transform: "translateY(-1px)",
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
  bgcolor: "var(--section-background)",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  minWidth: 0,
  overflow: "hidden",
  "& .MuiChartsLegend-root": {
    fontSize: "0.75rem",
  },
};
