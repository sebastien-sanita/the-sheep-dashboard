import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4" style={{ background: "var(--color-bg-base)" }}>
      <h1 style={{ fontSize: 48, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>404</h1>
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Page introuvable</p>
      <Link href="/dashboard" style={{ borderRadius: "var(--radius-sm)", background: "var(--color-accent)", padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "white", transition: "background var(--transition-fast)" }}>
        Retour au dashboard
      </Link>
    </div>
  );
}
