import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/providers/AppProvider";

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
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased" style={{ background: "var(--color-bg-base)", color: "var(--color-text-primary)" }}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
