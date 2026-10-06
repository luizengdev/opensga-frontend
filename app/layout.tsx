import type {Metadata} from "next";
import {JetBrains_Mono, Newsreader, Plus_Jakarta_Sans, Source_Serif_4} from "next/font/google";

import {AdminThemeProvider} from "@/components/admin/admin-theme-provider";

import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
  fallback: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "Times", "serif"],
  adjustFontFallback: false,
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OpenSGA",
  description: "Sistema de gestão acadêmica OpenSGA.",
};

export default function RootLayout({children}: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${sourceSerif.variable} ${newsreader.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <AdminThemeProvider>{children}</AdminThemeProvider>
      </body>
    </html>
  );
}
