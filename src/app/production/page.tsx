import { Box, Container, Stack, Typography } from "@mui/material";
import { ProductionRowsTable } from "./components/tables/productionRowsTable";

export default function ProductionPage() {
    return (
        <Box component="main" sx={{ minHeight: "100vh", py: 6 }}>
            <Container maxWidth="lg">
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                            Produktionsplanering
                        </Typography>

                        <Typography sx={{ mt: 2 }} color="text.secondary">
                            Här visas produktionsrader för den valda produktionsplanen.
                        </Typography>
                    </Box>

                    <ProductionRowsTable />
                </Stack>
            </Container>
        </Box>
    );
}