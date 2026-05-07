"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  calculateDrgPoints,
  calculatePresenceNeed,
  calculateTotalVisitMinutes,
  roundToOneDecimal,
  roundToTwoDecimals,
  roundToWholeNumber,
  toNumber,
} from "@/lib/calculations/outpatientProductionCalculations";
import type { OutpatientProductionRow } from "@/types/production";

type SummaryItem = {
  label: string;
  value: number;
};

type OutpatientProductionFormState = {
  kombika_pf_id: string;
  kombika_pf: string;
  section: string;
  cost_center: string;
  site: string;
  assignment: string;
  period_type: string;
  period_value: string;
  care_type: string;
  visit_type: string;
  visits: string;
  primary_role_category: string;
  secondary_role_category: string;
  sll_uulp: string;
  acute_elective: string;
  average_minutes_per_visit: string;
  drg_average: string;
};

const kombikaOptions = [
  {
    id: "PF-001",
    label: "ÖPV Mottagning A",
    section: "Sektion A",
    costCenter: "KS-1001",
    site: "Solna",
    assignment: "Basuppdrag",
  },
  {
    id: "PF-002",
    label: "ÖPV Mottagning B",
    section: "Sektion B",
    costCenter: "KS-1002",
    site: "Huddinge",
    assignment: "Tilläggsuppdrag",
  },
  {
    id: "PF-003",
    label: "ÖPV Dagvård",
    section: "Sektion C",
    costCenter: "KS-1003",
    site: "Solna",
    assignment: "Dagvårdsuppdrag",
  },
];

const roleCategoryOptions = [
  "Läkare",
  "Sjuksköterska",
  "Undersköterska",
  "Hälsoprofession",
  "Övrig personal",
];

const visitTypeOptions = ["Nybesök", "Återbesök", "Etc."];

const initialFormState: OutpatientProductionFormState = {
  kombika_pf_id: "PF-001",
  kombika_pf: "ÖPV Mottagning A",
  section: "Sektion A",
  cost_center: "KS-1001",
  site: "Solna",
  assignment: "Basuppdrag",
  period_type: "day",
  period_value: "2027-03-24",
  care_type: "open_care",
  visit_type: "Nybesök",
  visits: "",
  primary_role_category: "Läkare",
  secondary_role_category: "",
  sll_uulp: "SLL",
  acute_elective: "Elektivt",
  average_minutes_per_visit: "",
  drg_average: "",
};

