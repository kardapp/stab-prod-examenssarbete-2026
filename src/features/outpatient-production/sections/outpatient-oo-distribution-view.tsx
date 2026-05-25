"use client";

import type { ReactNode } from "react";
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
import type { OutpatientProductionRow } from "@/types/production";
import { FormSection } from "@/shared/components/form-section";
import { PageHeader } from "@/shared/components/page-header";
import { SectionCard } from "@/shared/components/section-card";
import {
  formatOneDecimal,
  formatWholeNumber,
} from "@/shared/utils/format-number";
import { useOutpatientOoDistribution } from "../hooks/use-outpatient-oo-distribution";
import type {
  CareUnitOption,
  OoDistributionDraftRow,
} from "../types/outpatient-oo-distribution.types";
import { calculateDistributedVisits } from "../utils/outpatient-oo-distribution-calculations";

export function OutpatientOoDistributionView() {
  const ooDistribution = useOutpatientOoDistribution();

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", bgcolor: "var(--page-background)", p: 2 }}
    >
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <PageHeader
            overline="Produktionsplanering öppenvård"
            title="Fördelning av vårdtillfällen till OO"
          />

          {ooDistribution.isLoading ? (
            <SectionCard>
              <CircularProgress />
            </SectionCard>
          ) : ooDistribution.errorMessage ? (
            <Alert severity="error">{ooDistribution.errorMessage}</Alert>
          ) : ooDistribution.productionRows.length === 0 ? (
            <Alert severity="info">
              Det finns inga sparade produktionsrader att fördela ännu.
            </Alert>
          ) : (
            <Stack spacing={2}>
              <OoIntroSection />

              <ProductionBasisSection
                productionRows={ooDistribution.productionRows}
                totalVisits={ooDistribution.summary.totalVisits}
              />

              <DistributionEditorSection
                careUnitOptions={ooDistribution.careUnitOptions}
                rows={ooDistribution.selectedDraftRows}
                summary={ooDistribution.summary}
                showValidation={ooDistribution.showValidation}
                validationMessage={ooDistribution.validationMessage}
                onAddRow={ooDistribution.addDistributionRow}
                onCareUnitChange={ooDistribution.handleCareUnitChange}
                onRemoveRow={ooDistribution.removeDistributionRow}
                onRowChange={ooDistribution.handleDistributionRowChange}
              />

              <OoActionsSection
                isSaving={ooDistribution.isSaving}
                saveMessage={ooDistribution.saveMessage}
                selectedProductionRow={ooDistribution.selectedProductionRow}
                onSave={ooDistribution.saveDistribution}
              />
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

function OoIntroSection() {
  return (
    <SectionCard>
      <FormSection
        overline="Steg 2"
        title="Årets vårdtillfällen fördelas till vårdande enhet"
        description="Efter överenskommelse matas årets OO-fördelning in för hela volymen från produktionsplaneringen."
      />
      <Box sx={introGridSx}>
        <MetricValue label="Underlag" value="Senast sparad årsvolym" />
        <MetricValue label="Fördelning" value="Vårdande enhet" />
        <MetricValue label="Krav" value="100% totalt" />
      </Box>
    </SectionCard>
  );
}

function ProductionBasisSection(props: {
  productionRows: OutpatientProductionRow[];
  totalVisits: number;
}) {
  return (
    <SectionCard>
      <FormSection
        overline="Produktionsunderlag"
        title="Vårdtillfällen från produktionsplaneringen"
        description="Det här är totalen du skrev in i produktionsplaneringen, summerad över yrkeskategorierna."
      />

      <Box sx={basisGridSx}>
        <MetricValue
          label="Vårdtillfällen att fördela"
          value={formatWholeNumber(props.totalVisits)}
        />
        <MetricValue
          label="Antal yrkeskategorirader"
          value={formatWholeNumber(props.productionRows.length)}
        />
        <MetricValue
          label="Ekonomisk kombika"
          value={formatKombikaSummary(props.productionRows)}
        />
        <MetricValue
          label="År"
          value={formatProductionYear(props.productionRows[0])}
        />
      </Box>
    </SectionCard>
  );
}

function DistributionEditorSection(props: {
  careUnitOptions: CareUnitOption[];
  rows: OoDistributionDraftRow[];
  summary: {
    totalVisits: number;
    totalPercentage: number;
    distributedVisits: number;
    remainingPercentage: number;
    remainingVisits: number;
  };
  showValidation: boolean;
  validationMessage: string;
  onAddRow: () => void;
  onCareUnitChange: (draftRowId: string, option: CareUnitOption) => void;
  onRemoveRow: (draftRowId: string) => void;
  onRowChange: (
    draftRowId: string,
    changes: Partial<Omit<OoDistributionDraftRow, "id" | "savedId">>
  ) => void;
}) {
  return (
    <SectionCard>
      <FormSection
        overline="OO-fördelning"
        title="Fördelning till vårdande enhet"
        description="Årets vårdtillfällen fördelas procentuellt till en eller flera vårdande enheter."
      />

      <Box sx={summaryGridSx}>
        <MetricValue
          label="Vårdtillfällen per år"
          value={formatWholeNumber(props.summary.totalVisits)}
        />
        <MetricValue
          label="Fördelad andel"
          value={`${formatOneDecimal(props.summary.totalPercentage)}%`}
        />
        <MetricValue
          label="Fördelade vårdtillfällen"
          value={formatOneDecimal(props.summary.distributedVisits)}
        />
        <MetricValue
          label="Kvar att fördela"
          value={`${formatOneDecimal(props.summary.remainingVisits)} (${formatOneDecimal(
            props.summary.remainingPercentage
          )}%)`}
        />
      </Box>

      {props.showValidation && props.validationMessage ? (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {props.validationMessage}
        </Alert>
      ) : null}

      <Box sx={{ display: "grid", gap: 0.75, mt: 2 }}>
        <Box sx={distributionHeaderSx}>
          <HeaderCell>Vårdande enhet</HeaderCell>
          <HeaderCell align="right">Andel</HeaderCell>
          <HeaderCell align="right">Vårdtillfällen</HeaderCell>
          <HeaderCell>Åtgärd</HeaderCell>
        </Box>

        {props.rows.map((row) => (
          <DistributionRow
            key={row.id}
            row={row}
            careUnitOptions={props.careUnitOptions}
            totalVisits={props.summary.totalVisits}
            canRemove={props.rows.length > 1}
            onCareUnitChange={props.onCareUnitChange}
            onRemoveRow={props.onRemoveRow}
            onRowChange={props.onRowChange}
          />
        ))}
      </Box>

      <Box sx={{ mt: 2 }}>
        <Button type="button" variant="outlined" onClick={props.onAddRow}>
          Lägg till vårdande enhet
        </Button>
      </Box>
    </SectionCard>
  );
}

function DistributionRow(props: {
  row: OoDistributionDraftRow;
  careUnitOptions: CareUnitOption[];
  totalVisits: number;
  canRemove: boolean;
  onCareUnitChange: (draftRowId: string, option: CareUnitOption) => void;
  onRemoveRow: (draftRowId: string) => void;
  onRowChange: (
    draftRowId: string,
    changes: Partial<Omit<OoDistributionDraftRow, "id" | "savedId">>
  ) => void;
}) {
  const visits = calculateDistributedVisits(
    props.totalVisits,
    props.row.percentage
  );

  return (
    <Box sx={distributionRowSx}>
      <InputValue label="Vårdande enhet">
        <TextField
          select
          size="small"
          value={props.row.careUnitId}
          onChange={(event) => {
            const selectedOption = props.careUnitOptions.find(
              (option) => option.id === event.target.value
            );

            if (selectedOption) {
              props.onCareUnitChange(props.row.id, selectedOption);
            }
          }}
          fullWidth
        >
          {props.careUnitOptions.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </InputValue>
      <InputValue label="Andel" align="right">
        <TextField
          type="number"
          size="small"
          value={props.row.percentage}
          onChange={(event) =>
            props.onRowChange(props.row.id, {
              percentage: event.target.value,
            })
          }
          slotProps={{ htmlInput: { min: 0, max: 100, step: 0.1 } }}
          fullWidth
        />
      </InputValue>
      <ReadOnlyValue
        label="Vårdtillfällen"
        value={formatOneDecimal(visits)}
        align="right"
      />
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: "block", lg: "none" }, mb: 0.25 }}
        >
          Åtgärd
        </Typography>
        <Button
          type="button"
          variant="outlined"
          color="error"
          disabled={!props.canRemove}
          onClick={() => props.onRemoveRow(props.row.id)}
          fullWidth
        >
          Ta bort
        </Button>
      </Box>
    </Box>
  );
}

function OoActionsSection(props: {
  isSaving: boolean;
  saveMessage: string;
  selectedProductionRow: OutpatientProductionRow | null;
  onSave: () => void | Promise<void>;
}) {
  return (
    <SectionCard>
      <Stack spacing={2}>
        {props.saveMessage ? (
          <Alert severity="success">{props.saveMessage}</Alert>
        ) : null}

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            type="button"
            variant="contained"
            disabled={props.isSaving}
            onClick={props.onSave}
          >
            {props.isSaving ? "Sparar..." : "Spara OO-fördelning"}
          </Button>
          <Button
            type="button"
            variant="outlined"
            href="/outpatient/production/production-planning"
          >
            Tillbaka till produktionsplanering
          </Button>
          <Button
            type="button"
            variant="outlined"
            href={getDimensioningHref(props.selectedProductionRow)}
          >
            Gå till dimensionering
          </Button>
          <Button
            type="button"
            variant="outlined"
            href="/outpatient/production/results-production-planning"
          >
            Gå till resultat
          </Button>
        </Box>
      </Stack>
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

function HeaderCell(props: {
  children: string;
  align?: "left" | "right";
}) {
  return (
    <Typography
      variant="caption"
      sx={{
        color: "#005883",
        display: { xs: "none", lg: "block" },
        fontWeight: 700,
        minWidth: 0,
        textAlign: props.align ?? "left",
      }}
    >
      {props.children}
    </Typography>
  );
}

function InputValue(props: {
  children: ReactNode;
  label: string;
  align?: "left" | "right";
}) {
  return (
    <Box sx={{ minWidth: 0, textAlign: { xs: "left", lg: props.align } }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: { xs: "block", lg: "none" }, mb: 0.25 }}
      >
        {props.label}
      </Typography>
      {props.children}
    </Box>
  );
}

function ReadOnlyValue(props: {
  label: string;
  value: string;
  align?: "left" | "right";
}) {
  return (
    <Box sx={{ minWidth: 0, textAlign: { xs: "left", lg: props.align } }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: { xs: "block", lg: "none" }, mb: 0.25 }}
      >
        {props.label}
      </Typography>
      <Typography sx={readOnlySx}>{props.value}</Typography>
    </Box>
  );
}

function getDimensioningHref(row: OutpatientProductionRow | null): string {
  if (!row) {
    return "/outpatient/dimensioning/oo-opv";
  }

  const params = new URLSearchParams({
    productionPlanId: String(row.production_plan_id ?? 1),
    kombikaId: row.kombika_pf_id ?? "",
    careType: isDayCareRow(row) ? "dagvard" : "mottagning",
  });

  return `/outpatient/dimensioning/oo-opv?${params.toString()}`;
}

function formatKombikaSummary(rows: OutpatientProductionRow[]): string {
  const kombikaValues = Array.from(
    new Set(
      rows
        .map((row) => [row.kombika_pf_id, row.kombika_pf].filter(Boolean).join(" - "))
        .filter(Boolean)
    )
  );

  return kombikaValues.join(", ") || "Saknas";
}

function isDayCareRow(row: OutpatientProductionRow): boolean {
  const values = [row.care_type, row.kombika_pf, row.kombika_pf_id]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    values.includes("dagv") ||
    values.includes("day_care") ||
    values.includes("dagvard")
  );
}

function formatProductionYear(row: OutpatientProductionRow | undefined): string {
  if (!row) {
    return "Saknar år";
  }

  if (row.production_plan_year) {
    return String(row.production_plan_year);
  }

  return row.period_value || "Saknar år";
}

const introGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(3, minmax(0, 1fr))",
  },
  gap: 1.5,
};

const basisGridSx = {
  ...introGridSx,
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
    xl: "repeat(4, minmax(0, 1fr))",
  },
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

const distributionHeaderSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    lg: "minmax(260px, 1.4fr) minmax(96px, 0.6fr) minmax(120px, 0.7fr) minmax(96px, 0.6fr)",
  },
  gap: 1,
  alignItems: "center",
};

const distributionRowSx = {
  ...distributionHeaderSx,
  borderTop: "1px solid #d0d7de",
  pt: 1,
};

const readOnlySx = {
  border: "1px solid #d0d7de",
  borderRadius: 1,
  minHeight: 40,
  px: 1.5,
  py: 1,
  bgcolor: "var(--page-background)",
  fontWeight: 700,
};
