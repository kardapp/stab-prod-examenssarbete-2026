"use client";

import type { ChangeEvent } from "react";
import { Box, InputAdornment, Typography } from "@mui/material";
import { FormattedNumberTextField } from "@/shared/components/formatted-number-text-field";
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
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "minmax(72px, 1fr) 140px minmax(120px, auto)",
        },
        gap: { xs: 1, sm: 1.5 },
        alignItems: { sm: "center" },
      }}
    >
      <Typography sx={{ fontWeight: 600 }}>{props.label}</Typography>
      <FormattedNumberTextField
        label="Andel"
        value={props.percentage}
        onChange={handleChange}
        size="small"
        sx={{ width: { xs: "100%", sm: 140 } }}
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
        sx={{
          minWidth: { sm: 120 },
          textAlign: { xs: "left", sm: "right" },
          color: "primary.main",
        }}
      >
        {formatOneDecimal(props.calculatedCareEvents)} vårdhändelser
      </Typography>
    </Box>
  );
}
