import { Stack, Typography } from "@mui/material";

type MetricValueProps = {
  label: string;
  value: string;
};

export function PeriodizationMetricValue(props: MetricValueProps) {
  return (
    <Stack spacing={0.25} sx={metricSx}>
      <Typography variant="caption" color="text.secondary">
        {props.label}
      </Typography>
      <Typography sx={{ color: "#005883", fontWeight: 700 }}>
        {props.value}
      </Typography>
    </Stack>
  );
}

const metricSx = {
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  p: 1.5,
  bgcolor: "var(--section-background)",
};
