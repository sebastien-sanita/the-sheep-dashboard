export default function RootLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-primary-400" />
        <span className="text-[13px] text-slate-500">Chargement...</span>
      </div>
    </div>
  );
}
