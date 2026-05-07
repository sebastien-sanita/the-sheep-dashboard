import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/providers/AppProvider";

// Newsreader italic for editorial emphases (v2 flux). Self-hosted by Next at build time.
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Sheep",
    template: "%s | The Sheep",
  },
  description: "Outil interne de pilotage publicitaire multi-canal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={newsreader.variable} suppressHydrationWarning>
      <body className="antialiased" style={{ background: "var(--color-bg-base)", color: "var(--color-text-primary)" }}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
