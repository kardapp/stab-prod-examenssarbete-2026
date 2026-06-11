import { Box, Button, TextField, Typography } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import type { OoCareSupportRow } from "./types";

type CareSupportSectionProps = {
  rows: OoCareSupportRow[];
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onRowChange: (
    rowId: string,
    field: keyof Omit<OoCareSupportRow, "id">,
    value: string | number
  ) => void;
};

export function CareSupportSection(props: CareSupportSectionProps) {
  return (
    <SectionCard>
      <FormSection
        overline="2. Vårdnära stöd"
        title="Stödresurser nära vården"
        description="Timmar per vecka för stöd som inte är egna vårdhändelser men som ska räknas in i bemanningen."
      />

      <Box sx={supportGridSx}>
        {props.rows.map((row) => (
          <Box key={row.id} sx={supportBlockSx}>
            <Typography variant="subtitle2" sx={blockTitleSx}>
              Stödresurs
            </Typography>
            <Box sx={supportFieldGridSx}>
              <TextField
                label="Roll"
                size="small"
                value={row.careSupportRole}
                onChange={(event) =>
                  props.onRowChange(
                    row.id,
                    "careSupportRole",
                    event.target.value
                  )
                }
              />
              <TextField
                label="Timmar per vecka"
                type="number"
                size="small"
                value={row.careSupportHoursPerWeek}
                onChange={(event) =>
                  props.onRowChange(
                    row.id,
                    "careSupportHoursPerWeek",
                    Number(event.target.value)
                  )
                }
                slotProps={{ htmlInput: { min: 0, step: 0.25 } }}
              />
            </Box>
            <TextField
              label="Kommentar"
              size="small"
              value={row.careSupportComment}
              onChange={(event) =>
                props.onRowChange(
                  row.id,
                  "careSupportComment",
                  event.target.value
                )
              }
              fullWidth
              sx={{ mt: 1 }}
            />
            <Box sx={{ mt: 1 }}>
              <Button
                type="button"
                variant="outlined"
                color="error"
                disabled={props.rows.length <= 1}
                onClick={() => props.onRemoveRow(row.id)}
              >
                Ta bort
              </Button>
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <Button type="button" variant="outlined" onClick={props.onAddRow}>
          Lägg till stödresurs
        </Button>
      </Box>
    </SectionCard>
  );
}

const supportGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    lg: "repeat(2, minmax(0, 1fr))",
  },
  gap: 1.5,
};

const supportBlockSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  bgcolor: "var(--page-background)",
  p: 1.5,
};

const supportFieldGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
  gap: 1,
};

const blockTitleSx = {
  color: "#005883",
  fontWeight: 700,
  mb: 1,
};
