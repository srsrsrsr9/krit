export default function WorkspaceLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="border-b border-border pb-3">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="mt-2 h-7 w-48 rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-xl border border-border bg-card" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => <div key={i} className="h-64 rounded-xl border border-border bg-card" />)}
      </div>
    </div>
  );
}
