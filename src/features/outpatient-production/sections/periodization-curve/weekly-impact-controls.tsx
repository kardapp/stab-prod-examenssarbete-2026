import { Alert, Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import {
  formatImpactWeekdays,
  formatSignedPercentage,
  impactTypeOptions,
  weekdayOptions,
  WEEK_COUNT,
  type WeekdayKey,
  type WeeklyImpact,
  type WeeklyImpactDraft,
} from "./periodization-curve-model";

type WeeklyImpactControlsProps = {
  draft: WeeklyImpactDraft;
  impacts: WeeklyImpact[];
  selectedWeek: number;
  validationMessage: string;
  onAddImpact: () => void;
  onDraftChange: (
    field: Exclude<keyof WeeklyImpactDraft, "weekdays">,
    value: string
  ) => void;
  onDraftWeekdaysChange: (weekdays: WeekdayKey[]) => void;
  onRemoveImpact: (impactId: string) => void;
  onTypeChange: (value: string) => void;
};

export function WeeklyImpactControls(props: WeeklyImpactControlsProps) {
  const allWeekdays = weekdayOptions.map((option) => option.value);
  const allWeekdaysSelected = props.draft.weekdays.length === allWeekdays.length;

  function toggleWeekday(weekday: WeekdayKey) {
    const nextWeekdays = props.draft.weekdays.includes(weekday)
      ? props.draft.weekdays.filter((item) => item !== weekday)
      : [...props.draft.weekdays, weekday];

    props.onDraftWeekdaysChange(sortWeekdays(nextWeekdays));
  }

  return (
    <>
      <Box sx={impactHeaderSx}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Lägg till påverkan
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Vald vecka {props.selectedWeek}
          </Typography>
        </Box>
        <Typography variant="caption" sx={selectedDaysBadgeSx}>
          {props.draft.weekdays.length}/7 dagar
        </Typography>
      </Box>

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

        <Box sx={dayPickerSx}>
          <Box sx={dayPickerHeaderSx}>
            <Typography variant="caption" sx={dayPickerLabelSx}>
              Dagar
            </Typography>
            <Button
              type="button"
              size="small"
              variant={allWeekdaysSelected ? "contained" : "outlined"}
              onClick={() => props.onDraftWeekdaysChange(allWeekdays)}
            >
              Alla
            </Button>
          </Box>
          <Box sx={dayButtonGridSx}>
            {weekdayOptions.map((weekday) => {
              const isSelected = props.draft.weekdays.includes(weekday.value);

              return (
                <Button
                  key={weekday.value}
                  type="button"
                  size="small"
                  variant={isSelected ? "contained" : "outlined"}
                  onClick={() => toggleWeekday(weekday.value)}
                  sx={dayButtonSx}
                >
                  {weekday.shortLabel}
                </Button>
              );
            })}
          </Box>
        </Box>

        <Button
          type="button"
          variant="outlined"
          onClick={props.onAddImpact}
          sx={addButtonSx}
        >
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
                  {formatImpactWeekdays(impact)} ·{" "}
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

function sortWeekdays(weekdays: WeekdayKey[]): WeekdayKey[] {
  return weekdayOptions
    .map((option) => option.value)
    .filter((weekday) => weekdays.includes(weekday));
}

const fieldSx = {
  minWidth: 0,
  width: "100%",
};

const impactHeaderSx = {
  alignItems: "flex-start",
  display: "flex",
  gap: 1,
  justifyContent: "space-between",
  mt: 2,
};

const selectedDaysBadgeSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  color: "#005883",
  flexShrink: 0,
  fontWeight: 800,
  lineHeight: 1,
  px: 1,
  py: 0.75,
};

const impactFormSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
    xl: "repeat(6, minmax(0, 1fr))",
  },
  gap: 1.5,
  mt: 1,
};

const dayPickerSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  bgcolor: "var(--page-background)",
  gridColumn: {
    xs: "1",
    md: "1 / -1",
    xl: "span 5",
  },
  p: 1,
};

const dayPickerHeaderSx = {
  alignItems: "center",
  display: "flex",
  gap: 1,
  justifyContent: "space-between",
  mb: 1,
};

const dayPickerLabelSx = {
  color: "text.secondary",
  fontWeight: 700,
};

const dayButtonGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "repeat(2, minmax(0, 1fr))",
    sm: "repeat(4, minmax(0, 1fr))",
    lg: "repeat(7, minmax(0, 1fr))",
  },
  gap: 0.75,
};

const dayButtonSx = {
  minWidth: 0,
};

const addButtonSx = {
  alignSelf: "end",
  minHeight: 40,
};

const impactListSx = {
  display: "grid",
  gap: 1,
  mt: 1.5,
};

const impactRowSx = {
  alignItems: "center",
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  display: "grid",
  gap: 1,
  gridTemplateColumns: {
    xs: "1fr",
    sm: "minmax(0, 1fr) auto",
  },
  p: 1.5,
};
