import { Box, Stack, Typography } from "@mui/material";

export function ProductionHeader() {
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
        sx={{ alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between" }}
      >
        <Box>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            Produktionsplanering öppenvård
          </Typography>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            Inmatning produktion per ekonomisk kombika
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: "white",
            color: "text.primary",
            px: 2,
            py: 1,
            borderRadius: 1,
            minWidth: 190,
          }}
        >
          <Typography variant="caption">VersionPDP</Typography>
          <Typography sx={{ fontWeight: 700 }}>
            Produktionsplanering 2027
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
