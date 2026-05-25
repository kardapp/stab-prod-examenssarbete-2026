"use client";

import type { ChangeEvent } from "react";
import { Stack, TextField } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import { ValidationMessage } from "../components/validation-message";
import type { DrgAverageInput } from "../types/outpatient-production.types";

type DrgAverageSectionProps = {
  drgAverage: DrgAverageInput;
  validationMessage?: string;
  onDrgAverageChange: (field: keyof DrgAverageInput, value: number) => void;
};

export function DrgAverageSection(props: DrgAverageSectionProps) {
  function handleSllChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    props.onDrgAverageChange("sll", Number(event.target.value));
  }

  function handleUulpChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    props.onDrgAverageChange("uulp", Number(event.target.value));
  }

  return (
    <SectionCard>
      <FormSection
        overline="Steg 5"
        title="DRG-snitt per SLL/UULP"
        description="DRG-snitt fylls i separat för SLL och UULP."
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="DRG-snitt SLL"
          type="number"
          value={props.drgAverage.sll}
          onChange={handleSllChange}
          size="small"
          sx={{ width: { xs: "100%", sm: 220 } }}
          slotProps={{
            htmlInput: {
              min: 0,
              step: 0.1,
            },
          }}
        />
        <TextField
          label="DRG-snitt UULP"
          type="number"
          value={props.drgAverage.uulp}
          onChange={handleUulpChange}
          size="small"
          sx={{ width: { xs: "100%", sm: 220 } }}
          slotProps={{
            htmlInput: {
              min: 0,
              step: 0.1,
            },
          }}
        />
      </Stack>

      <ValidationMessage message={props.validationMessage} />
    </SectionCard>
  );
}
