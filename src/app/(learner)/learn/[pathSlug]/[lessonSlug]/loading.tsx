export default function LessonLoading() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] animate-pulse">
      <article className="max-w-3xl space-y-6">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded-full bg-muted" />
            <div className="h-5 w-20 rounded-full bg-muted/70" />
          </div>
          <div className="h-12 w-11/12 rounded bg-muted" />
          <div className="h-6 w-3/4 rounded bg-muted/70" />
        </div>
        <div className="space-y-3 pt-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 rounded bg-muted/70" style={{ width: `${70 + (i % 3) * 10}%` }} />
          ))}
        </div>
        <div className="h-40 rounded-lg border border-border bg-card" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-4 rounded bg-muted/70" style={{ width: `${60 + (i % 3) * 15}%` }} />
          ))}
        </div>
      </article>
      <aside className="hidden lg:block">
        <div className="h-96 rounded-xl border border-border bg-card" />
      </aside>
    </div>
  );
}
