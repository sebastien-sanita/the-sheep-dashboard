"use client";

import { QueryProvider } from "./QueryProvider";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
