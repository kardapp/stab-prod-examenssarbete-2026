import type { Metadata } from "next";
import { Button } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { appRoutes } from "@/shared/routes";
import { AppThemeProvider } from "./theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planeringsverktyg",
  description:
    "Prototyp för produktionsplanering och dimensionering inom vården.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <body>
        <AppRouterCacheProvider>
          <AppThemeProvider>
            {children}
            <Button
              href={appRoutes.firstPage}
              sx={startPageButtonSx}
              variant="contained"
            >
              Till startsidan
            </Button>
          </AppThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

const startPageButtonSx = {
  bottom: 16,
  boxShadow: 3,
  position: "fixed",
  right: 16,
  zIndex: 1200,
};
