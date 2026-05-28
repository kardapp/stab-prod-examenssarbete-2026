import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
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
    <html lang="sv">
      <body>
        <AppRouterCacheProvider>
          <AppThemeProvider>{children}</AppThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
