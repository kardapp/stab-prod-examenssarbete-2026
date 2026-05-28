import { Box, Typography } from "@mui/material";

type FormSectionProps = {
  overline: string;
  title: string;
  description?: string;
};

export function FormSection(props: FormSectionProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={overlineSx}>
        {props.overline}
      </Typography>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
        {props.title}
      </Typography>
      {props.description ? (
        <Typography variant="body2" color="text.secondary">
          {props.description}
        </Typography>
      ) : null}
    </Box>
  );
}

const overlineSx = {
  color: "primary.main",
  fontWeight: 700,
  letterSpacing: 0,
  textTransform: "uppercase",
};
