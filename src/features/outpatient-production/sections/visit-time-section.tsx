"use client";

import type { ChangeEvent } from "react";
import { MenuItem, Stack, TextField } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import { visitTypeOptions } from "../constants/outpatient-production-options";
import { ValidationMessage } from "../components/validation-message";
import type { VisitTimeInput } from "../types/outpatient-production.types";

type VisitTimeSectionProps = {
  visitTime: VisitTimeInput;
  validationMessage?: string;
  onVisitTimeChange: (
    field: keyof VisitTimeInput,
    value: string | number
  ) => void;
};

export function VisitTimeSection(props: VisitTimeSectionProps) {
  function handleVisitTypeChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    props.onVisitTimeChange("visitType", event.target.value);
  }

  function handleAverageMinutesChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    props.onVisitTimeChange("averageMinutes", Number(event.target.value));
  }

  return (
    <SectionCard>
      <FormSection
        overline="Steg 4"
        title="Snitt-tid per besök"
        description="Snitt-tid är ett eget planeringsvärde per typ av besök."
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          select
          label="Typ av besök"
          value={props.visitTime.visitType}
          onChange={handleVisitTypeChange}
          size="small"
          sx={{ width: { xs: "100%", sm: 240 } }}
        >
          {visitTypeOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Snitt-tid per besök"
          type="number"
          value={props.visitTime.averageMinutes}
          onChange={handleAverageMinutesChange}
          size="small"
          sx={{ width: { xs: "100%", sm: 240 } }}
          slotProps={{
            htmlInput: {
              min: 0,
              step: 1,
            },
          }}
        />
      </Stack>

      <ValidationMessage message={props.validationMessage} />
    </SectionCard>
  );
}
