import { Box, Typography } from "@mui/material";

type SectionTitleProps = {
  overline: string;
  title: string;
  description: string;
};

export function SectionTitle(props: SectionTitleProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={overlineSx}>
        {props.overline}
      </Typography>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
        {props.title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {props.description}
      </Typography>
    </Box>
  );
}

const overlineSx = {
  color: "#005883",
  fontWeight: 700,
  letterSpacing: 0,
  textTransform: "uppercase",
};
