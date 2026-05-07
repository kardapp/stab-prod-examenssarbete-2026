"use client";

import { Box, Button, Paper } from "@mui/material";

export function ProductionNavigationActions() {
  return (
    <Paper sx={navigationPanelSx}>
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          size="large"
          href="/production/oo-distribution"
        >
          Fördela till OO
        </Button>
        <Button variant="contained" size="large" href="/dimensioning">
          Gå till dimensionering
        </Button>
      </Box>
    </Paper>
  );
}

const navigationPanelSx = {
  p: 2,
  border: "1px solid #d0d7de",
  borderRadius: 1,
  boxShadow: "none",
  display: "flex",
  justifyContent: "center",
};
