import type { Metadata } from "next";
import { Syne, JetBrains_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif-italic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "projectX — Trading Mind v0.3",
  description: "The trading mind — organized, evolving, modular.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${jetbrains.variable} ${fraunces.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
