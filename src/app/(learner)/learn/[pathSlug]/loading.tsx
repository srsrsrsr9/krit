export default function PathLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-3 w-16 rounded bg-muted" />
      <header className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-3">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-12 w-3/4 rounded bg-muted" />
          <div className="h-5 w-1/2 rounded bg-muted/70" />
          <div className="h-11 w-48 rounded-md bg-muted" />
        </div>
        <div className="h-40 rounded-xl border border-border bg-card" />
      </header>
      <div className="space-y-2">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-16 rounded-lg border border-border bg-card" />
        ))}
      </div>
    </div>
  );
}
