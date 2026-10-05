import type {Metadata} from "next";
import {JetBrains_Mono, Playfair_Display, Plus_Jakarta_Sans} from "next/font/google";

import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
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
      className={`${plusJakarta.variable} ${playfair.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
