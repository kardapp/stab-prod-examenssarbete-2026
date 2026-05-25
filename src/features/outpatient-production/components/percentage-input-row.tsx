"use client";

import type { ChangeEvent } from "react";
import { InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { formatOneDecimal } from "@/shared/utils/format-number";

type PercentageInputRowProps = {
  label: string;
  percentage: number;
  calculatedCareEvents: number;
  onPercentageChange: (value: number) => void;
};

export function PercentageInputRow(props: PercentageInputRowProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    props.onPercentageChange(Number(event.target.value));
  }

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      sx={{
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
      }}
    >
      <Typography sx={{ fontWeight: 600 }}>{props.label}</Typography>
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "center", justifyContent: "flex-end" }}
      >
        <TextField
          label="Andel"
          type="number"
          value={props.percentage}
          onChange={handleChange}
          size="small"
          sx={{ width: 140 }}
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
          sx={{ minWidth: 120, textAlign: "right", color: "#005883" }}
        >
          {formatOneDecimal(props.calculatedCareEvents)} vårdtillfällen
        </Typography>
      </Stack>
    </Stack>
  );
}
