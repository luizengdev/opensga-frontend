"use client";

import {ThemeProvider} from "next-themes";
import type {ReactNode} from "react";

interface AdminThemeProviderProps {
  children: ReactNode;
}

export const AdminThemeProvider = ({children}: AdminThemeProviderProps) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange enableSystem={false}>
      {children}
    </ThemeProvider>
  );
};
