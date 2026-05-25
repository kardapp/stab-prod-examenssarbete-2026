import { Alert, Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import {
  formatSignedPercentage,
  impactTypeOptions,
  WEEK_COUNT,
  type WeeklyImpact,
  type WeeklyImpactDraft,
} from "./periodization-curve-model";

type WeeklyImpactControlsProps = {
  draft: WeeklyImpactDraft;
  impacts: WeeklyImpact[];
  validationMessage: string;
  onAddImpact: () => void;
  onDraftChange: (field: keyof WeeklyImpactDraft, value: string) => void;
  onRemoveImpact: (impactId: string) => void;
  onTypeChange: (value: string) => void;
};

export function WeeklyImpactControls(props: WeeklyImpactControlsProps) {
  return (
    <>
      <Box sx={impactFormSx}>
        <TextField
          select
          label="Typ"
          size="small"
          value={props.draft.type}
          onChange={(event) => props.onTypeChange(event.target.value)}
          sx={fieldSx}
        >
          {impactTypeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Namn"
          size="small"
          value={props.draft.name}
          onChange={(event) =>
            props.onDraftChange("name", event.target.value)
          }
          sx={fieldSx}
        />
        <TextField
          label="Startvecka"
          type="number"
          size="small"
          value={props.draft.startWeek}
          onChange={(event) =>
            props.onDraftChange("startWeek", event.target.value)
          }
          slotProps={{ htmlInput: { min: 1, max: WEEK_COUNT, step: 1 } }}
          sx={fieldSx}
        />
        <TextField
          label="Slutvecka"
          type="number"
          size="small"
          value={props.draft.endWeek}
          onChange={(event) =>
            props.onDraftChange("endWeek", event.target.value)
          }
          slotProps={{ htmlInput: { min: 1, max: WEEK_COUNT, step: 1 } }}
          sx={fieldSx}
        />
        <TextField
          label="Påverkan (%)"
          type="number"
          size="small"
          value={props.draft.percentage}
          onChange={(event) =>
            props.onDraftChange("percentage", event.target.value)
          }
          slotProps={{ htmlInput: { min: -100, max: 200, step: 1 } }}
          sx={fieldSx}
        />
        <Button type="button" variant="outlined" onClick={props.onAddImpact}>
          Lägg till påverkan
        </Button>
      </Box>

      {props.validationMessage ? (
        <Alert severity="warning" sx={{ mt: 1.5 }}>
          {props.validationMessage}
        </Alert>
      ) : null}

      {props.impacts.length > 0 ? (
        <Box sx={impactListSx}>
          {props.impacts.map((impact) => (
            <Box key={impact.id} sx={impactRowSx}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700 }}>{impact.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  v. {impact.startWeek}-{impact.endWeek} ·{" "}
                  {formatSignedPercentage(impact.percentage)}
                </Typography>
              </Box>
              <Button
                type="button"
                variant="outlined"
                color="error"
                onClick={() => props.onRemoveImpact(impact.id)}
              >
                Ta bort
              </Button>
            </Box>
          ))}
        </Box>
      ) : null}
    </>
  );
}

const fieldSx = {
  minWidth: 0,
  width: "100%",
};

const impactFormSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
    lg: "repeat(6, minmax(0, 1fr))",
  },
  gap: 1.5,
  mt: 2,
};

const impactListSx = {
  display: "grid",
  gap: 1,
  mt: 1.5,
};

const impactRowSx = {
  alignItems: "center",
  border: "1px solid #d0d7de",
  borderRadius: 1,
  display: "grid",
  gap: 1,
  gridTemplateColumns: {
    xs: "1fr",
    sm: "minmax(0, 1fr) auto",
  },
  p: 1.5,
};
