"use client";

import { useMemo, useState } from "react";
import { Alert, Box } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import {
  buildWeeklyCurve,
  calculateAnnualCurveSummary,
  clampWeek,
  impactTypeOptions,
  initialImpactDraft,
  parseImpactType,
  type WeekdayKey,
  type WeeklyCurveSourceRow,
  type WeeklyImpact,
  type WeeklyImpactDraft,
} from "./periodization-curve/periodization-curve-model";
import { PeriodizationSummaryCards } from "./periodization-curve/periodization-summary-cards";
import { SelectedWeekPanel } from "./periodization-curve/selected-week-panel";
import { WeeklyBreakdownTable } from "./periodization-curve/weekly-breakdown-table";
import { WeeklyCurveChart } from "./periodization-curve/weekly-curve-chart";
import { WeeklyImpactControls } from "./periodization-curve/weekly-impact-controls";

export function PeriodizationCurveSection(props: {
  rows: WeeklyCurveSourceRow[];
  overline?: string;
  title?: string;
  description?: string;
  emptyText?: string;
  showDrg?: boolean;
}) {
  const [impacts, setImpacts] = useState<WeeklyImpact[]>([]);
  const [draft, setDraft] = useState<WeeklyImpactDraft>(initialImpactDraft);
  const [selectedWeek, setSelectedWeek] = useState(() =>
    clampWeek(Number(initialImpactDraft.startWeek))
  );
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
    curvePoints.find((point) => point.week === selectedWeek) ?? curvePoints[0];
  const maxPresence = Math.max(
    0.01,
    ...curvePoints.map((point) => point.adjustedStaffingNeed)
  );

  function handleDraftChange(
    field: Exclude<keyof WeeklyImpactDraft, "weekdays">,
    value: string
  ) {
    setValidationMessage("");
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleDraftWeekdaysChange(weekdays: WeekdayKey[]) {
    setValidationMessage("");
    setDraft((current) => ({ ...current, weekdays }));
  }

  function handleSelectWeek(week: number) {
    const nextWeek = clampWeek(week);

    setSelectedWeek(nextWeek);
    setValidationMessage("");
    setDraft((current) => ({
      ...current,
      startWeek: String(nextWeek),
      endWeek: String(nextWeek),
    }));
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
      setValidationMessage(
        "Startvecka måste vara före eller samma som slutvecka."
      );
      return;
    }

    if (draft.weekdays.length === 0) {
      setValidationMessage("Välj minst en dag som påverkas.");
      return;
    }

    const nextImpact: WeeklyImpact = {
      id: `impact-${Date.now()}`,
      type: draft.type,
      name,
      startWeek,
      endWeek,
      percentage,
      weekdays: draft.weekdays,
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
        overline={props.overline ?? "2. Periodiseringskurva"}
        title={props.title ?? "Personalbehov per vecka"}
        description={
          props.description ??
          "Årsvolymen periodiseras till 52 veckor och justeras med planerade händelser."
        }
      />

      {props.rows.length === 0 ? (
        <Alert severity="info">
          {props.emptyText ??
            "Periodiseringskurvan visas när det finns en sparad årsplan att räkna på."}
        </Alert>
      ) : (
        <>
          <PeriodizationSummaryCards
            summary={annualSummary}
            showDrg={props.showDrg}
          />

          <Box sx={curveBlockSx}>
            <WeeklyCurveChart
              curvePoints={curvePoints}
              maxPresence={maxPresence}
              selectedWeek={selectedWeek}
              onSelectWeek={handleSelectWeek}
            />
            <SelectedWeekPanel
              selectedPoint={selectedPoint}
              showDrg={props.showDrg}
            />
          </Box>

          <WeeklyBreakdownTable
            selectedPoint={selectedPoint}
            showDrg={props.showDrg}
          />

          <WeeklyImpactControls
            draft={draft}
            impacts={impacts}
            selectedWeek={selectedWeek}
            validationMessage={validationMessage}
            onAddImpact={addImpact}
            onDraftChange={handleDraftChange}
            onDraftWeekdaysChange={handleDraftWeekdaysChange}
            onRemoveImpact={removeImpact}
            onTypeChange={handleTypeChange}
          />
        </>
      )}
    </SectionCard>
  );
}

const curveBlockSx = {
  minWidth: 0,
};
