import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";

export default function OoDistributionPage() {
  return (
    <Box component="main" sx={{ minHeight: "100vh", bgcolor: "#ffffff", p: 2 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 3, border: "1px solid #d0d7de", boxShadow: "none" }}>
          <Stack spacing={2}>
            <Typography variant="caption" sx={{ color: "#005883", fontWeight: 700 }}>
              Steg 2
            </Typography>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Fördelning av vårdtillfällen till OO
            </Typography>
            <Typography color="text.secondary">
              Placeholder för nästa steg. Här ska vårdtillfällen fördelas till
              vårdande enhet efter överenskommelse mellan sektionschef,
              controller och OVC.
            </Typography>
            <Box>
              <Button variant="outlined" href="/production">
                Tillbaka till steg 1
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
