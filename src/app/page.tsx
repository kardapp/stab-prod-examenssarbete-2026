import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Stack,
    Typography,
    TextField,
    MenuItem
} from "@mui/material";

export default function HomePage() {
    return (
        <Box
            component="main"
            sx={{
                minHeight: "100vh",
                bgcolor: "var(--page-background)",
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography variant="h5">Sektion</Typography>

                        <TextField
                            select
                            label="Välj sektion"
                            defaultValue=""
                            sx={{ minWidth: 180 }}
                        >
                            <MenuItem value="sektion-1">Sektion 1</MenuItem>
                            <MenuItem value="sektion-2">Sektion 2</MenuItem>
                            <MenuItem value="sektion-3">Sektion 3</MenuItem>
                        </TextField>
                    </Box>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                        <Card
                            sx={{
                                flex: 1,
                                bgcolor: "var(--section-background)",
                            }}
                        >
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
                                    Planera vårdhändelser.
                                </Typography>

                                <Button
                                    href="/production-planning/outpatient"
                                    variant="contained"
                                    sx={{ mt: 3 }}
                                >
                                    Gå till produktionsplanering
                                </Button>
                            </CardContent>
                        </Card>

                        <Card
                            sx={{
                                flex: 1,
                                bgcolor: "var(--section-background)",
                            }}
                        >
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
                                    Beräkna resursbehov.
                                </Typography>

                                <Button
                                    href="/outpatient/dimensioning"
                                    variant="outlined"
                                    sx={{ mt: 3 }}
                                >
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
