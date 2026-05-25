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
import type { OutpatientProductionRow } from "@/types/production";
import type { ProductionBasisSummary } from "../types/outpatient-dimensioning.types";

type DimensioningProductionBasisProps = {
  rows: OutpatientProductionRow[];
  productionBasis: ProductionBasisSummary;
};

export function DimensioningProductionBasis(
  props: DimensioningProductionBasisProps
) {
  return (
    <SectionCard>
      <Stack
        direction={{ xs: "column", md: "row" }}
        sx={{ justifyContent: "space-between", gap: 1.5 }}
      >
        <FormSection
          overline="Hämtat från produktionsplan"
          title="Produktionsunderlag från produktionsplan"
          description="Värdena nedan är sparade produktionsrader och används som underlag för beräknad närvaro."
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
          label="Antal besök/vårdtillfällen"
          value={formatWholeNumber(props.productionBasis.totalVisits)}
        />
        <SupportValue
          label="Snitt-tid per besök"
          value={`${formatTwoDecimals(
            props.productionBasis.averageMinutesPerVisit
          )} min`}
        />
        <SupportValue
          label="Typ av besök"
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
          label="Utfall R12"
          value={formatWholeNumber(props.productionBasis.r12Outcome)}
        />
        <SupportValue
          label="R12 närvaro FoUU"
          value={formatTwoDecimals(props.productionBasis.r12PresenceFouu)}
        />
        <SupportValue
          label="R12 närvaro produktion"
          value={formatTwoDecimals(
            props.productionBasis.r12PresenceProduction
          )}
        />
        <SupportValue
          label="R12 lönekostnad/närvaro"
          value={`${formatWholeNumber(
            props.productionBasis.r12SalaryCostPerPresence
          )} kr`}
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
                  Besök
                </TableCell>
                <TableCell sx={headerCellSx} align="right">
                  Snitt-tid
                </TableCell>
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
                    {formatWholeNumber(row.visits ?? 0)}
                  </TableCell>
                  <TableCell align="right">
                    {formatWholeNumber(row.average_minutes_per_visit ?? 0)} min
                  </TableCell>
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

function SupportValue(props: { label: string; value: string }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {props.label}
      </Typography>
      <Typography sx={{ color: "#005883", fontWeight: 700 }}>
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
  border: "1px solid #d0d7de",
  borderRadius: 1,
  p: 1.5,
};

const comparisonGridSx = {
  ...supportGridSx,
  gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)", xl: "repeat(7, 1fr)" },
  mt: 1.5,
};

const headerCellSx = {
  color: "#005883",
  fontWeight: 700,
  whiteSpace: "nowrap",
};
