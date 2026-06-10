import { Box, Stack, Typography } from "@mui/material";

type PlanningMetricCardProps = {
  helperText?: string;
  label: string;
  value: string;
};

export function PlanningMetricCard(props: PlanningMetricCardProps) {
  return (
    <Box sx={metricCardSx}>
      <Stack spacing={0.25}>
        <Typography variant="body2" color="text.secondary">
          {props.label}
        </Typography>
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 700, overflowWrap: "anywhere" }}
        >
          {props.value}
        </Typography>
        {props.helperText ? (
          <Typography variant="caption" color="text.secondary">
            {props.helperText}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}

const metricCardSx = {
  bgcolor: "var(--section-background)",
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  minHeight: 88,
  p: 1.5,
};
