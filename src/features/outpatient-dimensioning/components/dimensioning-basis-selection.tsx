"use client";

import { MenuItem, TextField } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import { careTypeOptions } from "../constants/outpatient-dimensioning-options";
import type { DimensioningSelection } from "../types/outpatient-dimensioning.types";

type SelectOption = {
  value: string;
  label: string;
};

type DimensioningBasisSelectionProps = {
  selection: DimensioningSelection;
  options: {
    organizationOptions: SelectOption[];
    productionPlanOptions: SelectOption[];
    yearOptions: SelectOption[];
    kombikaOptions: SelectOption[];
  };
  onSelectionChange: (
    field: keyof DimensioningSelection,
    value: string
  ) => void;
};

export function DimensioningBasisSelection(
  props: DimensioningBasisSelectionProps
) {
  const organizationValue =
    props.options.organizationOptions[0]?.value ??
    "Karolinska Universitetssjukhuset";

  return (
    <SectionCard>
      <FormSection
        overline="Val av underlag"
        title="Dimensionering ME öppenvård"
      />

      <TextField
        select
        label="ME/verksamhet"
        size="small"
        value={organizationValue}
        disabled
        sx={fieldSx}
      >
        {ensureCurrentOption(
          props.options.organizationOptions,
          organizationValue
        ).map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="År"
        size="small"
        value={props.selection.year}
        onChange={(event) =>
          props.onSelectionChange("year", event.target.value)
        }
        sx={fieldSx}
      >
        {ensureCurrentOption(
          props.options.yearOptions,
          props.selection.year
        ).map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Produktionsplan"
        size="small"
        value={props.selection.productionPlanId}
        onChange={(event) =>
          props.onSelectionChange("productionPlanId", event.target.value)
        }
        sx={fieldSx}
      >
        {ensureCurrentOption(
          props.options.productionPlanOptions,
          props.selection.productionPlanId
        ).map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Ekonomisk kombika"
        size="small"
        value={props.selection.kombikaId}
        onChange={(event) =>
          props.onSelectionChange("kombikaId", event.target.value)
        }
        sx={fieldSx}
      >
        {ensureCurrentOption(
          props.options.kombikaOptions,
          props.selection.kombikaId
        ).map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Vårdtyp"
        size="small"
        value={props.selection.careType}
        onChange={(event) =>
          props.onSelectionChange("careType", event.target.value)
        }
        sx={fieldSx}
      >
        {careTypeOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </SectionCard>
  );
}

function ensureCurrentOption(
  options: SelectOption[],
  currentValue: string
): SelectOption[] {
  if (!currentValue || options.some((option) => option.value === currentValue)) {
    return options;
  }

  return [{ value: currentValue, label: currentValue }, ...options];
}

const fieldSx = {
  mr: 1.5,
  mb: 1.5,
  minWidth: { xs: "100%", sm: 220 },
};
