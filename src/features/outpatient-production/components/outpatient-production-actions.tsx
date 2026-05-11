"use client";

import { Box, Button } from "@mui/material";
import { SectionCard } from "@/shared/components/section-card";

export function OutpatientProductionActions() {
  return (
    <SectionCard sx={{ display: "flex", justifyContent: "center" }}>
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          size="large"
          href="/outpatient/production/oo-distribution"
        >
          Fördela till OO
        </Button>
        <Button variant="contained" size="large" href="/outpatient/dimensioning">
          Gå till dimensionering
        </Button>
      </Box>
    </SectionCard>
  );
}
