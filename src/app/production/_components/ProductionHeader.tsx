import { Box, Button, Stack, Typography } from "@mui/material";

export function ProductionHeader() {
  return (
    <Box
      sx={{
        bgcolor: "#005883",
        color: "white",
        px: 2,
        py: 1.5,
        borderRadius: 1,
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Stack spacing={0.5}>
          <Button
            variant="outlined"
            size="small"
            sx={{ color: "white", borderColor: "white" }}
          >
            1. Välj Tema
          </Button>

          <Button
            variant="outlined"
            size="small"
            sx={{ color: "white", borderColor: "white" }}
          >
            2. Välj Verksamhet
          </Button>
        </Stack>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            Vårdhändelser
          </Typography>

          <Typography variant="h5" component="p">
            Öppenvård
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            sx={{ color: "white", borderColor: "white" }}
          >
            Vårdhändelser - Slutenvård
          </Button>

          <Button
            variant="outlined"
            size="small"
            sx={{ color: "white", borderColor: "white" }}
          >
            Periodiseringsnycklar
          </Button>

          <Button
            variant="outlined"
            size="small"
            sx={{ color: "white", borderColor: "white" }}
          >
            Flerårs-prognos
          </Button>
        </Stack>

        <Box
          sx={{
            bgcolor: "white",
            color: "text.primary",
            px: 2,
            py: 1,
            borderRadius: 1,
            minWidth: 190,
          }}
        >
          <Typography variant="caption">VersionPDP</Typography>
          <Typography sx={{ fontWeight: 700 }}>
            Produktionsplanering 2027
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
