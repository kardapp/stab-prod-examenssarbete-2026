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
        <Typography variant="h6" component="div" sx={valueSx}>
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
  bgcolor: "var(--section-background)",
  border: "1px solid var(--color-border)",
  borderRadius: 1,
  minHeight: 88,
  minWidth: 0,
  p: 1.5,
};

const valueSx = {
  fontWeight: 700,
  lineHeight: 1.25,
  overflowWrap: "anywhere",
};
