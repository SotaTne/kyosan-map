"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";
import { Footer } from "./footer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      {children}
      <Footer />
    </NextThemesProvider>
  );
}
