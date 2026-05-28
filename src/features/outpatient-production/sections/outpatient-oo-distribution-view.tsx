"use client";

import type { ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  InputAdornment,
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
import {
  calculateDistributedVisits,
  toNumber,
} from "../utils/outpatient-oo-distribution-calculations";
import { getAnnualVisits } from "../utils/outpatient-production-calculations";

type OoDistributionSummary = {
  totalVisits: number;
  totalPercentage: number;
  distributedVisits: number;
  remainingPercentage: number;
  remainingVisits: number;
};

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

              <ProfessionalCategoriesSection
                productionRows={ooDistribution.productionRows}
                distributionRows={ooDistribution.selectedDraftRows}
              />

              <DistributionEditorSection
                careUnitOptions={ooDistribution.careUnitOptions}
                productionRows={ooDistribution.productionRows}
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

function ProfessionalCategoriesSection(props: {
  productionRows: OutpatientProductionRow[];
  distributionRows: OoDistributionDraftRow[];
}) {
  return (
    <SectionCard>
      <FormSection
        overline="Fördelningsunderlag"
        title="Yrkeskategorier och totalvolymer"
      />

      <Box sx={[tableStackSx, { mt: 2 }]}>
        <Box sx={professionalHeaderSx}>
          <HeaderCell>Primär yrkeskategori</HeaderCell>
          <HeaderCell>Sekundär yrkeskategori</HeaderCell>
          <HeaderCell>Totala vårdtillfällen</HeaderCell>
          <HeaderCell>Fördelat</HeaderCell>
        </Box>

        {props.productionRows.map((row) => {
          const allocatedPercentage = getAllocatedPercentageForProductionRow(
            row.id,
            props.distributionRows
          );

          return (
            <Box key={row.id} sx={professionalRowSx}>
              <TableValue
                label="Primär yrkeskategori"
                value={row.primary_role_category || "Ej angiven"}
              />
              <TableValue
                label="Sekundär yrkeskategori"
                value={row.secondary_role_category || "Ej angiven"}
              />
              <TableValue
                label="Totala vårdtillfällen"
                value={formatWholeNumber(getAnnualVisits(row))}
                strong
              />
              <TableValue
                label="Fördelat"
                value={`${formatOneDecimal(allocatedPercentage)}%`}
                strong
              />
            </Box>
          );
        })}
      </Box>
    </SectionCard>
  );
}

function DistributionEditorSection(props: {
  careUnitOptions: CareUnitOption[];
  productionRows: OutpatientProductionRow[];
  rows: OoDistributionDraftRow[];
  summary: OoDistributionSummary;
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
        title="Fördela till vårdande enhet"
      />

      <DistributionProgressSummary
        productionRows={props.productionRows}
        rows={props.rows}
        summary={props.summary}
      />

      {props.showValidation && props.validationMessage ? (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {props.validationMessage}
        </Alert>
      ) : null}

      <Box sx={[tableStackSx, { mt: 2 }]}>
        <Box sx={distributionHeaderRowSx}>
          <HeaderCell>Yrkeskategori</HeaderCell>
          <HeaderCell>Vårdande enhet</HeaderCell>
          <HeaderCell>Andel</HeaderCell>
          <HeaderCell>Vårdtillfällen</HeaderCell>
          <HeaderCell>Åtgärd</HeaderCell>
        </Box>

        {props.rows.map((row) => (
          <DistributionRow
            key={row.id}
            row={row}
            productionRows={props.productionRows}
            careUnitOptions={props.careUnitOptions}
            canRemove={props.rows.length > 1}
            onCareUnitChange={props.onCareUnitChange}
            onRemoveRow={props.onRemoveRow}
            onRowChange={props.onRowChange}
          />
        ))}
      </Box>

      <Box sx={{ mt: 2 }}>
        <Button type="button" variant="outlined" onClick={props.onAddRow}>
          Lägg till fördelningsrad
        </Button>
      </Box>
    </SectionCard>
  );
}

function DistributionRow(props: {
  row: OoDistributionDraftRow;
  productionRows: OutpatientProductionRow[];
  careUnitOptions: CareUnitOption[];
  canRemove: boolean;
  onCareUnitChange: (draftRowId: string, option: CareUnitOption) => void;
  onRemoveRow: (draftRowId: string) => void;
  onRowChange: (
    draftRowId: string,
    changes: Partial<Omit<OoDistributionDraftRow, "id" | "savedId">>
  ) => void;
}) {
  const selectedProductionRow =
    props.productionRows.find((row) => row.id === props.row.productionRowId) ??
    null;
  const visits = calculateDistributedVisits(
    selectedProductionRow ? getAnnualVisits(selectedProductionRow) : 0,
    props.row.percentage
  );

  return (
    <Box sx={distributionRowContainerSx}>
      <Box sx={distributionRowSx}>
        <InputValue label="Yrkeskategori" hideLabelOnDesktop>
          <TextField
            select
            size="small"
            value={props.row.productionRowId ?? ""}
            onChange={(event) =>
              props.onRowChange(props.row.id, {
                productionRowId: Number(event.target.value) || null,
              })
            }
            fullWidth
          >
            {props.productionRows.map((row) => (
              <MenuItem key={row.id} value={row.id}>
                {formatProductionRowOption(row)}
              </MenuItem>
            ))}
          </TextField>
        </InputValue>
        <InputValue label="Vårdande enhet" hideLabelOnDesktop>
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
        <InputValue label="Andel" hideLabelOnDesktop>
          <TextField
            type="number"
            size="small"
            value={props.row.percentage}
            onChange={(event) =>
              props.onRowChange(props.row.id, {
                percentage: event.target.value,
              })
            }
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              },
              htmlInput: { min: 0, max: 100, step: 0.1 },
            }}
            fullWidth
          />
        </InputValue>
        <ReadOnlyValue
          label="Vårdtillfällen"
          value={formatOneDecimal(visits)}
          hideLabelOnDesktop
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

