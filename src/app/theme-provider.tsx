"use client";

import type { ReactNode } from "react";
import { KarolinskaTheme } from "@/shared/theme/karolinska-theme";

type AppThemeProviderProps = {
  children: ReactNode;
};

export function AppThemeProvider(props: AppThemeProviderProps) {
  return <KarolinskaTheme>{props.children}</KarolinskaTheme>;
}
