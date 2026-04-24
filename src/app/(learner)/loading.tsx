export default function LearnerLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded bg-muted" />
        <div className="h-4 w-96 rounded bg-muted/70" />
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl border border-border bg-card" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-48 rounded-xl border border-border bg-card" />
        ))}
      </div>
    </div>
  );
}