function DistributionProgressSummary(props: {
  productionRows: OutpatientProductionRow[];
  rows: OoDistributionDraftRow[];
  summary: OoDistributionSummary;
}) {
  const boundedPercentage = Math.max(
    0,
    Math.min(100, props.summary.totalPercentage)
  );
  const isUnderAllocated = props.summary.remainingPercentage > 0.01;
  const isOverAllocated = props.summary.remainingPercentage < -0.01;
  const roleStatuses = props.productionRows.map((row) => {
    const allocatedPercentage = getAllocatedPercentageForProductionRow(
      row.id,
      props.rows
    );
    const remainingPercentage = 100 - allocatedPercentage;
    const boundedRolePercentage = Math.max(0, Math.min(100, allocatedPercentage));
    const totalVisits = getAnnualVisits(row);

    return {
      allocatedPercentage,
      boundedRolePercentage,
      distributedVisits: calculateDistributedVisits(
        totalVisits,
        allocatedPercentage
      ),
      remainingPercentage,
      row,
      totalVisits,
    };
  });
  const statusLabel = isOverAllocated
    ? `${formatOneDecimal(Math.abs(props.summary.remainingPercentage))}% över`
    : `${formatOneDecimal(Math.max(0, props.summary.remainingPercentage))}% kvar`;
  const progressFillColor = isOverAllocated
    ? "#B42318"
    : isUnderAllocated
      ? "#F2C94C"
      : "#005883";

  return (
    <Box sx={progressSummarySx}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1}
        sx={{
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Fördelning totalt
          </Typography>
        </Box>
        <Typography sx={statusSx}>{statusLabel}</Typography>
      </Stack>

      <Box
        aria-label="Fördelad andel"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={boundedPercentage}
        role="progressbar"
        sx={progressTrackSx}
      >
        <Box
          sx={{
            ...progressFillSx,
            bgcolor: progressFillColor,
            width: `${boundedPercentage}%`,
          }}
        />
      </Box>

      <Box sx={progressMetricGridSx}>
        <ProgressMetric
          label="Årsvolym"
          value={formatWholeNumber(props.summary.totalVisits)}
        />
        <ProgressMetric
          label="Fördelad andel"
          value={`${formatOneDecimal(props.summary.totalPercentage)}%`}
        />
        <ProgressMetric
          label="Fördelade vårdtillfällen"
          value={formatOneDecimal(props.summary.distributedVisits)}
        />
        <ProgressMetric
          label={isOverAllocated ? "Överfördelat" : "Kvar att fördela"}
          value={`${formatOneDecimal(
            Math.abs(props.summary.remainingVisits)
          )} (${formatOneDecimal(Math.abs(props.summary.remainingPercentage))}%)`}
        />
      </Box>

      <Stack spacing={0.75}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Status per yrkeskategori
        </Typography>

        <Box sx={roleStatusListSx}>
          <Box sx={roleStatusHeaderSx}>
            <HeaderCell>Yrkeskategori</HeaderCell>
            <HeaderCell>Total volym</HeaderCell>
            <HeaderCell>Fördelad andel</HeaderCell>
            <HeaderCell>Vårdtillfällen</HeaderCell>
            <HeaderCell>Avvikelse</HeaderCell>
          </Box>

          {roleStatuses.map((status) => {
            const isRoleUnderAllocated = status.remainingPercentage > 0.01;
            const isRoleOverAllocated = status.remainingPercentage < -0.01;
            const roleFillColor = isRoleOverAllocated
              ? "#B42318"
              : isRoleUnderAllocated
                ? "#F2C94C"
                : "#005883";
            const roleStatusLabel = isRoleOverAllocated
              ? `${formatOneDecimal(Math.abs(status.remainingPercentage))}% över`
              : `${formatOneDecimal(
                  Math.max(0, status.remainingPercentage)
                )}% kvar`;

            return (
              <Box key={status.row.id} sx={roleStatusRowSx}>
                <TableValue
                  label="Yrkeskategori"
                  value={formatProductionRoleLabel(status.row)}
                  strong
                />
                <TableValue
                  label="Total volym"
                  value={formatWholeNumber(status.totalVisits)}
                />
                <Box sx={roleStatusMeterSx}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: { xs: "block", lg: "none" }, mb: 0.25 }}
                  >
                    Fördelad andel
                  </Typography>
                  <Typography sx={roleStatusTitleSx}>
                    {formatOneDecimal(status.allocatedPercentage)}%
                  </Typography>
                  <Box
                    aria-label={`Fördelad andel för ${formatProductionRoleLabel(
                      status.row
                    )}`}
                    aria-valuemax={100}
                    aria-valuemin={0}
                    aria-valuenow={status.boundedRolePercentage}
                    role="progressbar"
                    sx={progressTrackSx}
                  >
                    <Box
                      sx={{
                        ...progressFillSx,
                        bgcolor: roleFillColor,
                        width: `${status.boundedRolePercentage}%`,
                      }}
                    />
                  </Box>
                </Box>
                <TableValue
                  label="Fördelade vårdtillfällen"
                  value={formatOneDecimal(status.distributedVisits)}
                />
                <TableValue label="Avvikelse" value={roleStatusLabel} strong />
              </Box>
            );
          })}
        </Box>
      </Stack>
    </Box>
  );
}

