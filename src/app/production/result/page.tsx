import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";

export default function ProductionResultPage() {
  return (
    <Box component="main" sx={{ minHeight: "100vh", bgcolor: "#ffffff", p: 2 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 3, border: "1px solid #d0d7de", boxShadow: "none" }}>
          <Stack spacing={2}>
            <Typography variant="caption" sx={{ color: "#005883", fontWeight: 700 }}>
              Steg 3
            </Typography>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Resultat produktionsplan öppenvård
            </Typography>
            <Typography color="text.secondary">
              Placeholder för resultatvyn. Här ska antal vårdtillfällen,
              besökstid och DRG visas per ekonomisk och vårdande enhet/kombika,
              per dag och per yrkeskategori.
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
