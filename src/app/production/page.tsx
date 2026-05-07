import { Box, Container, Stack } from "@mui/material";
import { ProductionHeader } from "./_components/ProductionHeader";
import { OutpatientProductionGrid } from "./_components/OutpatientProductionGrid";

export default function ProductionPage() {
  return (
    <Box component="main" sx={{ minHeight: "100vh", bgcolor: "#ffffff", p: 2 }}>
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <ProductionHeader />
          <OutpatientProductionGrid />
        </Stack>
      </Container>
    </Box>
  );
}