function ProgressMetric(props: { label: string; value: string }) {
  return (
    <Box sx={progressMetricSx}>
      <Typography variant="caption" color="text.secondary">
        {props.label}
      </Typography>
      <Typography sx={{ color: "primary.main", fontWeight: 700 }}>
        {props.value}
      </Typography>
    </Box>
  );
}

function HeaderCell(props: { children: string }) {
  return (
    <Typography
      variant="caption"
      sx={{
        color: "#005883",
        display: { xs: "none", lg: "block" },
        fontWeight: 700,
        minWidth: 0,
      }}
    >
      {props.children}
    </Typography>
  );
}

function TableValue(props: { label: string; value: string; strong?: boolean }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: { xs: "block", lg: "none" }, mb: 0.25 }}
      >
        {props.label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: props.strong ? 700 : 400,
          overflowWrap: "anywhere",
        }}
      >
        {props.value}
      </Typography>
    </Box>
  );
}

function InputValue(props: {
  children: ReactNode;
  hideLabelOnDesktop?: boolean;
  label: string;
}) {
  return (
    <Box sx={{ minWidth: 0, textAlign: "left" }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: {
            xs: "block",
            lg: props.hideLabelOnDesktop ? "none" : "block",
          },
          mb: 0.25,
        }}
      >
        {props.label}
      </Typography>
      {props.children}
    </Box>
  );
}

