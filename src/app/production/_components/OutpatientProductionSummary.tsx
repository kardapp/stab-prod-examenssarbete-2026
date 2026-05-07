"use client";

import { Box, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import { SectionTitle } from "@/components/SectionTitle";
import {
  roundToOneDecimal,
  roundToWholeNumber,
} from "@/lib/calculations/outpatientProductionCalculations";
import type { OutpatientProductionRow } from "@/types/production";
import {
  formatDay,
  formatRoleCategory,
  getAverageTimeItems,
  getAverageValue,
  groupRows,
  sumRows,
} from "./outpatientProductionUtils";
import type { SummaryItem } from "./outpatientProductionTypes";

type OutpatientProductionSummaryProps = {
  rows: OutpatientProductionRow[];
};

export function OutpatientProductionSummary(
  props: OutpatientProductionSummaryProps
) {
  const totalVisits = sumRows(props.rows, "visits");
  const visitsByRole = groupRows(props.rows, (row) =>
    formatRoleCategory(row.primary_role_category, row.secondary_role_category)
  );
  const visitsByDay = groupRows(props.rows, (row) =>
    formatDay(row.period_type, row.period_value)
  );
  const visitsBySllUulp = groupRows(
    props.rows,
    (row) => row.sll_uulp ?? "Ej angivet"
  );
  const visitsByAcuteElective = groupRows(
    props.rows,
    (row) => row.acute_elective ?? "Ej angivet"
  );
  const averageTimeItems = getAverageTimeItems(props.rows);
  const comparisonItems = [
    {
      label: "Plan föreg år",
      value: sumRows(props.rows, "previous_year_plan"),
    },
    {
      label: "Utfall R12",
      value: sumRows(props.rows, "r12_outcome"),
    },
    {
      label: "Utfall föreg år",
      value: sumRows(props.rows, "previous_year_outcome"),
    },
  ];

  return (
    <>
      <Paper sx={{ ...panelSx, gridRow: { lg: "span 2" } }}>
        <SectionTitle
          overline="Sammanfattning"
          title="Antal vårdtillfällen"
          description="Beräknas från de inmatade produktionsraderna."
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
          <SummaryGroup title="Per dag" items={visitsByDay} />
          <SummaryGroup title="Per SLL/UULP" items={visitsBySllUulp} />
          <SummaryGroup
            title="Per akut/elektivt"
            items={visitsByAcuteElective}
          />
        </Box>
      </Paper>

      <Paper sx={panelSx}>
        <SectionTitle
          overline="Stödvärde"
          title="Snitt-tid per besök"
          description="Beräknas per typ av besök från produktionsraderna."
        />

        <Stack spacing={1.25}>
          {averageTimeItems.map((item) => (
            <MetricRow
              key={item.label}
              label={item.label}
              value={item.value}
              unit="min"
            />
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
            value={getAverageValue(props.rows, "drg_average_sll")}
            decimals={1}
          />
          <MetricRow
            label="UULP"
            value={getAverageValue(props.rows, "drg_average_uulp")}
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
    </>
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
          <Box key={item.label} sx={summaryRowSx}>
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
    <Box sx={metricRowSx}>
      <Typography>{props.label}</Typography>
      <Typography sx={{ color: "#005883", fontWeight: 700 }}>
        {formattedValue}
        {props.unit ? ` ${props.unit}` : ""}
      </Typography>
    </Box>
  );
}

const panelSx = {
  p: 2,
  border: "1px solid #d0d7de",
  borderRadius: 1,
  boxShadow: "none",
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

const summaryRowSx = {
  display: "flex",
  justifyContent: "space-between",
  gap: 2,
  py: 0.25,
};

const metricRowSx = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 2,
  borderBottom: "1px solid #e5e7eb",
  pb: 1,
};

const mutedTextSx = {
  color: "text.secondary",
};
