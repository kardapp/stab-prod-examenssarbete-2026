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
    <SectionCard tone="action">
      <Stack spacing={2}>
        {props.saveMessage ? (
          <Alert severity={props.saveSeverity}>{props.saveMessage}</Alert>
        ) : null}

        <Box sx={actionRowSx}>
          <Button
            type="button"
            variant="contained"
            onClick={props.onSave}
            sx={actionButtonSx}
          >
            Spara produktionsplan
          </Button>
          <Button
            variant="outlined"
            href={appRoutes.outpatientOoDistribution}
            sx={actionButtonSx}
          >
            Fördela till OO
          </Button>
          <Button
            variant="outlined"
            href={props.dimensioningHref}
            sx={actionButtonSx}
          >
            Gå till dimensionering
          </Button>
        </Box>
      </Stack>
    </SectionCard>
  );
}

const actionRowSx = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1.5,
};

const actionButtonSx = {
  width: { xs: "100%", sm: "auto" },
};
