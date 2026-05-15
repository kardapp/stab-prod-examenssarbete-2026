"use client";

import { Button } from "@mui/material";
import { SectionCard } from "@/shared/components/section-card";

export function DimensioningActions() {
  return (
    <SectionCard sx={{ display: "flex", justifyContent: "center" }}>
      <Button
        variant="contained"
        size="large"
        href="/production-planning/outpatient"
      >
        Gå till produktionsplan: ÖPV VH
      </Button>
    </SectionCard>
  );
}
