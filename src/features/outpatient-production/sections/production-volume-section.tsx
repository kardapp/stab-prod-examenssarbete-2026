"use client";

import type { ChangeEvent } from "react";
import { Stack } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { FormattedNumberTextField } from "@/shared/components/formatted-number-text-field";
import { SectionCard } from "@/shared/components/section-card";
import { ValidationMessage } from "../components/validation-message";

type ProductionVolumeSectionProps = {
  careEvents: number;
  validationMessage?: string;
  onCareEventsChange: (careEvents: number) => void;
};

export function ProductionVolumeSection(props: ProductionVolumeSectionProps) {
  function handleCareEventsChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    props.onCareEventsChange(Number(event.target.value));
  }

  return (
    <SectionCard>
      <FormSection
        overline="Steg 2"
        title="Antal vårdhändelser"
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <FormattedNumberTextField
          label="Antal vårdhändelser per år"
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
