import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  TextField,
  Typography,
} from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import {
  formatOneDecimal,
  formatTwoDecimals,
  formatWholeNumber,
} from "@/shared/utils/format-number";
import {
  calculateProductionHours,
  calculateWeeklyVisits,
  weekdayFields,
} from "./calculations";
import { OoDimensioningMetric } from "./oo-dimensioning-metric";
import type {
  OoDimensioningBasis,
  OoDimensioningProductionRow,
  WeekdayField,
} from "./types";

type ProductionTimeByRoleSectionProps = {
  basis: OoDimensioningBasis;
  rows: OoDimensioningProductionRow[];
  onRowChange: (
    rowId: string,
    field:
      | "supportVisitsForOtherRoles"
      | "averageMinutesPerVisit"
      | WeekdayField,
    value: number
  ) => void;
};

export function ProductionTimeByRoleSection(
  props: ProductionTimeByRoleSectionProps
) {
  return (
    <SectionCard>
      <FormSection
        overline="1. Inmatning tidsåtgång per yrkeskategori OO"
        title="Produktion och tid per yrkeskategori"
        description="Underlaget kommer från produktionsplaneringen och OO-fördelningen. Varje yrkeskategori öppnas separat för justering och veckofördelning."
      />

      <Typography variant="subtitle2" sx={subheadingSx}>
        Underlag från tidigare steg
      </Typography>
      <Box sx={summaryGridSx}>
        <OoDimensioningMetric
          label="Ekonomisk kombika"
          value={props.basis.economicKombika || "Saknas"}
        />
        <OoDimensioningMetric
          label="Vårdande enheter"
          value={props.basis.careUnits.join(", ") || "Saknas"}
        />
        <OoDimensioningMetric
          label="Årsbesök från plan"
          value={formatWholeNumber(props.basis.totalAnnualVisits)}
        />
        <OoDimensioningMetric
          label="Snitt-tid från plan"
          value={`${formatTwoDecimals(props.basis.averageMinutesPerVisit)} min`}
        />
      </Box>

      <Typography variant="subtitle2" sx={subheadingSx}>
        Yrkeskategorier att dimensionera
      </Typography>
      <Box sx={{ display: "grid", gap: 1.5 }}>
        {props.rows.map((row, index) => (
          <Accordion
            key={row.id}
            defaultExpanded={index === 0}
            disableGutters
            sx={accordionSx}
          >
            <AccordionSummary
              expandIcon={
                <Typography aria-hidden sx={expandIconSx}>
                  +
                </Typography>
              }
              sx={accordionSummarySx}
            >
              <Box sx={rowHeaderGridSx}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: "#005883", fontWeight: 700 }}>
                    {row.roleCategory}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.careUnit} · {row.economicKombika || "Saknar kombika"}
                  </Typography>
                </Box>
                <OoDimensioningMetric
                  label="Årsbesök"
                  value={formatWholeNumber(row.visitsFromProductionPlan)}
                />
                <OoDimensioningMetric
                  label="Veckobesök"
                  value={formatOneDecimal(calculateWeeklyVisits(row))}
                />
                <OoDimensioningMetric
                  label="Produktionstid/vecka"
                  value={`${formatTwoDecimals(
                    calculateProductionHours(
                      calculateWeeklyVisits(row) +
                        row.supportVisitsForOtherRoles,
                      row.averageMinutesPerVisit
                    )
                  )} h`}
                />
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={accordionDetailsSx}>
              <Box sx={detailsGridSx}>
                <Box sx={detailGroupSx}>
                  <Typography variant="subtitle2" sx={groupTitleSx}>
                    Hämtat från plan
                  </Typography>
                  <Box sx={detailMetricGridSx}>
                    <OoDimensioningMetric
                      label="Årsbesök"
                      value={formatWholeNumber(row.visitsFromProductionPlan)}
                    />
                    <OoDimensioningMetric
                      label="Snitt-tid"
                      value={`${formatOneDecimal(
                        row.sourceAverageMinutesPerVisit
                      )} min`}
                    />
                  </Box>
                </Box>

                <Box sx={detailGroupSx}>
                  <Typography variant="subtitle2" sx={groupTitleSx}>
                    Fyll i vid behov
                  </Typography>
                  <Box sx={inputGridSx}>
                    <TextField
                      label="Stödbesök för andra roller/vecka"
                      type="number"
                      size="small"
                      value={row.supportVisitsForOtherRoles}
                      onChange={(event) =>
                        props.onRowChange(
                          row.id,
                          "supportVisitsForOtherRoles",
                          Number(event.target.value)
                        )
                      }
                      slotProps={{ htmlInput: { min: 0, step: 0.1 } }}
                    />
                    <TextField
                      label="Snitt-tid, justering"
                      type="number"
                      size="small"
                      helperText={`Från plan: ${formatOneDecimal(
                        row.sourceAverageMinutesPerVisit
                      )} min`}
                      value={row.averageMinutesPerVisit}
                      onChange={(event) =>
                        props.onRowChange(
                          row.id,
                          "averageMinutesPerVisit",
                          Number(event.target.value)
                        )
                      }
                      slotProps={{ htmlInput: { min: 0, step: 1 } }}
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={detailGroupSx}>
                <Typography variant="subtitle2" sx={groupTitleSx}>
                  Periodisering över vecka
                </Typography>
                <Box sx={weekdayGridSx}>
                  {weekdayFields.map((weekday) => (
                    <TextField
                      key={weekday.field}
                      label={weekday.shortLabel}
                      type="number"
                      size="small"
                      value={formatInputValue(row[weekday.field])}
                      onChange={(event) =>
                        props.onRowChange(
                          row.id,
                          weekday.field,
                          Number(event.target.value)
                        )
                      }
                      slotProps={{ htmlInput: { min: 0, step: 0.1 } }}
                    />
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </SectionCard>
  );
}

function formatInputValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

const subheadingSx = {
  color: "#005883",
  fontWeight: 700,
  mb: 1,
};

const summaryGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
    xl: "repeat(4, minmax(0, 1fr))",
  },
  gap: 1.5,
  mb: 2,
};

const accordionSx = {
  border: "1px solid #d0d7de",
  borderRadius: 1,
  bgcolor: "var(--page-background)",
  boxShadow: "none",
  overflow: "hidden",
  "&:before": {
    display: "none",
  },
};

const accordionSummarySx = {
  bgcolor: "var(--page-background)",
  px: 1.5,
  py: 1,
  "& .MuiAccordionSummary-content": {
    m: 0,
    minWidth: 0,
  },
};

const expandIconSx = {
  color: "#005883",
  fontWeight: 700,
};

const accordionDetailsSx = {
  borderTop: "1px solid #d0d7de",
  display: "grid",
  gap: 1.5,
  p: 1.5,
};

const rowHeaderGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "minmax(220px, 1.4fr) repeat(3, minmax(0, 1fr))",
  },
  gap: 1,
  alignItems: "stretch",
};

const detailsGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    lg: "minmax(0, 0.8fr) minmax(0, 1.2fr)",
  },
  gap: 1.5,
};

const detailGroupSx = {
  border: "1px solid #d0d7de",
  borderRadius: 1,
  bgcolor: "var(--section-background)",
  p: 1.5,
};

const groupTitleSx = {
  color: "#005883",
  fontWeight: 700,
  mb: 1,
};

const detailMetricGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
  gap: 1,
};

const inputGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
  gap: 1.5,
};

const weekdayGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "repeat(2, minmax(0, 1fr))",
    sm: "repeat(3, minmax(0, 1fr))",
    lg: "repeat(4, minmax(0, 1fr))",
  },
  gap: 1,
};
