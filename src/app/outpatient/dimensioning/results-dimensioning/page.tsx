import { Box, Container, Paper, Stack, Typography } from "@mui/material";

export default function ResultsDimensioningPage() {
  return (
    <Box component="main" sx={{ minHeight: "100vh", bgcolor: "#ffffff", p: 2 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 3, border: "1px solid #d0d7de", boxShadow: "none" }}>
          <Stack spacing={2}>
            <Typography variant="caption" sx={{ color: "#005883", fontWeight: 700 }}>
              Resultat dimensionering
            </Typography>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Resultat dimensionering öppenvård
            </Typography>
            <Typography color="text.secondary">
              Placeholder för resultatvyn av dimensionering.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
