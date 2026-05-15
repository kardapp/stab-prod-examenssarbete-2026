import { Box, Stack, Typography } from "@mui/material";

type SummaryValueCardProps = {
  label: string;
  value: string;
  helperText?: string;
};

export function SummaryValueCard(props: SummaryValueCardProps) {
  return (
    <Box sx={summaryValueSx}>
      <Stack spacing={0.25}>
        <Typography variant="body2" color="text.secondary">
          {props.label}
        </Typography>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
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

const summaryValueSx = {
  bgcolor: "#f6f8fa",
  border: "1px solid #e5e7eb",
  borderRadius: 1,
  p: 1.5,
  minHeight: 88,
};
