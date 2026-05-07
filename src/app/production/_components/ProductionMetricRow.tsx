import { Box, Typography } from "@mui/material";

type ProductionMetricRowProps = {
  label: string;
  value: string;
};

export function ProductionMetricRow(props: ProductionMetricRowProps) {
  return (
    <Box sx={metricRowSx}>
      <Typography>{props.label}</Typography>
      <Typography sx={{ color: "#005883", fontWeight: 700 }}>
        {props.value}
      </Typography>
    </Box>
  );
}

const metricRowSx = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 2,
  borderBottom: "1px solid #e5e7eb",
  pb: 1,
};
