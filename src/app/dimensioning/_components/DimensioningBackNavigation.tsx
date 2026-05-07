"use client";

import { Button, Paper } from "@mui/material";

export function DimensioningBackNavigation() {
  return (
    <Paper sx={navigationSx}>
      <Button variant="contained" size="large" href="/production">
        Gå till produktionsplan: ÖPV VH
      </Button>
    </Paper>
  );
}

const navigationSx = {
  p: 2,
  border: "1px solid #d0d7de",
  borderRadius: 1,
  boxShadow: "none",
  display: "flex",
  justifyContent: "center",
};
