"use client";

import type { ReactNode } from "react";
import { useState } from "react";
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
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  return (
    <SectionCard>
      <FormSection
        overline="1. Inmatning tidsåtgång per yrkeskategori OO"
        title="Produktion och tid per yrkeskategori"
        description="Underlaget kommer från produktionsplaneringen och OO-fördelningen. Öppna en rad om du behöver justera stöd, snitt-tid eller veckofördelning."
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
        {props.basis.visitTimeComments.length > 0 ? (
          <OoDimensioningMetric
            label="Kommentar besökstid"
            value={props.basis.visitTimeComments.join(" · ")}
          />
        ) : null}
      </Box>

      <Typography variant="subtitle2" sx={subheadingSx}>
        Yrkeskategorier att dimensionera
      </Typography>
      <Box sx={{ display: "grid", gap: 1 }}>
        {props.rows.map((row) => {
          const isExpanded = Boolean(expandedRows[row.id]);

          return (
            <Accordion
              key={row.id}
              disableGutters
              expanded={isExpanded}
              onChange={(_, expanded) =>
                setExpandedRows((current) => ({
                  ...current,
                  [row.id]: expanded,
                }))
              }
              sx={accordionSx}
            >
              <AccordionSummary sx={accordionSummarySx}>
                <Box sx={rowHeaderGridSx}>
                  <Box sx={roleCellSx}>
                    <Typography sx={roleTitleSx}>{row.roleCategory}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={roleMetaSx}>
                      {row.careUnit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={roleMetaSx}>
                      {row.economicKombika || "Saknar kombika"}
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
                    label="Tid/vecka"
                    value={`${formatTwoDecimals(
                      calculateProductionHours(
                        calculateWeeklyVisits(row) +
                          row.supportVisitsForOtherRoles,
                        row.averageMinutesPerVisit
                      )
                    )} h`}
                  />
                  <Box sx={openCellSx}>
                    {isExpanded ? "Stäng" : "Öppna"}
                  </Box>
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
                      {row.visitTimeComment ? (
                        <OoDimensioningMetric
                          label="Kommentar besökstid"
                          value={row.visitTimeComment}
                        />
                      ) : null}
                    </Box>
                  </Box>

                  <OptionalInputGroup title="Visa fält för justering">
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
                  </OptionalInputGroup>
                </Box>

                <OptionalInputGroup title="Visa veckofördelning">
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
                </OptionalInputGroup>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </SectionCard>
  );
}

function OptionalInputGroup(props: { children: ReactNode; title: string }) {
  return (
    <Accordion disableGutters sx={optionalAccordionSx}>
      <AccordionSummary sx={optionalSummarySx}>
        <Box sx={optionalHeaderSx}>
          <Typography variant="subtitle2" sx={optionalTitleSx}>
            {props.title}
          </Typography>
          <Box sx={smallOpenCellSx}>Öppna</Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={optionalDetailsSx}>{props.children}</AccordionDetails>
    </Accordion>
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
  border: "1px solid var(--color-border)",
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
  minHeight: 96,
  px: 1.5,
  py: 1,
  "& .MuiAccordionSummary-content": {
    m: 0,
    minWidth: 0,
  },
};

const accordionDetailsSx = {
  borderTop: "1px solid var(--color-border)",
  display: "grid",
  gap: 1.5,
  p: 1.5,
};

const rowHeaderGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "minmax(220px, 1.35fr) repeat(3, minmax(118px, 0.75fr)) 96px",
  },
  gap: 1,
  alignItems: "stretch",
  width: "100%",
};

const roleCellSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  bgcolor: "var(--section-background)",
  display: "grid",
  minHeight: 72,
  minWidth: 0,
  p: 1.25,
};

const roleTitleSx = {
  color: "#005883",
  fontWeight: 700,
  overflowWrap: "anywhere",
};

const roleMetaSx = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const openCellSx = {
  alignItems: "center",
  bgcolor: "#005883",
  borderRadius: 1,
  color: "primary.contrastText",
  display: "flex",
  fontWeight: 700,
  justifyContent: "center",
  minHeight: 72,
  px: 1.5,
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
  border: "1px solid var(--color-border)",
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

const optionalAccordionSx = {
  ...detailGroupSx,
  boxShadow: "none",
  overflow: "hidden",
  p: 0,
  "&:before": {
    display: "none",
  },
};

const optionalSummarySx = {
  minHeight: 52,
  px: 1.5,
  "& .MuiAccordionSummary-content": {
    my: 1,
    minWidth: 0,
  },
};

const optionalHeaderSx = {
  alignItems: "center",
  display: "grid",
  gap: 1,
  gridTemplateColumns: "minmax(0, 1fr) auto",
  width: "100%",
};

const optionalTitleSx = {
  color: "#005883",
  fontWeight: 700,
};

const smallOpenCellSx = {
  border: "1px solid #005883",
  borderRadius: 1,
  color: "#005883",
  fontWeight: 700,
  px: 1,
  py: 0.5,
};

const optionalDetailsSx = {
  borderTop: "1px solid var(--color-border)",
  p: 1.5,
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
