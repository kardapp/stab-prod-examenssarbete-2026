"use client";

import type { ReactNode } from "react";
import {
  Alert,
  Box,
  MenuItem,
  Stack,
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
  dayCareMethodOptions,
  periodizationTypeOptions,
} from "../constants/outpatient-dimensioning-options";
import type {
  CareType,
  CompetenceLevel,
  DimensioningRowCalculation,
  DimensioningRowField,
} from "../types/outpatient-dimensioning.types";

type DimensioningCompetenceLevelsProps = {
  calculations: DimensioningRowCalculation[];
  careType: CareType;
  productionShareSum: number;
  isLoading: boolean;
  onRowChange: (
    competenceLevel: CompetenceLevel,
    field: DimensioningRowField,
    value: string
  ) => void;
};

export function DimensioningCompetenceLevels(
  props: DimensioningCompetenceLevelsProps
) {
  const isDayCare = props.careType === "dagvard";
  const hasInvalidShare =
    props.calculations.length > 0 &&
    Math.round(props.productionShareSum) !== 100;

  return (
    <Stack spacing={2}>
      <SectionCard>
        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{ justifyContent: "space-between", gap: 1.5 }}
        >
          <FormSection
            overline="Steg 2"
            title="Produktionsdrivet behov"
          />
          <Box sx={shareSumSx(hasInvalidShare)}>
            <Typography variant="caption" color="text.secondary">
              Summa produktionsandel
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>
              {formatOneDecimal(props.productionShareSum)} %
            </Typography>
          </Box>
        </Stack>

        {hasInvalidShare ? (
          <Alert severity="warning" sx={{ mb: 1.5 }}>
            Produktionsandelen bör summera till 100 % för att hela underlaget
            ska dimensioneras exakt en gång.
          </Alert>
        ) : null}

        {props.isLoading ? (
          <Alert severity="info" sx={{ mb: 1.5 }}>
            Hämtar sparade dimensioneringsvärden.
          </Alert>
        ) : null}

        <Box sx={needTableSx}>
          <Box sx={needHeaderRowSx}>
            <HeaderCell>Kompetensnivå</HeaderCell>
            <HeaderCell>Vårdtyp</HeaderCell>
            <HeaderCell align="right">Andel %</HeaderCell>
            <HeaderCell align="right">Vårdhändelser från plan</HeaderCell>
            <HeaderCell align="right">Snitt-tid</HeaderCell>
            <HeaderCell align="right">Veckoarbetstid</HeaderCell>
            <HeaderCell align="right">Beräknad närvaro</HeaderCell>
            <HeaderCell align="right">Manuell närvaro</HeaderCell>
            <HeaderCell align="right">Produktionsnärvaro</HeaderCell>
          </Box>

          {props.calculations.map((calculation) => {
            const row = calculation.row;

            return (
              <Box key={row.competenceLevel} sx={needRowSx}>
                <ReadOnlyValue
                  label="Kompetensnivå"
                  value={row.competenceLevel}
                  strong
                />
                <ReadOnlyValue
                  label="Vårdtyp"
                  value={props.careType === "dagvard" ? "Dagvård" : "Mottagning"}
                />
                <InputValue label="Andel %" align="right">
                  <NumberField
                    value={row.productionSharePercentage}
                    onChange={(value) =>
                      props.onRowChange(
                        row.competenceLevel,
                        "productionSharePercentage",
                        value
                      )
                    }
                  />
                </InputValue>
                <ReadOnlyValue
                  label="Vårdhändelser från plan"
                  value={formatWholeNumber(calculation.visitsFromProductionPlan)}
                  align="right"
                  muted
                />
                <ReadOnlyValue
                  label="Snitt-tid"
                  value={`${formatTwoDecimals(
                    calculation.averageMinutesPerVisit
                  )} min`}
                  align="right"
                  muted
                />
                <InputValue label="Veckoarbetstid" align="right">
                  <NumberField
                    value={row.weeklyWorkHours}
                    onChange={(value) =>
                      props.onRowChange(
                        row.competenceLevel,
                        "weeklyWorkHours",
                        value
                      )
                    }
                  />
                </InputValue>
                <ReadOnlyValue
                  label="Beräknad närvaro"
                  value={formatTwoDecimals(calculation.calculatedPresence)}
                  align="right"
                  calculated
                />
                <InputValue label="Manuell närvaro" align="right">
                  <NumberField
                    value={row.manualPresence}
                    onChange={(value) =>
                      props.onRowChange(
                        row.competenceLevel,
                        "manualPresence",
                        value
                      )
                    }
                  />
                </InputValue>
                <ReadOnlyValue
                  label="Produktionsnärvaro"
                  value={formatTwoDecimals(calculation.productionPresence)}
                  align="right"
                  calculated
                />
              </Box>
            );
          })}
        </Box>

        {isDayCare ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
              Dagvårdsberäkning
            </Typography>
            <Box sx={dayCareTableSx}>
              <Box sx={dayCareHeaderRowSx}>
                <HeaderCell>Kompetensnivå</HeaderCell>
                <HeaderCell>Dagvårdsmetod</HeaderCell>
                <HeaderCell align="right">Nyckeltal</HeaderCell>
              </Box>

              {props.calculations.map((calculation) => {
                const row = calculation.row;
                const isKeyRatio =
                  row.dayCareCalculationMethod === "key_ratio";

                return (
                  <Box key={row.competenceLevel} sx={dayCareRowSx}>
                    <ReadOnlyValue
                      label="Kompetensnivå"
                      value={row.competenceLevel}
                      strong
                    />
                    <InputValue label="Dagvårdsmetod">
                      <TextField
                        select
                        size="small"
                        value={row.dayCareCalculationMethod}
                        onChange={(event) =>
                          props.onRowChange(
                            row.competenceLevel,
                            "dayCareCalculationMethod",
                            event.target.value
                          )
                        }
                        sx={compactFieldSx}
                      >
                        {dayCareMethodOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </InputValue>
                    <InputValue label="Nyckeltal" align="right">
                      <NumberField
                        value={row.keyRatio}
                        disabled={!isKeyRatio}
                        onChange={(value) =>
                          props.onRowChange(
                            row.competenceLevel,
                            "keyRatio",
                            value
                          )
                        }
                      />
                    </InputValue>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : null}
      </SectionCard>

      <SectionCard>
        <FormSection
          overline="Steg 3"
          title="Justeringar och kostnader"
        />

        <Box sx={costTableSx}>
          <Box sx={costHeaderRowSx}>
            <HeaderCell>Kompetensnivå</HeaderCell>
            <HeaderCell align="right">Admin/övrigt</HeaderCell>
            <HeaderCell align="right">ST ej bidrar</HeaderCell>
            <HeaderCell align="right">Total närvaro</HeaderCell>
            <HeaderCell align="right">Lönekostnad/närvaro</HeaderCell>
            <HeaderCell align="right">Bemanningskostnad</HeaderCell>
            <HeaderCell>År</HeaderCell>
            <HeaderCell>Kommentar</HeaderCell>
          </Box>

          {props.calculations.map((calculation) => {
            const row = calculation.row;

            return (
              <Box key={row.competenceLevel} sx={costRowSx}>
                <ReadOnlyValue
                  label="Kompetensnivå"
                  value={row.competenceLevel}
                  strong
                />
                <InputValue label="Admin/övrigt" align="right">
                  <NumberField
                    value={row.adminOtherPresence}
                    onChange={(value) =>
                      props.onRowChange(
                        row.competenceLevel,
                        "adminOtherPresence",
                        value
                      )
                    }
                  />
                </InputValue>
                {canEditNonContributingSt(row.competenceLevel) ? (
                  <InputValue label="ST ej bidrar" align="right">
                    <NumberField
                      value={row.nonContributingStPresence}
                      onChange={(value) =>
                        props.onRowChange(
                          row.competenceLevel,
                          "nonContributingStPresence",
                          value
                        )
                      }
                    />
                  </InputValue>
                ) : (
                  <ReadOnlyValue
                    label="ST ej bidrar"
                    value="-"
                    align="right"
                    muted
                  />
                )}
                <ReadOnlyValue
                  label="Total närvaro"
                  value={formatTwoDecimals(calculation.totalPresence)}
                  align="right"
                  calculated
                />
                <InputValue label="Lönekostnad/närvaro" align="right">
                  <NumberField
                    value={row.salaryCostPerPresence}
                    onChange={(value) =>
                      props.onRowChange(
                        row.competenceLevel,
                        "salaryCostPerPresence",
                        value
                      )
                    }
                  />
                </InputValue>
                <ReadOnlyValue
                  label="Bemanningskostnad"
                  value={formatCurrency(calculation.staffingCost)}
                  align="right"
                  calculated
                />
                <InputValue label="År">
                  <TextField
                    select
                    size="small"
                    value={row.periodizationType}
                    onChange={(event) =>
                      props.onRowChange(
                        row.competenceLevel,
                        "periodizationType",
                        event.target.value
                      )
                    }
                    sx={compactFieldSx}
                  >
                    {periodizationTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </InputValue>
                <InputValue label="Kommentar">
                  <TextField
                    size="small"
                    value={row.comment}
                    onChange={(event) =>
                      props.onRowChange(
                        row.competenceLevel,
                        "comment",
                        event.target.value
                      )
                    }
                    sx={compactFieldSx}
                  />
                </InputValue>
              </Box>
            );
          })}
        </Box>

      </SectionCard>
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
        ...headerCellSx,
        textAlign: props.align ?? "left",
      }}
    >
      {props.children}
    </Typography>
  );
}

function ReadOnlyValue(props: {
  label: string;
  value: string;
  align?: "left" | "right";
  strong?: boolean;
  muted?: boolean;
  calculated?: boolean;
}) {
  return (
    <Box sx={valueCellSx(props.align, props.muted)}>
      <MobileLabel>{props.label}</MobileLabel>
      <Typography
        sx={{
          color: props.calculated ? "#005883" : "text.primary",
          fontWeight: props.strong || props.calculated ? 700 : 400,
          overflowWrap: "anywhere",
        }}
      >
        {props.value}
      </Typography>
    </Box>
  );
}

function InputValue(props: {
  label: string;
  align?: "left" | "right";
  children: ReactNode;
}) {
  return (
    <Box sx={valueCellSx(props.align)}>
      <MobileLabel>{props.label}</MobileLabel>
      {props.children}
    </Box>
  );
}

function MobileLabel(props: { children: string }) {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: { xs: "block", lg: "none" }, mb: 0.25 }}
    >
      {props.children}
    </Typography>
  );
}

