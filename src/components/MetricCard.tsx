import { Box, Typography } from "@mui/material";

type MetricCardProps = {
  label: string;
  value: string;
};

export function MetricCard(props: MetricCardProps) {
  return (
    <Box sx={metricCardSx}>
      <Typography variant="caption" color="text.secondary">
        {props.label}
      </Typography>
      <Typography sx={{ color: "#005883", fontWeight: 700 }}>
        {props.value}
      </Typography>
    </Box>
  );
}

const metricCardSx = {
  border: "1px solid #d0d7de",
  borderRadius: 1,
  p: 1.5,
  bgcolor: "#f8fbfd",
};
