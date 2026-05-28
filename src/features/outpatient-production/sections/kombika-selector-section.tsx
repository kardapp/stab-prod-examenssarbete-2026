"use client";

import type { ChangeEvent } from "react";
import { Box, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import { kombikaOptions } from "../constants/outpatient-production-options";
import { ValidationMessage } from "../components/validation-message";
import type { KombikaOption } from "../types/outpatient-production.types";

type KombikaSelectorSectionProps = {
  selectedKombikaId: string;
  selectedKombika: KombikaOption | null;
  validationMessage?: string;
  onKombikaChange: (selectedKombikaId: string) => void;
};

export function KombikaSelectorSection(props: KombikaSelectorSectionProps) {
  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    props.onKombikaChange(event.target.value);
  }

  return (
    <SectionCard>
      <FormSection
        overline="Steg 1"
        title="Välj ekonomisk kombika"
        description="Vald ekonomisk kombika styr vilken produktionsplan som fylls i och sparas."
      />

      <Stack spacing={2}>
        <TextField
          select
          label="Ekonomisk kombika"
          value={props.selectedKombikaId}
          onChange={handleChange}
          size="small"
          sx={{ maxWidth: 420 }}
        >
          <MenuItem value="">Välj kombika</MenuItem>
          {kombikaOptions.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.code} – {option.name}
            </MenuItem>
          ))}
        </TextField>

        {props.selectedKombika ? (
          <Box sx={selectedKombikaSx}>
            <Typography variant="body2" color="text.secondary">
              Du planerar just nu för:
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>
              {props.selectedKombika.code} – {props.selectedKombika.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {props.selectedKombika.section} ·{" "}
              {props.selectedKombika.costCenter} · {props.selectedKombika.site}
            </Typography>
          </Box>
        ) : null}

        <ValidationMessage message={props.validationMessage} />
      </Stack>
    </SectionCard>
  );
}

const selectedKombikaSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  p: 1.5,
  bgcolor: "var(--section-background)",
};