function NumberField(props: {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <TextField
      type="number"
      size="small"
      value={props.value}
      disabled={props.disabled}
      onChange={(event) => props.onChange(event.target.value)}
      sx={compactFieldSx}
    />
  );
}

function formatCurrency(value: number): string {
  return `${formatWholeNumber(value)} kr`;
}

function canEditNonContributingSt(competenceLevel: CompetenceLevel): boolean {
  return competenceLevel === "ST/LEG";
}

function shareSumSx(hasError: boolean) {
  return {
    border: "1px solid",
    borderColor: hasError ? "warning.main" : "var(--color-border)",
    borderRadius: 1,
    px: 1.5,
    py: 1,
    minWidth: 170,
    alignSelf: { xs: "flex-start", md: "center" },
    bgcolor: "var(--section-background)",
  };
}

function valueCellSx(align: "left" | "right" = "left", muted = false) {
  return {
    minWidth: 0,
    textAlign: { xs: "left", lg: align },
    bgcolor: muted ? "var(--section-background)" : "transparent",
    borderRadius: 1,
    px: muted ? 1 : 0,
    py: muted ? 0.75 : 0,
  };
}

const needTableSx = {
  display: "grid",
  gap: 0.75,
};

const needRowSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    lg: "minmax(78px, 0.8fr) minmax(92px, 0.9fr) minmax(72px, 0.75fr) minmax(96px, 0.95fr) minmax(86px, 0.85fr) minmax(96px, 0.95fr) minmax(96px, 0.95fr) minmax(96px, 0.95fr) minmax(106px, 1fr)",
  },
  gap: 1,
  alignItems: "center",
  borderTop: "1px solid var(--color-border)",
  pt: 1,
};

