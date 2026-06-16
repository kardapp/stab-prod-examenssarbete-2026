"use client";

import type { ChangeEvent } from "react";
import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { FormattedNumberTextField } from "@/shared/components/formatted-number-text-field";
import { formatOneDecimal } from "@/shared/utils/format-number";
import { roleCategoryOptions } from "../constants/outpatient-production-options";
import type { RoleDistribution } from "../types/outpatient-production.types";

type RoleDistributionRowProps = {
  role: RoleDistribution;
  calculatedCareEvents: number;
  canRemove: boolean;
  onChange: (
    roleId: string,
    field: keyof Omit<RoleDistribution, "id">,
    value: string | number
  ) => void;
  onRemove: (roleId: string) => void;
};

export function RoleDistributionRow(props: RoleDistributionRowProps) {
  function handlePrimaryRoleChange(event: ChangeEvent<HTMLInputElement>) {
    props.onChange(props.role.id, "primaryRole", event.target.value);
  }

  function handleSecondaryRoleChange(event: ChangeEvent<HTMLInputElement>) {
    props.onChange(props.role.id, "secondaryRole", event.target.value);
  }

  function handlePercentageChange(event: ChangeEvent<HTMLInputElement>) {
    props.onChange(props.role.id, "percentage", Number(event.target.value));
  }

  return (
    <Box sx={roleRowSx}>
      <TextField
        select
        label="Primär yrkeskategori"
        value={props.role.primaryRole}
        onChange={handlePrimaryRoleChange}
        size="small"
        fullWidth
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
        value={props.role.secondaryRole ?? ""}
        onChange={handleSecondaryRoleChange}
        size="small"
        fullWidth
      >
        <MenuItem value="">Ingen</MenuItem>
        {roleCategoryOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>

      <FormattedNumberTextField
        label="Andel"
        value={props.role.percentage}
        onChange={handlePercentageChange}
        size="small"
        sx={{ width: "100%" }}
        slotProps={{
          input: {
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          },
          htmlInput: {
            min: 0,
            max: 100,
            step: 1,
          },
        }}
      />

      <Typography
        variant="body2"
        sx={calculatedCareEventsSx}
      >
        {formatOneDecimal(props.calculatedCareEvents)} vårdhändelser
      </Typography>

      <Button
        type="button"
        variant="outlined"
        color="error"
        disabled={!props.canRemove}
        onClick={() => props.onRemove(props.role.id)}
        sx={removeButtonSx}
      >
        Ta bort
      </Button>
    </Box>
  );
}

const roleRowSx = {
  alignItems: "center",
  borderBottom: "1px solid var(--color-border)",
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
    lg: "minmax(0, 1fr) minmax(0, 1fr) minmax(112px, 132px) minmax(128px, auto) auto",
  },
  pb: 1.5,
};

const calculatedCareEventsSx = {
  color: "primary.main",
  fontWeight: 700,
  minWidth: 0,
  overflowWrap: "anywhere",
  textAlign: { xs: "left", lg: "right" },
};

const removeButtonSx = {
  justifySelf: { xs: "stretch", lg: "end" },
  width: { xs: "100%", lg: "auto" },
};
