"use client";

import {
  Alert,
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import {
  formatTwoDecimals,
  formatWholeNumber,
} from "@/shared/utils/format-number";
import type { OutpatientProductionRow } from "@/shared/types/production";
import { getAnnualVisits } from "@/features/outpatient-production/utils/outpatient-production-calculations";
import type { ProductionBasisSummary } from "../types/outpatient-dimensioning.types";

type DimensioningProductionBasisProps = {
  rows: OutpatientProductionRow[];
  productionBasis: ProductionBasisSummary;
};

export function DimensioningProductionBasis(
  props: DimensioningProductionBasisProps
) {
  const visitTimeComments = getUniqueVisitTimeComments(props.rows);
  const hasVisitTimeComments = visitTimeComments.length > 0;

  return (
    <SectionCard>
      <Stack
        direction={{ xs: "column", md: "row" }}
        sx={{ justifyContent: "space-between", gap: 1.5 }}
      >
        <FormSection
          overline="Hämtat från produktionsplan"
          title="Produktionsunderlag från produktionsplan"
          description="Värdena nedan är sparade produktionsrader för året och används som underlag för beräknad närvaro."
        />
      </Stack>

      <Box sx={supportGridSx}>
        <SupportValue
          label="Ekonomisk kombika"
          value={props.productionBasis.kombikaNames.join(", ") || "Saknas"}
        />
        <SupportValue
          label="Kostnadsställe"
          value={props.productionBasis.costCenters.join(", ") || "Saknas"}
        />
        <SupportValue
          label="Sektion"
          value={props.productionBasis.sections.join(", ") || "Saknas"}
        />
        <SupportValue
          label="Antal vårdhändelser per år"
          value={formatWholeNumber(props.productionBasis.totalVisits)}
        />
        <SupportValue
          label="Snitt-tid per vårdhändelse"
          value={`${formatTwoDecimals(
            props.productionBasis.averageMinutesPerVisit
          )} min`}
        />
        {hasVisitTimeComments ? (
          <SupportValue
            label="Kommentar tid per vårdhändelse"
            value={visitTimeComments.join(" · ")}
          />
        ) : null}
        <SupportValue
          label="Typ av vårdhändelse"
          value={props.productionBasis.visitTypes.join(", ") || "Saknas"}
        />
        <SupportValue
          label="Yrkeskategori/kompetens"
          value={props.productionBasis.roleCategories.join(", ") || "Saknas"}
        />
      </Box>

      <Box sx={comparisonGridSx}>
        <SupportValue
          label="Föregående års plan"
          value={formatWholeNumber(props.productionBasis.previousYearPlan)}
        />
        <SupportValue
          label="Föregående års utfall"
          value={formatWholeNumber(props.productionBasis.previousYearOutcome)}
        />
        <SupportValue
          label="Dimensionering föregående år"
          value={formatTwoDecimals(
            props.productionBasis.previousDimensioningPresence
          )}
        />
      </Box>

      {props.rows.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Inga sparade produktionsrader matchar valt underlag.
        </Alert>
      ) : (
        <Box sx={{ overflowX: "auto", mt: 2 }}>
          <Table size="small" aria-label="Produktionsunderlag">
            <TableHead>
              <TableRow>
                <TableCell sx={headerCellSx}>Rad</TableCell>
                <TableCell sx={headerCellSx}>Kombika</TableCell>
                <TableCell sx={headerCellSx}>Kostnadsställe</TableCell>
                <TableCell sx={headerCellSx}>Sektion</TableCell>
                <TableCell sx={headerCellSx}>Typ</TableCell>
                <TableCell sx={headerCellSx} align="right">
                  Vårdhändelser
                </TableCell>
                <TableCell sx={headerCellSx} align="right">
                  Snitt-tid
                </TableCell>
                {hasVisitTimeComments ? (
                  <TableCell sx={headerCellSx}>
                    Kommentar tid per vårdhändelse
                  </TableCell>
                ) : null}
                <TableCell sx={headerCellSx}>Primär roll</TableCell>
                <TableCell sx={headerCellSx}>Sekundär roll</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.row_label}</TableCell>
                  <TableCell>{row.kombika_pf}</TableCell>
                  <TableCell>{row.cost_center}</TableCell>
                  <TableCell>{row.section}</TableCell>
                  <TableCell>{row.visit_type}</TableCell>
                  <TableCell align="right">
                    {formatWholeNumber(getAnnualVisits(row))}
                  </TableCell>
                  <TableCell align="right">
                    {formatWholeNumber(row.average_minutes_per_visit ?? 0)} min
                  </TableCell>
                  {hasVisitTimeComments ? (
                    <TableCell>{row.visit_time_comment ?? "-"}</TableCell>
                  ) : null}
                  <TableCell>{row.primary_role_category}</TableCell>
                  <TableCell>{row.secondary_role_category ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </SectionCard>
  );
}

function getUniqueVisitTimeComments(rows: OutpatientProductionRow[]): string[] {
  return Array.from(
    new Set(
      rows
        .map((row) => row.visit_time_comment?.trim())
        .filter((comment): comment is string => Boolean(comment))
    )
  );
}

function SupportValue(props: { label: string; value: string }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {props.label}
      </Typography>
      <Typography
        sx={{
          color: "#005883",
          fontWeight: 700,
          overflowWrap: "anywhere",
        }}
      >
        {props.value}
      </Typography>
    </Stack>
  );
}

const supportGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
  gap: 1.5,
  bgcolor: "var(--section-background)",
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  p: 1.5,
};

const comparisonGridSx = {
  ...supportGridSx,
  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
  mt: 1.5,
};

const headerCellSx = {
  color: "#005883",
  fontWeight: 700,
  whiteSpace: "nowrap",
};
