import { Alert, Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import {
  formatImpactWeekdays,
  formatSignedPercentage,
  getImpactTargetLabel,
  impactTargetOptions,
  impactTypeOptions,
  weekdayOptions,
  type WeekdayKey,
  type WeeklyImpact,
  type WeeklyImpactDraft,
} from "./periodization-curve-model";

type WeeklyImpactControlsProps = {
  draft: WeeklyImpactDraft;
  impacts: WeeklyImpact[];
  selectedWeek: number;
  showDrg?: boolean;
  volumeLabel?: string;
  validationMessage: string;
  onAddImpact: () => void;
  onDraftChange: (
    field: Exclude<keyof WeeklyImpactDraft, "weekdays">,
    value: string
  ) => void;
  onDraftWeekdaysChange: (weekdays: WeekdayKey[]) => void;
  onRemoveImpact: (impactId: string) => void;
  onTargetChange: (value: string) => void;
  onTypeChange: (value: string) => void;
};

export function WeeklyImpactControls(props: WeeklyImpactControlsProps) {
  const allWeekdays = weekdayOptions.map((option) => option.value);
  const allWeekdaysSelected = props.draft.weekdays.length === allWeekdays.length;
  const visibleImpactTargetOptions = impactTargetOptions.filter(
    (option) => props.showDrg !== false || option.value !== "drgPoints"
  );

  function toggleWeekday(weekday: WeekdayKey) {
    const nextWeekdays = props.draft.weekdays.includes(weekday)
      ? props.draft.weekdays.filter((item) => item !== weekday)
      : [...props.draft.weekdays, weekday];

    props.onDraftWeekdaysChange(sortWeekdays(nextWeekdays));
  }

  return (
    <Box sx={impactPanelSx}>
      <Box sx={impactHeaderSx}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Lägg till påverkan för vecka {props.selectedWeek}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Gäller vald vecka
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
          select
          label="Påverkar"
          size="small"
          value={props.draft.target}
          onChange={(event) => props.onTargetChange(event.target.value)}
          sx={fieldSx}
        >
          {visibleImpactTargetOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {getImpactTargetLabel(option.value, props.volumeLabel)}
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
              variant="contained"
              color="inherit"
              disableElevation
              aria-pressed={allWeekdaysSelected}
              onClick={() => props.onDraftWeekdaysChange(allWeekdays)}
              sx={dayButtonSx(allWeekdaysSelected)}
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
                  variant="contained"
                  color="inherit"
                  disableElevation
                  aria-pressed={isSelected}
                  onClick={() => toggleWeekday(weekday.value)}
                  sx={dayButtonSx(isSelected)}
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
          <Typography variant="subtitle2" sx={impactListTitleSx}>
            Påverkan i vecka {props.selectedWeek}
          </Typography>
          {props.impacts.map((impact) => (
            <Box key={impact.id} sx={impactRowSx}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700 }}>{impact.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  v. {impact.startWeek}-{impact.endWeek} ·{" "}
                  {getImpactTargetLabel(impact.target, props.volumeLabel)} ·{" "}
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
    </Box>
  );
}

function sortWeekdays(weekdays: WeekdayKey[]): WeekdayKey[] {
  return weekdayOptions
    .map((option) => option.value)
    .filter((weekday) => weekdays.includes(weekday));
}

const fieldSx = {
  alignSelf: "start",
  minWidth: 0,
  width: "100%",
};

const impactPanelSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  bgcolor: "background.paper",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 0,
  minWidth: 0,
  p: 1.5,
  width: "100%",
};

const impactHeaderSx = {
  alignItems: "flex-start",
  display: "flex",
  gap: 1,
  justifyContent: "space-between",
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
  alignContent: {
    xl: "start",
  },
  alignItems: "start",
  display: "grid",
  flex: 1,
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
    xl: "repeat(4, minmax(0, 1fr))",
  },
  gridTemplateRows: {
    xl: "66px minmax(120px, 144px)",
  },
  gap: 1.5,
  minHeight: 0,
  mt: 1.5,
  width: "100%",
};

const dayPickerSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  bgcolor: "var(--page-background)",
  display: "flex",
  flexDirection: "column",
  gridColumn: {
    xs: "1",
    md: "1 / -1",
    xl: "span 3",
  },
  height: "100%",
  justifyContent: "stretch",
  minHeight: 0,
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
  alignContent: "center",
  display: "grid",
  flex: 1,
  gridTemplateColumns: {
    xs: "repeat(2, minmax(0, 1fr))",
    sm: "repeat(4, minmax(0, 1fr))",
    lg: "repeat(7, minmax(0, 1fr))",
  },
  gridAutoRows: "36px",
  gap: 0.75,
  justifyContent: "stretch",
  minHeight: 0,
};

function dayButtonSx(isSelected: boolean) {
  return {
    "&&": {
      bgcolor: isSelected ? "primary.main" : "#eef1f4",
      border: "1px solid",
      borderColor: isSelected ? "primary.main" : "#d5dce3",
      boxShadow: "none",
      color: isSelected ? "primary.contrastText" : "#5f6b76",
    },
    minWidth: 0,
    minHeight: 36,
    "&&:hover": {
      bgcolor: isSelected ? "primary.dark" : "#e2e7ec",
      borderColor: isSelected ? "primary.dark" : "#c4ccd5",
      boxShadow: "none",
    },
  };
}

const addButtonSx = {
  alignSelf: {
    xs: "stretch",
    xl: "start",
  },
  gridColumn: {
    xs: "1",
    md: "1 / -1",
    xl: "span 1",
  },
  justifySelf: "stretch",
  minHeight: {
    xs: 40,
    xl: 72,
  },
  width: "100%",
};

const impactListSx = {
  display: "grid",
  gap: 1,
  mt: 1.5,
};

const impactListTitleSx = {
  color: "#005883",
  fontWeight: 700,
};

const impactRowSx = {
  alignItems: "center",
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  bgcolor: "var(--page-background)",
  display: "grid",
  gap: 1,
  gridTemplateColumns: {
    xs: "1fr",
    sm: "minmax(0, 1fr) auto",
  },
  p: 1.5,
};
