export default function RootLoading() {
  return (
    <div className="flex h-screen items-center justify-center" style={{ background: "var(--color-bg-base)" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full" style={{ border: "2px solid var(--color-border-emphasis)", borderTopColor: "var(--color-accent)" }} />
        <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Chargement...</span>
      </div>
    </div>
  );
}
