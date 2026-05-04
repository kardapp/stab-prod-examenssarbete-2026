import { Box, Container, Typography } from "@mui/material";

export default function ProductionPage() {
  return (
    <Box component="main" sx={{ minHeight: "100vh", py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h4">Produktionsplanering</Typography>

        <Typography sx={{ mt: 2 }} color="text.secondary">
          Här ska användaren kunna registrera planerad vårdproduktion.
        </Typography>
      </Container>
    </Box>
  );
}
