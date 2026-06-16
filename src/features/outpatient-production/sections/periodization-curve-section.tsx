"use client";

import { useMemo, useState } from "react";
import { Alert, Box, Button, Collapse, Stack, Typography } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import {
  buildWeeklyCurve,
  clampWeek,
  impactTypeOptions,
  initialImpactDraft,
  parseImpactType,
  type WeekdayKey,
  type WeeklyCurvePoint,
  type WeeklyCurveSourceRow,
  type WeeklyImpact,
  type WeeklyImpactDraft,
} from "./periodization-curve/periodization-curve-model";
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
  volumeLabel?: string;
  volumeLabelLower?: string;
}) {
  const [impacts, setImpacts] = useState<WeeklyImpact[]>([]);
  const [draft, setDraft] = useState<WeeklyImpactDraft>(initialImpactDraft);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const curvePoints = useMemo(
    () => buildWeeklyCurve(props.rows, impacts),
    [props.rows, impacts]
  );
  const selectedPoint = selectedWeek
    ? curvePoints.find((point) => point.week === selectedWeek)
    : null;
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

    setSelectedWeek((currentWeek) =>
      currentWeek === nextWeek ? null : nextWeek
    );
    setValidationMessage("");
    setDraft((current) => ({
      ...current,
      startWeek: String(nextWeek),
      endWeek: String(nextWeek),
    }));
  }

  function handleCloseWeek() {
    setSelectedWeek(null);
    setValidationMessage("");
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
    const rangeStartWeek = Math.min(startWeek, endWeek);
    const rangeEndWeek = Math.max(startWeek, endWeek);
    const percentage = Number(draft.percentage);
    const name = draft.name.trim();

    if (!name) {
      setValidationMessage("Ange namn för påverkan.");
      return;
    }

    if (!Number.isFinite(percentage)) {
      setValidationMessage("Ange ändring av produktionstakt i procent.");
      return;
    }

    if (draft.weekdays.length === 0) {
      setValidationMessage("Välj minst en dag som påverkas.");
      return;
    }

    const nextImpact: WeeklyImpact = {
      id: `impact-${Date.now()}`,
      type: draft.type,
      target: "productionRate",
      name,
      startWeek: rangeStartWeek,
      endWeek: rangeEndWeek,
      percentage,
      weekdays: draft.weekdays,
    };

    setImpacts((current) => [...current, nextImpact]);
    setSelectedWeek((currentWeek) =>
      currentWeek &&
      currentWeek >= rangeStartWeek &&
      currentWeek <= rangeEndWeek
        ? currentWeek
        : rangeStartWeek
    );
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
        description={props.description}
      />

      {props.rows.length === 0 ? (
        <Alert severity="info">
          {props.emptyText ?? "Ingen sparad årsplan att periodisera."}
        </Alert>
      ) : (
        <Stack spacing={1.5}>
          <WeeklyCurveChart
            curvePoints={curvePoints}
            maxPresence={maxPresence}
            selectedWeek={selectedWeek}
            volumeLabelLower={props.volumeLabelLower}
            onSelectWeek={handleSelectWeek}
          />

          <Collapse in={Boolean(selectedPoint)} timeout={220} unmountOnExit>
            {selectedPoint ? (
              <FocusedWeekAccordion
                draft={draft}
                impacts={selectedPoint.impacts}
                selectedPoint={selectedPoint}
                showDrg={props.showDrg}
                volumeLabel={props.volumeLabel}
                validationMessage={validationMessage}
                onAddImpact={addImpact}
                onClose={handleCloseWeek}
                onDraftChange={handleDraftChange}
                onDraftWeekdaysChange={handleDraftWeekdaysChange}
                onRemoveImpact={removeImpact}
                onTypeChange={handleTypeChange}
              />
            ) : null}
          </Collapse>
        </Stack>
      )}
    </SectionCard>
  );
}

function FocusedWeekAccordion(props: {
  draft: WeeklyImpactDraft;
  impacts: WeeklyImpact[];
  selectedPoint: WeeklyCurvePoint;
  showDrg?: boolean;
  volumeLabel?: string;
  validationMessage: string;
  onAddImpact: () => void;
  onClose: () => void;
  onDraftChange: (
    field: Exclude<keyof WeeklyImpactDraft, "weekdays">,
    value: string
  ) => void;
  onDraftWeekdaysChange: (weekdays: WeekdayKey[]) => void;
  onRemoveImpact: (impactId: string) => void;
  onTypeChange: (value: string) => void;
}) {
  return (
    <Box sx={accordionSx}>
      <Box sx={accordionHeaderSx}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={accordionOverlineSx}>
            Veckodetalj
          </Typography>
          <Typography variant="h6" sx={accordionTitleSx}>
            Vecka {props.selectedPoint.week}
          </Typography>
        </Box>
        <Button type="button" variant="outlined" onClick={props.onClose}>
          Stäng
        </Button>
      </Box>

      <Box sx={accordionContentSx}>
        <SelectedWeekPanel
          selectedPoint={props.selectedPoint}
          showDrg={props.showDrg}
          volumeLabel={props.volumeLabel}
        />

        <WeeklyImpactControls
          draft={props.draft}
          impacts={props.impacts}
          selectedWeek={props.selectedPoint.week}
          validationMessage={props.validationMessage}
          onAddImpact={props.onAddImpact}
          onDraftChange={props.onDraftChange}
          onDraftWeekdaysChange={props.onDraftWeekdaysChange}
          onRemoveImpact={props.onRemoveImpact}
          onTypeChange={props.onTypeChange}
        />
      </Box>

      <Box sx={breakdownWrapSx}>
        <WeeklyBreakdownTable
          selectedPoint={props.selectedPoint}
          showDrg={props.showDrg}
          volumeLabel={props.volumeLabel}
        />
      </Box>
    </Box>
  );
}

const accordionSx = {
  bgcolor: "var(--page-background)",
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  overflow: "hidden",
};

const accordionHeaderSx = {
  alignItems: { xs: "flex-start", sm: "center" },
  bgcolor: "background.paper",
  borderBottom: "1px solid var(--color-border)",
  display: "flex",
  gap: 1.5,
  justifyContent: "space-between",
  p: 1.5,
};

const accordionOverlineSx = {
  color: "primary.main",
  display: "block",
  fontWeight: 700,
  letterSpacing: 0,
  lineHeight: 1.2,
  textTransform: "uppercase",
};

const accordionTitleSx = {
  fontWeight: 700,
};

const accordionContentSx = {
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: {
    xs: "1fr",
    xl: "minmax(0, 1fr) minmax(360px, 0.9fr)",
  },
  p: 1.5,
};

const breakdownWrapSx = {
  px: 1.5,
  pb: 1.5,
};
