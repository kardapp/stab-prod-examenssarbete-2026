"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Alert, Box, CircularProgress, Paper, Stack } from "@mui/material";
import {
  calculateProductionPresence,
  sumPercentages,
  toNumber,
} from "@/lib/calculations/outpatientDimensioningCalculations";
import type { OutpatientProductionRow } from "@/types/production";
import { DimensioningBackNavigation } from "./DimensioningBackNavigation";
import { DimensioningComparisonPanel } from "./DimensioningComparisonPanel";
import { DimensioningTimeInputPanel } from "./DimensioningTimeInputPanel";
import {
  initialAssumptions,
  initialCompetenceLevels,
} from "./dimensioningConfig";
import type {
  AssumptionState,
  CompetenceLevel,
  CompetenceState,
} from "./dimensioningTypes";
import { isDayCareRow, sumVisitMinutes } from "./dimensioningUtils";

export function OutpatientMeDimensioningView() {
  const [rows, setRows] = useState<OutpatientProductionRow[]>([]);
  const [assumptions, setAssumptions] =
    useState<AssumptionState>(initialAssumptions);
  const [competenceLevels, setCompetenceLevels] = useState<CompetenceState[]>(
    initialCompetenceLevels
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchProductionRows() {
      try {
        const response = await fetch("/api/outpatient-production-rows");

        if (!response.ok) {
          throw new Error("Kunde inte hämta produktionsunderlag.");
        }

        const data = (await response.json()) as OutpatientProductionRow[];
        setRows(data);
      } catch {
        setErrorMessage("Något gick fel vid hämtning av produktionsunderlag.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProductionRows();
  }, []);

  function handleAssumptionChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    setAssumptions((current) => ({ ...current, [name]: value }));
  }

  function handleCompetenceChange(level: CompetenceLevel, value: string) {
    setCompetenceLevels((current) =>
      current.map((item) =>
        item.level === level ? { ...item, percentage: value } : item
      )
    );
  }

  if (isLoading) {
    return (
      <Paper sx={panelSx}>
        <CircularProgress />
      </Paper>
    );
  }

  if (errorMessage) {
    return <Alert severity="error">{errorMessage}</Alert>;
  }

  const dimensioningValues = calculateDimensioningValues(
    rows,
    assumptions,
    competenceLevels
  );

  return (
    <Stack spacing={2}>
      <Box sx={mainGridSx}>
        <DimensioningTimeInputPanel
          assumptions={assumptions}
          competenceLevels={competenceLevels}
          totalVisits={dimensioningValues.currentYearPlan}
          totalVisitMinutes={dimensioningValues.totalVisitMinutes}
          productionPresence={dimensioningValues.productionPresence}
          percentageSum={dimensioningValues.competencePercentageSum}
          hasInvalidSplit={dimensioningValues.hasInvalidCompetenceSplit}
          onAssumptionChange={handleAssumptionChange}
          onCompetenceChange={handleCompetenceChange}
        />

        <DimensioningComparisonPanel
          currentYearPlan={dimensioningValues.currentYearPlan}
          r12Outcome={dimensioningValues.r12Outcome}
          previousYearOutcome={dimensioningValues.previousYearOutcome}
          previousDimensioningPresence={
            dimensioningValues.previousDimensioningPresence
          }
        />
      </Box>

      <DimensioningBackNavigation />
    </Stack>
  );
}

function calculateDimensioningValues(
  rows: OutpatientProductionRow[],
  assumptions: AssumptionState,
  competenceLevels: CompetenceState[]
) {
  const weeklyWorkingHours = toNumber(assumptions.weeklyWorkingHours);
  const manualDayCarePresence = toNumber(assumptions.manualDayCarePresence);

  const outpatientRows = rows.filter((row) => !isDayCareRow(row));
  const dayCareRows = rows.filter(isDayCareRow);
  const outpatientVisitMinutes = sumVisitMinutes(outpatientRows);
  const dayCareVisitMinutes = sumVisitMinutes(dayCareRows);
  const totalVisitMinutes = outpatientVisitMinutes + dayCareVisitMinutes;
  const currentYearPlan = rows.reduce(
    (sum, row) => sum + toNumber(row.visits),
    0
  );

  const outpatientPresence = calculateProductionPresence(
    outpatientVisitMinutes,
    weeklyWorkingHours
  );
  const dayCarePresence =
    assumptions.dayCareMethod === "manual_presence"
      ? manualDayCarePresence
      : calculateProductionPresence(dayCareVisitMinutes, weeklyWorkingHours);
  const productionPresence = outpatientPresence + dayCarePresence;

  const r12Outcome = rows.reduce(
    (sum, row) => sum + toNumber(row.r12_outcome),
    0
  );
  const previousYearOutcome = rows.reduce(
    (sum, row) => sum + toNumber(row.previous_year_outcome),
    0
  );
  const previousDimensioningPresence = rows.reduce(
    (sum, row) => sum + toNumber(row.previous_dimensioning_presence),
    0
  );
  const competencePercentageSum = sumPercentages(
    competenceLevels.map((item) => toNumber(item.percentage))
  );

  return {
    totalVisitMinutes,
    currentYearPlan,
    productionPresence,
    r12Outcome,
    previousYearOutcome,
    previousDimensioningPresence,
    competencePercentageSum,
    hasInvalidCompetenceSplit: competencePercentageSum !== 100,
  };
}

const panelSx = {
  p: 2,
  border: "1px solid #d0d7de",
  borderRadius: 1,
  boxShadow: "none",
};

const mainGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2fr) minmax(280px, 1fr)" },
  gap: 2,
  alignItems: "start",
};
