"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { login } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLogin = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      authLogin(response);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erreur de connexion",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-800 p-8 shadow-xl">
        <div className="mb-1 text-center text-2xl">🐑</div>
        <h1 className="text-center text-lg font-semibold text-slate-100">
          The Sheep
        </h1>
        <p className="mb-8 text-center text-[13px] text-slate-400">
          Pilotage Ads
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            icon={<Mail size={16} />}
            className="bg-slate-900"
          />

          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            required
            icon={<Lock size={16} />}
            className="bg-slate-900"
          />

          {error && (
            <p className="text-[13px] text-rose-400">{error}</p>
          )}

          <Button
            type="submit"
            loading={isLoading}
            className="w-full"
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
      </div>
    </div>
  );
}
