"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  roundToOneDecimal,
  roundToWholeNumber,
  toNumber,
} from "@/lib/calculations/outpatientProductionCalculations";
import type { OutpatientProductionRow } from "@/types/production";

type SummaryItem = {
  label: string;
  value: number;
};

export function OutpatientProductionGrid() {
  const [rows, setRows] = useState<OutpatientProductionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchRows() {
      try {
        const response = await fetch("/api/outpatient-production-rows");

        if (!response.ok) {
          throw new Error("Kunde inte hämta öppenvårdsrader.");
        }

        const data = (await response.json()) as OutpatientProductionRow[];
        setRows(data);
        setErrorMessage("");
      } catch {
        setErrorMessage("Något gick fel vid hämtning av öppenvårdsrader.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRows();
  }, []);

  if (isLoading) {
    return (
      <Paper sx={panelSx}>
        <CircularProgress />
      </Paper>
    );
  }

  if (errorMessage) {
    return <Alert severity="error">{errorMessage}</Alert>;
  }

  const totalVisits = sumRows(rows, "visits");
  const visitsByRole = groupRows(rows, (row) =>
    formatRoleCategory(row.primary_role_category, row.secondary_role_category)
  );
  const visitsByWeek = groupRows(rows, (row) =>
    formatWeek(row.period_type, row.period_value)
  );
  const visitsBySllUulp = groupRows(rows, (row) => row.sll_uulp ?? "Ej angivet");
  const visitsByAcuteElective = groupRows(
    rows,
    (row) => row.acute_elective ?? "Ej angivet"
  );
  const averageTimeItems = getAverageTimeItems(rows);
  const comparisonItems = [
    {
      label: "Plan föreg år",
      value: sumRows(rows, "previous_year_plan"),
    },
    {
      label: "Utfall R12",
      value: sumRows(rows, "r12_outcome"),
    },
    {
      label: "Utfall föreg år",
      value: sumRows(rows, "previous_year_outcome"),
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
        gap: 2,
      }}
    >
      <Paper sx={{ ...panelSx, gridRow: { lg: "span 2" } }}>
        <SectionTitle
          overline="Huvudblock"
          title="Antal vårdtillfällen"
          description="Planerad öppenvårdsproduktion uppdelad på yrkeskategori, vecka, SLL/UULP och akut/elektivt."
        />

        <Box sx={totalVisitsSx}>
          <Box>
            <Typography variant="caption" sx={mutedTextSx}>
              Totalt planerat
            </Typography>
            <Typography variant="h3" component="p" sx={{ fontWeight: 700 }}>
              {roundToWholeNumber(totalVisits)}
            </Typography>
          </Box>

          <Chip
            label="Öppenvård"
            sx={{ bgcolor: "#eaf4f8", color: "#005883", fontWeight: 700 }}
          />
        </Box>

        <Box sx={summaryGridSx}>
          <SummaryGroup title="Per yrkeskategori" items={visitsByRole} />
          <SummaryGroup title="Per vecka" items={visitsByWeek} />
          <SummaryGroup title="Per SLL/UULP" items={visitsBySllUulp} />
          <SummaryGroup title="Per akut/elektivt" items={visitsByAcuteElective} />
        </Box>
      </Paper>

      <Paper sx={panelSx}>
        <SectionTitle
          overline="Stödvärde"
          title="Snitt-tid per besök"
          description="Används som stöd för att förstå tidsåtgången i planen."
        />

        <Stack spacing={1.25}>
          {averageTimeItems.map((item) => (
            <MetricRow key={item.label} label={item.label} value={item.value} unit="min" />
          ))}
        </Stack>
      </Paper>

      <Paper sx={panelSx}>
        <SectionTitle
          overline="Stödvärde"
          title="DRG-snitt"
          description="Visar DRG-snitt för SLL och UULP."
        />

        <Stack spacing={1.25}>
          <MetricRow
            label="SLL"
            value={getAverageValue(rows, "drg_average_sll")}
            decimals={1}
          />
          <MetricRow
            label="UULP"
            value={getAverageValue(rows, "drg_average_uulp")}
            decimals={1}
          />
        </Stack>
      </Paper>

      <Paper sx={panelSx}>
        <SectionTitle
          overline="Jämförelse"
          title="Jämförelsevärden"
          description="Hämtas som stöd och är inte manuell inmatning."
        />

        <Stack spacing={1.25}>
          {comparisonItems.map((item) => (
            <MetricRow key={item.label} label={item.label} value={item.value} />
          ))}
        </Stack>
      </Paper>

      <Paper sx={processPanelSx}>
        <SectionTitle
          overline="Nästa steg"
          title="Fortsätt i processen"
          description="När produktionsplanen är rimlig går arbetet vidare till fördelning och dimensionering."
        />

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button variant="outlined" size="large">
            Fördela till OO-mottagningar
          </Button>
          <Button variant="contained" size="large" href="/dimensioning">
            Gå till Dimensionering
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

function SectionTitle(props: {
  overline: string;
  title: string;
  description: string;
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={overlineSx}>
        {props.overline}
      </Typography>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
        {props.title}
      </Typography>
      <Typography variant="body2" sx={mutedTextSx}>
        {props.description}
      </Typography>
    </Box>
  );
}

function SummaryGroup(props: { title: string; items: SummaryItem[] }) {
  return (
    <Box>
      <Typography sx={{ color: "#005883", fontWeight: 700, mb: 1 }}>
        {props.title}
      </Typography>

      <Stack divider={<Divider flexItem />} spacing={1}>
        {props.items.map((item) => (
          <Box
            key={item.label}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              py: 0.25,
            }}
          >
            <Typography variant="body2">{item.label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {roundToWholeNumber(item.value)}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function MetricRow(props: {
  label: string;
  value: number;
  unit?: string;
  decimals?: number;
}) {
  const formattedValue =
    props.decimals === 1
      ? roundToOneDecimal(props.value)
      : roundToWholeNumber(props.value);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 2,
        borderBottom: "1px solid #e5e7eb",
        pb: 1,
      }}
    >
      <Typography>{props.label}</Typography>
      <Typography sx={{ color: "#005883", fontWeight: 700 }}>
        {formattedValue}
        {props.unit ? ` ${props.unit}` : ""}
      </Typography>
    </Box>
  );
}

function sumRows(
  rows: OutpatientProductionRow[],
  key: keyof OutpatientProductionRow
): number {
  return rows.reduce((sum, row) => sum + toNumber(row[key]), 0);
}

function groupRows(
  rows: OutpatientProductionRow[],
  getLabel: (row: OutpatientProductionRow) => string
): SummaryItem[] {
  const groupedValues = new Map<string, number>();

  rows.forEach((row) => {
    const label = getLabel(row);
    const currentValue = groupedValues.get(label) ?? 0;
    groupedValues.set(label, currentValue + toNumber(row.visits));
  });

  return Array.from(groupedValues.entries()).map(([label, value]) => ({
    label,
    value,
  }));
}

function getAverageValue(
  rows: OutpatientProductionRow[],
  key: keyof OutpatientProductionRow
): number {
  if (rows.length === 0) {
    return 0;
  }

  return sumRows(rows, key) / rows.length;
}

function getAverageTimeItems(rows: OutpatientProductionRow[]): SummaryItem[] {
  return [
    {
      label: "Nybesök",
      value: toNumber(rows[0]?.average_minutes_per_visit),
    },
    {
      label: "Återbesök",
      value: toNumber(rows[1]?.average_minutes_per_visit),
    },
    {
      label: "Etc.",
      value: toNumber(rows[2]?.average_minutes_per_visit),
    },
  ];
}

function formatRoleCategory(
  primaryRoleCategory: string | null,
  secondaryRoleCategory: string | null
): string {
  if (!secondaryRoleCategory) {
    return primaryRoleCategory ?? "Ej angivet";
  }

  return `${primaryRoleCategory ?? "Ej angivet"} + ${secondaryRoleCategory}`;
}

function formatWeek(
  periodType: string | null,
  periodValue: string | null
): string {
  if (!periodValue) {
    return "Ej angivet";
  }

  return periodType === "day" ? periodValue : `Vecka ${periodValue}`;
}

const panelSx = {
  p: 2,
  border: "1px solid #d0d7de",
  borderRadius: 1,
  boxShadow: "none",
};

const processPanelSx = {
  ...panelSx,
  bgcolor: "#f8fbfd",
};

const totalVisitsSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
  mb: 2,
};

const summaryGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
  gap: 2,
};

const overlineSx = {
  color: "#005883",
  fontWeight: 700,
  letterSpacing: 0,
  textTransform: "uppercase",
};

const mutedTextSx = {
  color: "text.secondary",
};
