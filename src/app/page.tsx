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

type NavigationGroup = {
  accentColor: string;
  title: string;
  items: NavigationItem[];
};

type NavigationItem = {
  href?: string;
  label: string;
};

const navigationGroups: NavigationGroup[] = [
  {
    accentColor: "#005883",
    title: "Produktionsplanering",
    items: [
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
      },
      {
        label: "Radiologi",
      },
    ],
  },
  {
    accentColor: "#00574f",
    title: "Dimensionering",
    items: [
      {
        label: "ÖPV",
        href: appRoutes.outpatientDimensioning,
      },
      {
        label: "SLV",
        href: appRoutes.inpatientDimensioning,
      },
      {
        label: "Ingrepp",
      },
      {
        label: "Radiologi",
      },
      {
        label: "Admin",
      },
      {
        label: "Inskolning",
      },
      {
        label: "FoUU",
      },
      {
        label: "Etc.",
      },
    ],
  },
];

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

          <Box component="section" sx={navigationSectionSx}>
            <Box sx={navigationToolbarSx}>
              <Box sx={sectionPickerSx}>
                <Typography variant="h6" component="label" htmlFor="section">
                  Sektion
                </Typography>

                <TextField
                  id="section"
                  select
                  label="Välj sektion"
                  defaultValue=""
                  size="small"
                  sx={sectionFieldSx}
                >
                  <MenuItem value="sektion-1">Sektion 1</MenuItem>
                  <MenuItem value="sektion-2">Sektion 2</MenuItem>
                  <MenuItem value="sektion-3">Sektion 3</MenuItem>
                </TextField>
              </Box>
            </Box>

            <Box sx={navigationGridSx}>
              {navigationGroups.map((group) => (
                <NavigationGroupPanel key={group.title} group={group} />
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

function NavigationGroupPanel(props: { group: NavigationGroup }) {
  return (
    <Box
      sx={{
        ...navigationGroupSx,
        borderTopColor: props.group.accentColor,
      }}
    >
      <Box sx={navigationGroupHeaderSx}>
        <Box sx={{ bgcolor: props.group.accentColor, ...navigationAccentSx }} />
        <Typography variant="subtitle1" sx={navigationGroupTitleSx}>
          {props.group.title}
        </Typography>
      </Box>
      <Box sx={navigationButtonGridSx}>
        {props.group.items.map((item) => (
          <Button
            key={item.label}
            disabled={!item.href}
            href={item.href}
            title={item.href ? undefined : "Ej aktiverad"}
            type="button"
            variant="outlined"
            sx={navigationButtonSx}
          >
            {item.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
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

const navigationSectionSx = {
  bgcolor: "var(--section-background)",
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  minWidth: 0,
  p: { xs: 2, md: 2.5 },
};

const sectionPickerSx = {
  alignItems: { xs: "flex-start", sm: "center" },
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  gap: 1.25,
};

const navigationToolbarSx = {
  alignItems: { xs: "stretch", md: "center" },
  display: "flex",
  justifyContent: "space-between",
  mb: 2.5,
};

const sectionFieldSx = {
  minWidth: { xs: "100%", sm: 280 },
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

const navigationGridSx = {
  display: "grid",
  gap: 2,
  gridTemplateColumns: {
    xs: "1fr",
    lg: "repeat(2, minmax(0, 1fr))",
  },
};

const navigationGroupSx = {
  bgcolor: "#fff",
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  borderTop: "4px solid",
  minWidth: 0,
  p: 1.5,
};

const navigationGroupHeaderSx = {
  alignItems: "center",
  display: "flex",
  gap: 1,
  mb: 1.25,
};

const navigationAccentSx = {
  borderRadius: 999,
  height: 10,
  width: 10,
};

const navigationGroupTitleSx = {
  color: "text.primary",
  fontWeight: 700,
};

const navigationButtonGridSx = {
  display: "grid",
  gap: 1,
  gridTemplateColumns: {
    xs: "repeat(2, minmax(0, 1fr))",
    sm: "repeat(4, minmax(0, 1fr))",
  },
};

const navigationButtonSx = {
  alignItems: "center",
  bgcolor: "#fff",
  border: "1px solid",
  borderColor: "var(--color-border)",
  borderRadius: 1,
  color: "text.primary",
  justifyContent: "center",
  minHeight: 60,
  p: 1.5,
  fontSize: { xs: "0.95rem", md: "1rem" },
  fontWeight: 700,
  lineHeight: 1.15,
  letterSpacing: 0,
  textAlign: "center",
  transition:
    "background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease",
  "&:hover": {
    bgcolor: "#f7fbfd",
    borderColor: "primary.main",
    boxShadow: "0 3px 10px rgba(0, 88, 131, 0.18)",
    transform: "translateY(-1px)",
  },
  "&.Mui-disabled": {
    bgcolor: "#f3f3f3",
    borderColor: "divider",
    color: "text.disabled",
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
