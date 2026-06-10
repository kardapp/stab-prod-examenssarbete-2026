"use client";

import { Alert, Box, Button, Stack } from "@mui/material";
import { appRoutes } from "@/shared/routes";
import { SectionCard } from "@/shared/components/section-card";

type ProductionActionsSectionProps = {
  saveMessage: string;
  saveSeverity: "success" | "error";
  dimensioningHref: string;
  onSave: () => void | Promise<void>;
};

export function ProductionActionsSection(props: ProductionActionsSectionProps) {
  return (
    <SectionCard>
      <Stack spacing={2}>
        {props.saveMessage ? (
          <Alert severity={props.saveSeverity}>{props.saveMessage}</Alert>
        ) : null}

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button type="button" variant="contained" onClick={props.onSave}>
            Spara produktionsplan
          </Button>
          <Button
            variant="outlined"
            href={appRoutes.outpatientOoDistribution}
          >
            Fördela till OO
          </Button>
          <Button variant="outlined" href={props.dimensioningHref}>
            Gå till dimensionering
          </Button>
        </Box>
      </Stack>
    </SectionCard>
  );
}