export function OutpatientProductionGrid() {
  const [rows, setRows] = useState<OutpatientProductionRow[]>([]);
  const [formState, setFormState] =
    useState<OutpatientProductionFormState>(initialFormState);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchRows() {
      try {
        setIsLoading(true);
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
  }, [reloadToken]);

  function handleFieldChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }

  function handleKombikaChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const selectedOption = kombikaOptions.find(
      (option) => option.id === event.target.value
    );

    if (!selectedOption) {
      return;
    }

    setFormState((current) => ({
      ...current,
      kombika_pf_id: selectedOption.id,
      kombika_pf: selectedOption.label,
      section: selectedOption.section,
      cost_center: selectedOption.costCenter,
      site: selectedOption.site,
      assignment: selectedOption.assignment,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/outpatient-production-rows", {
        method: editingRowId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingRowId ?? undefined,
          production_plan_id: 1,
          ...formState,
          visits: Number(formState.visits),
          average_minutes_per_visit: Number(
            formState.average_minutes_per_visit
          ),
          drg_average: Number(formState.drg_average),
        }),
      });

      if (!response.ok) {
        throw new Error("Kunde inte spara produktionsraden.");
      }

      resetForm();
      setReloadToken((current) => current + 1);
    } catch {
      setErrorMessage("Något gick fel när produktionsraden skulle sparas.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEditRow(row: OutpatientProductionRow) {
    setEditingRowId(row.id);
    setFormState({
      kombika_pf_id: row.kombika_pf_id ?? "PF-001",
      kombika_pf: row.kombika_pf ?? "ÖPV Mottagning A",
      section: row.section ?? "",
      cost_center: row.cost_center ?? "",
      site: row.site ?? "",
      assignment: row.assignment ?? "",
      period_type: row.period_type ?? "day",
      period_value: row.period_value ?? "",
      care_type: row.care_type ?? "open_care",
      visit_type: row.visit_type ?? "Nybesök",
      visits: row.visits?.toString() ?? "",
      primary_role_category: row.primary_role_category ?? "Läkare",
      secondary_role_category: row.secondary_role_category ?? "",
      sll_uulp: row.sll_uulp ?? "SLL",
      acute_elective: row.acute_elective ?? "Elektivt",
      average_minutes_per_visit:
        row.average_minutes_per_visit?.toString() ?? "",
      drg_average: row.drg_average ?? "",
    });
  }

  function resetForm() {
    setEditingRowId(null);
    setFormState(initialFormState);
  }

  if (isLoading) {
    return (
      <Paper sx={panelSx}>
        <CircularProgress />
      </Paper>
    );
  }

  const totalVisits = sumRows(rows, "visits");
  const visitsByRole = groupRows(rows, (row) =>
    formatRoleCategory(row.primary_role_category, row.secondary_role_category)
  );
  const visitsByDay = groupRows(rows, (row) =>
    formatDay(row.period_type, row.period_value)
  );
  const visitsBySllUulp = groupRows(rows, (row) => row.sll_uulp ?? "Ej angivet");
  const visitsByAcuteElective = groupRows(
    rows,
    (row) => row.acute_elective ?? "Ej angivet"
  );
  const averageTimeItems = getAverageTimeItems(rows);
  const totalVisitMinutes = rows.reduce(
    (sum, row) =>
      sum +
      calculateTotalVisitMinutes(
        toNumber(row.visits),
        toNumber(row.average_minutes_per_visit)
      ),
    0
  );
  const totalDrgPoints = rows.reduce(
    (sum, row) =>
      sum + calculateDrgPoints(toNumber(row.visits), toNumber(row.drg_average)),
    0
  );
  const presenceNeed = calculatePresenceNeed(totalVisitMinutes);
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
    <Stack spacing={2}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Paper sx={panelSx}>
        <SectionTitle
          overline="Inmatning"
          title="Produktionsrad per ekonomisk kombika"
          description="Sektionschef eller controller lägger till och justerar produktionsrader. Sammanfattningen nedanför räknas om automatiskt."
        />

        <Box component="form" onSubmit={handleSubmit} sx={formGridSx}>
          <TextField
            select
            label="Ekonomisk kombika"
            name="kombika_pf_id"
            value={formState.kombika_pf_id}
            onChange={handleKombikaChange}
            size="small"
          >
            {kombikaOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.id} - {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Dag/datum"
            name="period_value"
            type="date"
            value={formState.period_value}
            onChange={handleFieldChange}
            size="small"
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Antal vårdtillfällen"
            name="visits"
            type="number"
            value={formState.visits}
            onChange={handleFieldChange}
            size="small"
            required
          />

          <TextField
            select
            label="Yrkeskategori"
            name="primary_role_category"
            value={formState.primary_role_category}
            onChange={handleFieldChange}
            size="small"
          >
            {roleCategoryOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Sekundär yrkeskategori"
            name="secondary_role_category"
            value={formState.secondary_role_category}
            onChange={handleFieldChange}
            size="small"
          >
            <MenuItem value="">Ingen</MenuItem>
            {roleCategoryOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="SLL/UULP"
            name="sll_uulp"
            value={formState.sll_uulp}
            onChange={handleFieldChange}
            size="small"
          >
            <MenuItem value="SLL">SLL</MenuItem>
            <MenuItem value="UULP">UULP</MenuItem>
          </TextField>

          <TextField
            select
            label="Akut/elektivt"
            name="acute_elective"
            value={formState.acute_elective}
            onChange={handleFieldChange}
            size="small"
          >
            <MenuItem value="Akut">Akut</MenuItem>
            <MenuItem value="Elektivt">Elektivt</MenuItem>
          </TextField>

          <TextField
            select
            label="Typ av besök"
            name="visit_type"
            value={formState.visit_type}
            onChange={handleFieldChange}
            size="small"
          >
            {visitTypeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Snitt-tid per besök"
            name="average_minutes_per_visit"
            type="number"
            value={formState.average_minutes_per_visit}
            onChange={handleFieldChange}
            size="small"
            required
          />

          <TextField
            label="DRG-snitt"
            name="drg_average"
            type="number"
            value={formState.drg_average}
            onChange={handleFieldChange}
            size="small"
            required
          />

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting
                ? "Sparar..."
                : editingRowId
                  ? "Uppdatera rad"
                  : "Lägg till rad"}
            </Button>
            {editingRowId ? (
              <Button type="button" variant="outlined" onClick={resetForm}>
                Avbryt
              </Button>
            ) : null}
          </Box>
        </Box>
      </Paper>

      <Paper sx={panelSx}>
        <SectionTitle
          overline="Produktionsrader"
          title="Inmatade rader"
          description="Raderna nedan är användarens produktionsplan. Beräknade kolumner visas som stöd och sparas inte som manuell input."
        />

        <TableContainer>
          <Table size="small" aria-label="Inmatade produktionsrader">
            <TableHead>
              <TableRow>
                <TableCell sx={headerCellSx}>Kombika</TableCell>
                <TableCell sx={headerCellSx}>Dag</TableCell>
                <TableCell sx={headerCellSx}>Vårdtillfällen</TableCell>
                <TableCell sx={headerCellSx}>Yrkeskategori</TableCell>
                <TableCell sx={headerCellSx}>Sekundär</TableCell>
                <TableCell sx={headerCellSx}>SLL/UULP</TableCell>
                <TableCell sx={headerCellSx}>Akut/elektivt</TableCell>
                <TableCell sx={headerCellSx}>Typ av besök</TableCell>
                <TableCell sx={headerCellSx}>Snitt-tid</TableCell>
                <TableCell sx={headerCellSx}>DRG-snitt</TableCell>
                <TableCell sx={headerCellSx}>Besökstid</TableCell>
                <TableCell sx={headerCellSx}>DRG</TableCell>
                <TableCell sx={headerCellSx}>Åtgärd</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const visits = toNumber(row.visits);
                const averageMinutes = toNumber(row.average_minutes_per_visit);
                const drgAverage = toNumber(row.drg_average);

                return (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.kombika_pf_id}</TableCell>
                    <TableCell>{row.period_value}</TableCell>
                    <TableCell sx={numericCellSx}>{row.visits}</TableCell>
                    <TableCell>{row.primary_role_category}</TableCell>
                    <TableCell>{row.secondary_role_category ?? "-"}</TableCell>
                    <TableCell>{row.sll_uulp}</TableCell>
                    <TableCell>{row.acute_elective}</TableCell>
                    <TableCell>{row.visit_type}</TableCell>
                    <TableCell sx={numericCellSx}>
                      {row.average_minutes_per_visit}
                    </TableCell>
                    <TableCell sx={numericCellSx}>{row.drg_average}</TableCell>
                    <TableCell sx={numericCellSx}>
                      {roundToWholeNumber(
                        calculateTotalVisitMinutes(visits, averageMinutes)
                      )}
                    </TableCell>
                    <TableCell sx={numericCellSx}>
                      {roundToOneDecimal(calculateDrgPoints(visits, drgAverage))}
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleEditRow(row)}>
                        Redigera
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 2,
        }}
      >
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
              <MetricRow
                key={item.label}
                label={item.label}
                value={item.value}
              />
            ))}
          </Stack>
        </Paper>

        <Paper sx={processPanelSx}>
          <SectionTitle
            overline="Nästa steg"
            title="Fortsätt från produktionsplanen"
            description="Välj om vårdtillfällen ska fördelas till OO eller om planen ska användas direkt i dimensioneringen."
          />

          <Box sx={dimensioningSupportSx}>
            <Typography variant="caption" sx={overlineSx}>
              Beräknat stödvärde för senare dimensionering
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
              <SupportMetric
                label="Total besökstid"
                value={`${roundToWholeNumber(totalVisitMinutes)} min`}
              />
              <SupportMetric
                label="Total DRG"
                value={roundToOneDecimal(totalDrgPoints)}
              />
              <SupportMetric
                label="Närvarobehov"
                value={roundToTwoDecimals(presenceNeed)}
              />
            </Box>
            <Typography variant="caption" sx={mutedTextSx}>
              Räknas från vårdtillfällen, snitt-tid och DRG-snitt. Fylls inte i manuellt.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              size="large"
              href="/production/oo-distribution"
            >
              Fördela till OO
            </Button>
            <Button variant="contained" size="large" href="/dimensioning">
              Gå till Dimensionering
            </Button>
          </Box>
        </Paper>
      </Box>
    </Stack>
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

