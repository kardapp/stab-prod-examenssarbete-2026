"use client";

import type { ChangeEvent, FormEvent } from "react";
import { Box, Button, MenuItem, TextField } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import {
  kombikaOptions,
  roleCategoryOptions,
  visitTypeOptions,
} from "../constants/outpatient-production-options";
import type { OutpatientProductionFormState } from "../types/outpatient-production.types";

type OutpatientProductionFormProps = {
  formState: OutpatientProductionFormState;
  editingRowId: number | null;
  isSubmitting: boolean;
  onFieldChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onKombikaChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export function OutpatientProductionForm(props: OutpatientProductionFormProps) {
  return (
    <SectionCard>
      <FormSection
        overline="Inmatning"
        title="Lägg till produktionsrad"
        description="Fyll i planerad produktion per ekonomisk kombika."
      />

      <Box component="form" onSubmit={props.onSubmit} sx={formGridSx}>
        <TextField
          select
          label="Ekonomisk kombika"
          name="kombika_pf_id"
          value={props.formState.kombika_pf_id}
          onChange={props.onKombikaChange}
          size="small"
        >
          {kombikaOptions.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.id} - {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Dag/datum"
          name="period_value"
          type="date"
          value={props.formState.period_value}
          onChange={props.onFieldChange}
          size="small"
          required
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="Antal vårdtillfällen"
          name="visits"
          type="number"
          value={props.formState.visits}
          onChange={props.onFieldChange}
          size="small"
          required
        />

        <TextField
          select
          label="Yrkeskategori"
          name="primary_role_category"
          value={props.formState.primary_role_category}
          onChange={props.onFieldChange}
          size="small"
        >
          {roleCategoryOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Sekundär yrkeskategori"
          name="secondary_role_category"
          value={props.formState.secondary_role_category}
          onChange={props.onFieldChange}
          size="small"
        >
          <MenuItem value="">Ingen</MenuItem>
          {roleCategoryOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="SLL/UULP"
          name="sll_uulp"
          value={props.formState.sll_uulp}
          onChange={props.onFieldChange}
          size="small"
        >
          <MenuItem value="SLL">SLL</MenuItem>
          <MenuItem value="UULP">UULP</MenuItem>
        </TextField>

        <TextField
          select
          label="Akut/elektivt"
          name="acute_elective"
          value={props.formState.acute_elective}
          onChange={props.onFieldChange}
          size="small"
        >
          <MenuItem value="Akut">Akut</MenuItem>
          <MenuItem value="Elektivt">Elektivt</MenuItem>
        </TextField>

        <TextField
          select
          label="Typ av besök"
          name="visit_type"
          value={props.formState.visit_type}
          onChange={props.onFieldChange}
          size="small"
        >
          {visitTypeOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Snitt-tid per besök"
          name="average_minutes_per_visit"
          type="number"
          value={props.formState.average_minutes_per_visit}
          onChange={props.onFieldChange}
          size="small"
          required
        />

        <TextField
          label="DRG-snitt"
          name="drg_average"
          type="number"
          value={props.formState.drg_average}
          onChange={props.onFieldChange}
          size="small"
          required
        />

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button type="submit" variant="contained" disabled={props.isSubmitting}>
            {props.isSubmitting
              ? "Sparar..."
              : props.editingRowId
                ? "Uppdatera rad"
                : "Lägg till rad"}
          </Button>
          {props.editingRowId ? (
            <Button type="button" variant="outlined" onClick={props.onReset}>
              Avbryt
            </Button>
          ) : null}
        </Box>
      </Box>
    </SectionCard>
  );
}

const formGridSx = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 2,
};
