"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    // Wait for hydration
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      const authed = useAuthStore.getState().isAuthenticated;
      router.replace(authed ? "/dashboard" : "/login");
    });

    if (useAuthStore.persist.hasHydrated()) {
      router.replace(isAuthenticated ? "/dashboard" : "/login");
    }

    return unsub;
  }, [isAuthenticated, router]);

  return null;
}
