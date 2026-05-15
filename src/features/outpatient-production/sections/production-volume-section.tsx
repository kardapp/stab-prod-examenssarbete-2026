"use client";

import type { ChangeEvent } from "react";
import { Stack, TextField } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import { ValidationMessage } from "../components/validation-message";

type ProductionVolumeSectionProps = {
  date: string;
  careEvents: number;
  validationMessage?: string;
  onDateChange: (date: string) => void;
  onCareEventsChange: (careEvents: number) => void;
};

export function ProductionVolumeSection(props: ProductionVolumeSectionProps) {
  // function handleDateChange(
  //   event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  // ) {
  //   props.onDateChange(event.target.value);
  // } kan behövas vid ett senare tillfälle

  function handleCareEventsChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    props.onCareEventsChange(Number(event.target.value));
  }

  return (
    <SectionCard>
      <FormSection
        overline="Steg 2"
        title="Antal vårdtillfällen"
        description="Antal vårdtillfällen är huvudvolymen för vald kombika och dag."
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        {/* <TextField
          label="Dag/datum"
          type="date"
          value={props.date}
          onChange={handleDateChange}
          size="small"
          sx={{ width: { xs: "100%", sm: 220 } }}
          slotProps={{ inputLabel: { shrink: true } }}
        /> */}
        <TextField
          label="Antal vårdtillfällen"
          type="number"
          value={props.careEvents}
          onChange={handleCareEventsChange}
          size="small"
          sx={{ width: { xs: "100%", sm: 220 } }}
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
