import { Box, Typography } from "@mui/material";

type ProductionSectionTitleProps = {
  overline: string;
  title: string;
  description?: string;
};

export function ProductionSectionTitle(props: ProductionSectionTitleProps) {
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
  color: "#005883",
  fontWeight: 700,
  letterSpacing: 0,
  textTransform: "uppercase",
};
