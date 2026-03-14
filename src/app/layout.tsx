import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/providers/AppProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} bg-slate-950 text-slate-50 antialiased`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
