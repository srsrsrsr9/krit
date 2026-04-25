export default function CatalogLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-32 rounded bg-muted" />
        <div className="h-4 w-72 rounded bg-muted/70" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-56 rounded-xl border border-border bg-card" />)}
      </div>
    </div>
  );
}
