import { Box, Container, Stack } from "@mui/material";
import { DimensioningPageHeader } from "./_components/DimensioningPageHeader";
import { OutpatientMeDimensioningView } from "./_components/OutpatientMeDimensioningView";

export default function DimensioningPage() {
  return (
    <Box component="main" sx={{ minHeight: "100vh", bgcolor: "#ffffff", p: 2 }}>
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <DimensioningPageHeader />
          <OutpatientMeDimensioningView />
        </Stack>
      </Container>
    </Box>
  );
}