function ReadOnlyValue(props: {
  hideLabelOnDesktop?: boolean;
  label: string;
  value: string;
}) {
  return (
    <Box sx={{ minWidth: 0, textAlign: "left" }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: {
            xs: "block",
            lg: props.hideLabelOnDesktop ? "none" : "block",
          },
          mb: 0.25,
        }}
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

function getAllocatedPercentageForProductionRow(
  productionRowId: number,
  rows: OoDistributionDraftRow[]
): number {
  return rows
    .filter(
      (row) =>
        row.productionRowId === productionRowId &&
        row.careUnitId.trim() &&
        row.careUnit.trim()
    )
    .reduce((sum, row) => sum + toNumber(row.percentage), 0);
}

function formatProductionRoleLabel(row: OutpatientProductionRow): string {
  return (
    [row.primary_role_category, row.secondary_role_category]
      .filter(Boolean)
      .join(" + ") || "Ej angiven"
  );
}

function formatProductionRowOption(row: OutpatientProductionRow): string {
  return `${formatProductionRoleLabel(row)} · ${formatWholeNumber(
    getAnnualVisits(row)
  )} totala vårdtillfällen`;
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

const tableStackSx = {
  display: "grid",
  gap: 0.75,
};

const metricSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  p: 1.5,
  bgcolor: "var(--section-background)",
};

const progressSummarySx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  bgcolor: "var(--section-background)",
  display: "grid",
  gap: 1.25,
  p: 1.5,
};

const statusSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  color: "text.secondary",
  fontWeight: 700,
  px: 1.25,
  py: 0.5,
};

const progressTrackSx = {
  bgcolor: "background.default",
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  height: 12,
  overflow: "hidden",
};

const progressFillSx = {
  height: "100%",
  transition: "width 120ms ease",
};

const progressMetricGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
    xl: "repeat(4, minmax(0, 1fr))",
  },
  gap: 1,
};

const progressMetricSx = {
  bgcolor: "background.default",
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  display: "grid",
  gap: 0.25,
  minWidth: 0,
  p: 1,
};

const roleStatusListSx = {
  display: "grid",
  gap: 0.5,
};

const roleStatusGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    lg: "minmax(220px, 1.35fr) minmax(112px, 0.55fr) minmax(160px, 0.85fr) minmax(140px, 0.7fr) minmax(112px, 0.55fr)",
  },
  gap: 1,
  alignItems: "center",
};

const roleStatusHeaderSx = {
  ...roleStatusGridSx,
  px: 1,
};

const roleStatusRowSx = {
  ...roleStatusGridSx,
  bgcolor: "background.default",
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  p: 1,
};

const roleStatusTitleSx = {
  color: "primary.main",
  fontWeight: 700,
  overflowWrap: "anywhere",
};

const roleStatusMeterSx = {
  display: "grid",
  gap: 0.35,
  minWidth: 0,
};

const professionalGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    lg: "minmax(180px, 1fr) minmax(180px, 1fr) minmax(140px, 0.6fr) minmax(120px, 0.55fr)",
  },
  gap: 1,
  alignItems: "center",
};

const professionalHeaderSx = {
  ...professionalGridSx,
  px: 1.5,
};

const professionalRowSx = {
  ...professionalGridSx,
  bgcolor: "background.default",
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  p: 1.5,
};

const distributionHeaderSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    lg: "minmax(220px, 1.15fr) minmax(260px, 1.3fr) minmax(132px, 0.55fr) minmax(150px, 0.6fr) minmax(110px, 0.45fr)",
  },
  gap: 1,
  alignItems: "center",
};

const distributionHeaderRowSx = {
  ...distributionHeaderSx,
  px: 1.5,
};

const distributionRowSx = {
  ...distributionHeaderSx,
  alignItems: "start",
};

const distributionRowContainerSx = {
  bgcolor: "background.default",
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  p: 1.5,
};

const readOnlySx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  minHeight: 40,
  px: 1.5,
  py: 1,
  bgcolor: "var(--page-background)",
  fontWeight: 700,
};
