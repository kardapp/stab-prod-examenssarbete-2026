"use client";

import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import type { ProductionPlanningResultRow } from "../types/outpatient-production-results.types";
import {
  buildWeeklyCurve,
  calculateAnnualCurveSummary,
  clampWeek,
  impactTypeOptions,
  initialImpactDraft,
  parseImpactType,
  type WeeklyImpact,
  type WeeklyImpactDraft,
} from "./periodization-curve/periodization-curve-model";
import { PeriodizationSummaryCards } from "./periodization-curve/periodization-summary-cards";
import { SelectedWeekPanel } from "./periodization-curve/selected-week-panel";
import { WeeklyBreakdownTable } from "./periodization-curve/weekly-breakdown-table";
import { WeeklyCurveChart } from "./periodization-curve/weekly-curve-chart";
import { WeeklyImpactControls } from "./periodization-curve/weekly-impact-controls";

export function PeriodizationCurveSection(props: {
  rows: ProductionPlanningResultRow[];
}) {
  const [impacts, setImpacts] = useState<WeeklyImpact[]>([]);
  const [draft, setDraft] = useState<WeeklyImpactDraft>(initialImpactDraft);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [validationMessage, setValidationMessage] = useState("");
  const annualSummary = useMemo(
    () => calculateAnnualCurveSummary(props.rows),
    [props.rows]
  );
  const curvePoints = useMemo(
    () => buildWeeklyCurve(props.rows, impacts),
    [props.rows, impacts]
  );
  const selectedPoint =
    curvePoints.find((point) => point.week === selectedWeek) ??
    curvePoints[0];
  const maxPresence = Math.max(
    0.01,
    ...curvePoints.map((point) => point.adjustedStaffingNeed)
  );

  function handleDraftChange(field: keyof WeeklyImpactDraft, value: string) {
    setValidationMessage("");
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleTypeChange(value: string) {
    const nextType = parseImpactType(value);
    const option = impactTypeOptions.find((item) => item.value === nextType);

    setValidationMessage("");
    setDraft((current) => ({
      ...current,
      type: nextType,
      name: option?.defaultName ?? current.name,
      percentage: option?.defaultPercentage ?? current.percentage,
    }));
  }

  function addImpact() {
    const startWeek = clampWeek(Number(draft.startWeek));
    const endWeek = clampWeek(Number(draft.endWeek));
    const percentage = Number(draft.percentage);
    const name = draft.name.trim();

    if (!name) {
      setValidationMessage("Ange namn för påverkan.");
      return;
    }

    if (!Number.isFinite(percentage)) {
      setValidationMessage("Ange påverkan i procent.");
      return;
    }

    if (startWeek > endWeek) {
      setValidationMessage("Startvecka måste vara före eller samma som slutvecka.");
      return;
    }

    const nextImpact: WeeklyImpact = {
      id: `impact-${Date.now()}`,
      type: draft.type,
      name,
      startWeek,
      endWeek,
      percentage,
    };

    setImpacts((current) => [...current, nextImpact]);
    setSelectedWeek(startWeek);
    setValidationMessage("");
  }

  function removeImpact(impactId: string) {
    setImpacts((current) =>
      current.filter((impact) => impact.id !== impactId)
    );
  }

  return (
    <SectionCard>
      <FormSection
        overline="4. Periodiseringskurva"
        title="Personalbehov per vecka"
        description="Årsvolymen periodiseras till 52 veckor och justeras med planerade händelser."
      />

      <PeriodizationSummaryCards summary={annualSummary} />

      <Box sx={curveLayoutSx}>
        <WeeklyCurveChart
          curvePoints={curvePoints}
          maxPresence={maxPresence}
          selectedWeek={selectedWeek}
          onSelectWeek={setSelectedWeek}
        />
        <SelectedWeekPanel selectedPoint={selectedPoint} />
      </Box>

      <WeeklyBreakdownTable selectedPoint={selectedPoint} />

      <WeeklyImpactControls
        draft={draft}
        impacts={impacts}
        validationMessage={validationMessage}
        onAddImpact={addImpact}
        onDraftChange={handleDraftChange}
        onRemoveImpact={removeImpact}
        onTypeChange={handleTypeChange}
      />
    </SectionCard>
  );
}

const curveLayoutSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    xl: "minmax(0, 1fr) minmax(280px, 0.35fr)",
  },
  gap: 2,
  alignItems: "start",
};
