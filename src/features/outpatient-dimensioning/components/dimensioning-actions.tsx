"use client";

import { Alert, Box, Button, Stack } from "@mui/material";
import { SectionCard } from "@/shared/components/section-card";

type DimensioningActionsProps = {
  saveMessage: string;
  isSaving: boolean;
  onSave: () => void | Promise<void>;
};

export function DimensioningActions(props: DimensioningActionsProps) {
  return (
    <SectionCard>
      <Stack spacing={2}>
        {props.saveMessage ? (
          <Alert severity={getSaveMessageSeverity(props.saveMessage)}>
            {props.saveMessage}
          </Alert>
        ) : null}

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            type="button"
            variant="contained"
            onClick={props.onSave}
            disabled={props.isSaving}
          >
            {props.isSaving ? "Sparar..." : "Spara dimensionering"}
          </Button>
          <Button
            variant="outlined"
            href="/outpatient/production/production-planning"
          >
            Gå till produktionsplanering
          </Button>
          <Button
            variant="outlined"
            href="/outpatient/dimensioning/results-dimensioning"
          >
            Gå till resultat
          </Button>
        </Box>
      </Stack>
    </SectionCard>
  );
}

function getSaveMessageSeverity(
  message: string
): "success" | "error" | "warning" {
  if (message.includes("kunde inte")) {
    return "error";
  }

  if (message.includes("Välj")) {
    return "warning";
  }

  return "success";
}
