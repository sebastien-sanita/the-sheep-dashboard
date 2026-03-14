import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-950">
      <h1 className="text-4xl font-bold text-slate-50">404</h1>
      <p className="text-[14px] text-slate-400">Page introuvable</p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-primary-600 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-primary-500"
      >
        Retour au dashboard
      </Link>
    </div>
  );
}