function SupportMetric(props: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" sx={mutedTextSx}>
        {props.label}
      </Typography>
      <Typography sx={{ color: "#005883", fontWeight: 700 }}>
        {props.value}
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
  const groupedValues = new Map<string, { totalMinutes: number; count: number }>();

  rows.forEach((row) => {
    const label = row.visit_type ?? "Ej angivet";
    const currentValue = groupedValues.get(label) ?? {
      totalMinutes: 0,
      count: 0,
    };

    groupedValues.set(label, {
      totalMinutes:
        currentValue.totalMinutes + toNumber(row.average_minutes_per_visit),
      count: currentValue.count + 1,
    });
  });

  return Array.from(groupedValues.entries()).map(([label, value]) => ({
    label,
    value: value.count === 0 ? 0 : value.totalMinutes / value.count,
  }));
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

function formatDay(
  periodType: string | null,
  periodValue: string | null
): string {
  if (!periodValue) {
    return "Ej angivet";
  }

  return periodType === "day" ? periodValue : `Dag ${periodValue}`;
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

const dimensioningSupportSx = {
  bgcolor: "#ffffff",
  border: "1px solid #d0d7de",
  borderRadius: 1,
  p: 1.5,
  mb: 2,
};

const formGridSx = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 2,
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

const headerCellSx = {
  color: "#005883",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const numericCellSx = {
  textAlign: "right",
  whiteSpace: "nowrap",
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
