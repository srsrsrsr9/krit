import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LEVEL_COLOR, LEVEL_LABEL, LEVEL_RANK } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { SkillsEmptyState } from "@/components/empty-states/empty-states";

export default async function SkillsPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const states = await db.skillState.findMany({
    where: { userId: user.id },
    include: {
      skill: true,
    },
    orderBy: [{ level: "desc" }, { confidence: "desc" }],
  });
  const evidenceCounts = await db.evidence.groupBy({
    by: ["skillId"],
    where: { userId: user.id },
    _count: true,
  });
  const byId = Object.fromEntries(evidenceCounts.map((e) => [e.skillId, e._count]));

  const byCategory = new Map<string, typeof states>();
  for (const s of states) {
    const cat = s.skill.category ?? "General";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(s);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Your skill profile</h1>
        <p className="mt-1 text-muted-foreground">
          Every lesson and assessment contributes evidence. Your level grows as evidence accumulates.
        </p>
      </div>

      {states.length === 0 ? (
        <SkillsEmptyState />
      ) : (
        <div className="space-y-8">
          {[...byCategory.entries()].map(([cat, skills]) => (
            <section key={cat}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{cat}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {skills.map((s) => (
                  <Card key={s.id}>
                    <CardContent className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-medium">{s.skill.name}</div>
                          {s.skill.description && (
                            <div className="text-xs text-muted-foreground">{s.skill.description}</div>
                          )}
                        </div>
                        <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", LEVEL_COLOR[s.level])}>
                          {LEVEL_LABEL[s.level]}
                        </span>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                          <span>Level progress</span>
                          <span>{Math.round(s.confidence * 100)}%</span>
                        </div>
                        <Progress value={Math.max(25 * LEVEL_RANK[s.level] + s.confidence * 25, 5)} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{byId[s.skillId] ?? 0} pieces of evidence</span>
                        {s.nextReverificationAt && (
                          <span>Re-verify by {new Date(s.nextReverificationAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Want to share this publicly? Visit your{" "}
        <Link href="/profile" className="underline underline-offset-4">
          profile
        </Link>
        .
      </p>
    </div>
  );
}
