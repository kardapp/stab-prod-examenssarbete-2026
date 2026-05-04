import { Box, Container, Typography } from "@mui/material";

export default function DimensioningPage() {
  return (
    <Box component="main" sx={{ minHeight: "100vh", py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h4">Dimensionering</Typography>

        <Typography sx={{ mt: 2 }} color="text.secondary">
          Här ska systemet visa beräknat resursbehov utifrån produktionsplanen.
        </Typography>
      </Container>
    </Box>
  );
}
