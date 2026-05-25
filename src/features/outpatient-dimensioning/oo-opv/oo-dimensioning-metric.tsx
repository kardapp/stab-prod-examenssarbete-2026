import { Stack, Typography } from "@mui/material";

type OoDimensioningMetricProps = {
  label: string;
  value: string;
  helperText?: string;
};

export function OoDimensioningMetric(props: OoDimensioningMetricProps) {
  return (
    <Stack spacing={0.25} sx={metricSx}>
      <Typography variant="caption" color="text.secondary">
        {props.label}
      </Typography>
      <Typography sx={{ color: "#005883", fontWeight: 700 }}>
        {props.value}
      </Typography>
      {props.helperText ? (
        <Typography variant="caption" color="text.secondary">
          {props.helperText}
        </Typography>
      ) : null}
    </Stack>
  );
}

const metricSx = {
  border: "1px solid #d0d7de",
  borderRadius: 1,
  bgcolor: "var(--page-background)",
  justifyContent: "center",
  minHeight: 72,
  minWidth: 0,
  p: 1.5,
};
