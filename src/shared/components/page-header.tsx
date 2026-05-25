import { Box, Stack, Typography } from "@mui/material";

type PageHeaderProps = {
  overline?: string;
  title: string;
};

export function PageHeader(props: PageHeaderProps) {
  return (
    <Box
      sx={{
        bgcolor: "#005883",
        color: "white",
        px: 2,
        py: 1.5,
        borderRadius: 1,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
        }}
      >
        <Box>
          {props.overline ? (
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              {props.overline}
            </Typography>
          ) : null}
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            {props.title}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
