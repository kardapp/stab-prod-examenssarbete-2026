import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";

export default function HomePage() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Box>
            <Box
              component="h1"
              sx={{
                typography: "h4",
                fontWeight: 700,
                m: 0,
              }}
            >
              Planeringsverktyg
            </Box>

            <Typography sx={{ mt: 2, maxWidth: 720 }} color="text.secondary">
              Prototyp för produktionsplanering och dimensionering inom
              öppenvård och slutenvård.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Box
                  component="h2"
                  sx={{
                    typography: "h6",
                    fontWeight: 700,
                    m: 0,
                  }}
                >
                  Produktionsplanering
                </Box>

                <Typography sx={{ mt: 1 }} color="text.secondary">
                  Planera vårdhändelser, volymer och tidsåtgång.
                </Typography>

                <Button href="/production" variant="contained" sx={{ mt: 3 }}>
                  Gå till produktionsplanering
                </Button>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Box
                  component="h2"
                  sx={{
                    typography: "h6",
                    fontWeight: 700,
                    m: 0,
                  }}
                >
                  Dimensionering
                </Box>

                <Typography sx={{ mt: 1 }} color="text.secondary">
                  Beräkna resursbehov utifrån produktionsplanen.
                </Typography>

                <Button href="/dimensioning" variant="outlined" sx={{ mt: 3 }}>
                  Gå till dimensionering
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
