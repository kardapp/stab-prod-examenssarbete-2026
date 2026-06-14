"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { PageHeader } from "@/shared/components/page-header";
import { PlanningMetricCard } from "@/shared/components/planning-metric-card";
import { SectionCard } from "@/shared/components/section-card";
import { appRoutes } from "@/shared/routes";
import { formatOneDecimal } from "@/shared/utils/format-number";
import {
  CURRENT_INPATIENT_PRODUCTION_PLAN_ID,
  inpatientKombikaOptions,
  inpatientProductionHistoryByKombikaId,
  initialInpatientProductionFormState,
} from "../constants/inpatient-options";
import type { InpatientProductionFormState } from "../types/inpatient.types";
import {
  calculateInpatientProductionValues,
  toNumber,
} from "../utils/inpatient-calculations";
import { saveCurrentInpatientProductionRow } from "../utils/current-inpatient-session";
import { InpatientProductionHistorySection } from "../sections/inpatient-production-history-section";

type NumberField = Exclude<
  keyof InpatientProductionFormState,
  "selectedKombikaId"
>;

export function InpatientProductionView() {
  const [formState, setFormState] = useState(
    initialInpatientProductionFormState
  );
  const [saveMessage, setSaveMessage] = useState("");
  const [saveSeverity, setSaveSeverity] = useState<"success" | "error">(
    "success"
  );
  const [isSaved, setIsSaved] = useState(false);
  const selectedKombika = useMemo(
    () =>
      inpatientKombikaOptions.find(
        (option) => option.id === formState.selectedKombikaId
      ) ?? null,
    [formState.selectedKombikaId]
  );
  const calculatedValues = useMemo(
    () => calculateInpatientProductionValues(formState),
    [formState]
  );
  const productionHistory = useMemo(
    () =>
      selectedKombika
        ? inpatientProductionHistoryByKombikaId[selectedKombika.id] ?? []
        : [],
    [selectedKombika]
  );
  const latestHistoryRow = productionHistory.at(-1) ?? null;
  const validationMessage = getValidationMessage(formState);
  const canContinue = Boolean(selectedKombika && !validationMessage && isSaved);

  function updateFormState(
    changes: Partial<InpatientProductionFormState>
  ) {
    setSaveMessage("");
    setIsSaved(false);
    setFormState((current) => ({ ...current, ...changes }));
  }

  function handleNumberChange(field: NumberField, value: string) {
    updateFormState({ [field]: Number(value) } as Partial<
      InpatientProductionFormState
    >);
  }

  function saveProductionPlan() {
    if (!selectedKombika || validationMessage) {
      setSaveSeverity("error");
      setIsSaved(false);
      setSaveMessage(validationMessage || "Välj ekonomisk kombika.");
      return;
    }

    saveCurrentInpatientProductionRow({
      id: `${selectedKombika.id}-${CURRENT_INPATIENT_PRODUCTION_PLAN_ID}`,
      planId: CURRENT_INPATIENT_PRODUCTION_PLAN_ID,
      careArea: "inpatient",
      kombikaId: selectedKombika.id,
      economicKombika: `${selectedKombika.code} - ${selectedKombika.name}`,
      section: selectedKombika.section,
      costCenter: selectedKombika.costCenter,
      site: selectedKombika.site,
      careType:
        formState.acutePercentage >= formState.electivePercentage
          ? "acute"
          : "elective",
      payerType: formState.sllPercentage >= formState.uulpPercentage
        ? "SLL"
        : "UULP",
      plannedCareEvents: formState.careEvents,
      drgAverage: calculatedValues.weightedDrgAverage,
      sllDrgAverage: formState.sllDrgAverage,
      uulpDrgAverage: formState.uulpDrgAverage,
      careEvents: formState.careEvents,
      acutePercentage: formState.acutePercentage,
      electivePercentage: formState.electivePercentage,
      sllPercentage: formState.sllPercentage,
      uulpPercentage: formState.uulpPercentage,
      averageLengthOfStay: formState.averageLengthOfStay,
      careDays: calculatedValues.careDays,
      averageCarePlaces: calculatedValues.averageCarePlaces,
      drgPoints: calculatedValues.drgPoints,
      sllDrgPoints: calculatedValues.sllDrgPoints,
      uulpDrgPoints: calculatedValues.uulpDrgPoints,
      previousYearPlan: latestHistoryRow?.plannedCareEvents ?? 0,
      r12Outcome: latestHistoryRow?.r12CareEvents ?? 0,
      previousYearOutcome: latestHistoryRow?.previousYearOutcome ?? 0,
      savedAt: new Date().toISOString(),
    });
    setSaveSeverity("success");
    setIsSaved(true);
    setSaveMessage("Produktionsplan slutenvård sparad.");
  }

  return (
    <Box component="main" sx={pageSx}>
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <PageHeader
            overline="Produktionsplanering slutenvård"
            title="Inmatning produktion per ekonomisk kombika"
          />

          <SectionCard>
            <FormSection
              overline="Steg 1"
              title="Välj ekonomisk kombika"
            />
            <Stack spacing={2}>
              <TextField
                select
                label="Ekonomisk kombika"
                size="small"
                value={formState.selectedKombikaId}
                onChange={(event) =>
                  updateFormState({ selectedKombikaId: event.target.value })
                }
                sx={{ maxWidth: 420 }}
              >
                <MenuItem value="">Välj kombika</MenuItem>
                {inpatientKombikaOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.code} - {option.name}
                  </MenuItem>
                ))}
              </TextField>

              {selectedKombika ? (
                <Box sx={selectedKombikaSx}>
                  <Typography variant="body2" color="text.secondary">
                    Du planerar just nu för:
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {selectedKombika.code} - {selectedKombika.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedKombika.section} · {selectedKombika.costCenter} ·{" "}
                    {selectedKombika.site}
                  </Typography>
                </Box>
              ) : null}
            </Stack>
          </SectionCard>

          {selectedKombika ? (
            <>
              <SectionCard>
                <FormSection
                  overline="Steg 2"
                  title="Produktionsunderlag"
                />
                <Box sx={inputGridSx}>
                  <TextField
                    label="Antal vårdtillfällen"
                    type="number"
                    size="small"
                    value={formState.careEvents}
                    onChange={(event) =>
                      handleNumberChange("careEvents", event.target.value)
                    }
                    fullWidth
                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                  />
                  <PlanningMetricCard
                    label="Per dag"
                    value={formatOneDecimal(calculatedValues.careEventsPerDay)}
                  />
                </Box>
              </SectionCard>

              <SectionCard>
                <FormSection
                  overline="Steg 3"
                  title="Fördelningar"
                />
                <Box sx={pairGridSx}>
                  <PercentageGroup
                    title="Fördelning 1: akut/elektivt"
                    sum={
                      formState.acutePercentage + formState.electivePercentage
                    }
                    rows={[
                      {
                        label: "Akut",
                        value: formState.acutePercentage,
                        calculatedValue: calculatedValues.acuteCareEvents,
                        onChange: (value) =>
                          handleNumberChange("acutePercentage", value),
                      },
                      {
                        label: "Elektivt",
                        value: formState.electivePercentage,
                        calculatedValue: calculatedValues.electiveCareEvents,
                        onChange: (value) =>
                          handleNumberChange("electivePercentage", value),
                      },
                    ]}
                  />
                  <PercentageGroup
                    title="Fördelning 2: SLL/UULP"
                    sum={formState.sllPercentage + formState.uulpPercentage}
                    rows={[
                      {
                        label: "SLL",
                        value: formState.sllPercentage,
                        calculatedValue: calculatedValues.sllCareEvents,
                        onChange: (value) =>
                          handleNumberChange("sllPercentage", value),
                      },
                      {
                        label: "UULP",
                        value: formState.uulpPercentage,
                        calculatedValue: calculatedValues.uulpCareEvents,
                        onChange: (value) =>
                          handleNumberChange("uulpPercentage", value),
                      },
                    ]}
                  />
                </Box>
              </SectionCard>

              <SectionCard>
                <FormSection
                  overline="Steg 4"
                  title="Vårdtid och DRG-underlag"
                  description="Ange de värden som beskriver vårdtid och vårdtyngd för den planerade slutenvårdsproduktionen."
                />
                <Stack spacing={2}>
                  <Box sx={inputGridSx}>
                    <TextField
                      label="Medelvårdtid (dygn)"
                      helperText="Genomsnittligt antal vårddygn per vårdtillfälle. Används för att beräkna vårddygn och vårdplatser."
                      type="number"
                      size="small"
                      value={formState.averageLengthOfStay}
                      onChange={(event) =>
                        handleNumberChange(
                          "averageLengthOfStay",
                          event.target.value
                        )
                      }
                      fullWidth
                      slotProps={{ htmlInput: { min: 0, step: 0.1 } }}
                    />
                    <TextField
                      label="DRG-snitt SLL"
                      helperText="Genomsnittlig DRG-vikt för SLL-finansierade vårdtillfällen."
                      type="number"
                      size="small"
                      value={formState.sllDrgAverage}
                      onChange={(event) =>
                        handleNumberChange("sllDrgAverage", event.target.value)
                      }
                      fullWidth
                      slotProps={{ htmlInput: { min: 0, step: 0.1 } }}
                    />
                    <TextField
                      label="DRG-snitt UULP"
                      helperText="Genomsnittlig DRG-vikt för UULP-finansierade vårdtillfällen."
                      type="number"
                      size="small"
                      value={formState.uulpDrgAverage}
                      onChange={(event) =>
                        handleNumberChange("uulpDrgAverage", event.target.value)
                      }
                      fullWidth
                      slotProps={{ htmlInput: { min: 0, step: 0.1 } }}
                    />
                  </Box>

                  <Box sx={planningBasisGridSx}>
                    <PlanningMetricCard
                      label="Beräknade vårddygn"
                      value={formatOneDecimal(calculatedValues.careDays)}
                    />
                    <PlanningMetricCard
                      label="Genomsnittliga vårdplatser"
                      value={formatOneDecimal(
                        calculatedValues.averageCarePlaces
                      )}
                    />
                    <PlanningMetricCard
                      label="DRG-poäng totalt"
                      value={formatOneDecimal(calculatedValues.drgPoints)}
                    />
                  </Box>
                </Stack>
              </SectionCard>

              <InpatientProductionHistorySection
                historyRows={productionHistory}
                selectedKombika={selectedKombika}
              />

              <SectionCard tone="action">
                <Stack spacing={2}>
                  {saveMessage ? (
                    <Alert severity={saveSeverity}>{saveMessage}</Alert>
                  ) : null}
                  {validationMessage ? (
                    <Alert severity="warning">{validationMessage}</Alert>
                  ) : null}
                  {selectedKombika && !validationMessage && !isSaved ? (
                    <Alert severity="warning">
                      Spara produktionsplanen innan du går vidare. Annars
                      används den senast sparade planen i nästa steg.
                    </Alert>
                  ) : null}
                  <Box sx={actionRowSx}>
                    <Button variant="contained" onClick={saveProductionPlan}>
                      Spara produktionsplan
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={!canContinue}
                      href={
                        canContinue
                          ? appRoutes.inpatientOoDistribution
                          : undefined
                      }
                    >
                      Fördela vårddygn till OO
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={!canContinue}
                      href={
                        canContinue ? appRoutes.inpatientDimensioning : undefined
                      }
                    >
                      Gå till dimensionering ME
                    </Button>
                  </Box>
                </Stack>
              </SectionCard>
            </>
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}

function PercentageGroup(props: {
  rows: Array<{
    calculatedValue: number;
    label: string;
    onChange: (value: string) => void;
    value: number;
  }>;
  sum: number;
  title: string;
}) {
  return (
    <Box sx={subSectionSx}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{ justifyContent: "space-between", gap: 1, mb: 1.5 }}
      >
        <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700 }}>
          {props.title}
        </Typography>
        <Typography sx={{ color: "primary.main", fontWeight: 700 }}>
          Summa {formatOneDecimal(props.sum)} %
        </Typography>
      </Stack>
      <Stack spacing={1.5}>
        {props.rows.map((row) => (
          <Box key={row.label} sx={percentageRowSx}>
            <Typography sx={{ fontWeight: 600 }}>{row.label}</Typography>
            <TextField
              label="Andel"
              type="number"
              size="small"
              value={row.value}
              onChange={(event) => row.onChange(event.target.value)}
              slotProps={{ htmlInput: { min: 0, max: 100, step: 1 } }}
              fullWidth
            />
            <Typography
              variant="body2"
              sx={{ color: "primary.main", textAlign: { sm: "right" } }}
            >
              {formatOneDecimal(row.calculatedValue)} vårdtillfällen
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function getValidationMessage(formState: InpatientProductionFormState): string {
  if (!formState.selectedKombikaId) {
    return "Välj ekonomisk kombika.";
  }

  if (toNumber(formState.careEvents) <= 0) {
    return "Antal vårdtillfällen måste vara större än 0.";
  }

  if (toNumber(formState.averageLengthOfStay) <= 0) {
    return "Medelvårdtid måste vara större än 0.";
  }

  if (toNumber(formState.sllDrgAverage) <= 0) {
    return "DRG-snitt SLL måste vara större än 0.";
  }

  if (toNumber(formState.uulpDrgAverage) <= 0) {
    return "DRG-snitt UULP måste vara större än 0.";
  }

  if (formState.acutePercentage + formState.electivePercentage !== 100) {
    return "Akut och elektivt måste summera till 100%.";
  }

  if (formState.sllPercentage + formState.uulpPercentage !== 100) {
    return "SLL och UULP måste summera till 100%.";
  }

  return "";
}

const pageSx = {
  bgcolor: "var(--page-background)",
  minHeight: "100vh",
  p: 2,
};

const selectedKombikaSx = {
  bgcolor: "var(--section-background)",
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  p: 1.5,
};

const inputGridSx = {
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(3, minmax(0, 1fr))",
  },
};

const planningBasisGridSx = {
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(3, minmax(0, 1fr))",
  },
};

const pairGridSx = {
  display: "grid",
  gap: { xs: 2, md: 2.5 },
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
  },
};

const subSectionSx = {
  bgcolor: "background.default",
  borderBottom: "1px solid",
  borderBottomColor: "divider",
  borderLeft: "4px solid",
  borderLeftColor: "primary.main",
  borderRadius: 1,
  borderRight: "1px solid",
  borderRightColor: "divider",
  p: 1.5,
};

const percentageRowSx = {
  alignItems: { sm: "center" },
  display: "grid",
  gap: 1,
  gridTemplateColumns: {
    xs: "1fr",
    sm: "minmax(90px, 1fr) minmax(120px, 0.7fr) minmax(140px, 1fr)",
  },
};

const actionRowSx = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1.5,
};
