"use client";

import type { ChangeEvent } from "react";
import {
  Button,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
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
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={1.5}
      sx={{
        alignItems: { xs: "stretch", md: "center" },
        borderBottom: "1px solid var(--color-border)",
        pb: 1.5,
      }}
    >
      <TextField
        select
        label="Primär yrkeskategori"
        value={props.role.primaryRole}
        onChange={handlePrimaryRoleChange}
        size="small"
        sx={{ flex: 1 }}
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
        sx={{ flex: 1 }}
      >
        <MenuItem value="">Ingen</MenuItem>
        {roleCategoryOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Andel"
        type="number"
        value={props.role.percentage}
        onChange={handlePercentageChange}
        size="small"
        sx={{ width: { xs: "100%", md: 132 } }}
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
        sx={{ minWidth: 128, textAlign: { xs: "left", md: "right" } }}
      >
        {formatOneDecimal(props.calculatedCareEvents)} vårdhändelser
      </Typography>

      <Button
        type="button"
        variant="outlined"
        color="error"
        disabled={!props.canRemove}
        onClick={() => props.onRemove(props.role.id)}
        sx={{ alignSelf: { xs: "stretch", md: "center" } }}
      >
        Ta bort
      </Button>
    </Stack>
  );
}