const needHeaderRowSx = {
  ...needRowSx,
  display: { xs: "none", lg: "grid" },
  borderTop: "none",
  pt: 0,
};

const dayCareTableSx = {
  display: "grid",
  gap: 0.75,
};

const dayCareRowSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    lg: "minmax(78px, 0.8fr) minmax(160px, 1.4fr) minmax(100px, 1fr)",
  },
  gap: 1,
  alignItems: "center",
  borderTop: "1px solid var(--color-border)",
  pt: 1,
};

const dayCareHeaderRowSx = {
  ...dayCareRowSx,
  display: { xs: "none", lg: "grid" },
  borderTop: "none",
  pt: 0,
};

const costTableSx = {
  display: "grid",
  gap: 0.75,
};

const costRowSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    lg: "minmax(78px, 0.8fr) minmax(90px, 0.9fr) minmax(90px, 0.9fr) minmax(96px, 0.95fr) minmax(116px, 1.1fr) minmax(118px, 1.1fr) minmax(112px, 1fr) minmax(130px, 1.2fr)",
  },
  gap: 1,
  alignItems: "center",
  borderTop: "1px solid var(--color-border)",
  pt: 1,
};

const costHeaderRowSx = {
  ...costRowSx,
  display: { xs: "none", lg: "grid" },
  borderTop: "none",
  pt: 0,
};

const headerCellSx = {
  color: "#005883",
  fontWeight: 700,
  minWidth: 0,
};

const compactFieldSx = {
  width: "100%",
  minWidth: 0,
  "& .MuiInputBase-root": {
    minWidth: 0,
  },
  "& input": {
    minWidth: 0,
  },
};
