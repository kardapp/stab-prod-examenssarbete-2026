"use client";

import { Box, Typography } from "@mui/material";

export function AppFooter() {
  return (
    <Box component="footer" sx={footerSx}>
      <Typography variant="body2" sx={footerTextSx}>
        protoype
      </Typography>
    </Box>
  );
}

const footerSx = {
  alignItems: "center",
  bgcolor: "primary.main",
  borderTop: "3px solid",
  borderTopColor: "info.main",
  bottom: 0,
  color: "primary.contrastText",
  display: "flex",
  left: 0,
  minHeight: 40,
  px: { xs: 1.5, md: 2 },
  position: "fixed",
  right: 0,
  zIndex: (theme: { zIndex: { appBar: number } }) => theme.zIndex.appBar,
};

const footerTextSx = {
  color: "inherit",
  fontSize: { xs: "0.78rem", sm: "0.875rem" },
  fontWeight: 700,
  lineHeight: 1.3,
};
