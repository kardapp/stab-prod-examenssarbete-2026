import { Box, Container, Typography } from "@mui/material";

export default function ProductionPage() {
    return (
        <Box component="main" sx={{ minHeight: "100vh", py: 6 }}>
            <Container maxWidth="lg">
                <Typography variant="h4">Produktionsplanering</Typography>
            </Container>
        </Box>
    );
}
