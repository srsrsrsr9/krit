import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LEVEL_LABEL, LEVEL_COLOR } from "@/lib/progress";
import { cn, initials } from "@/lib/utils";
import { ExternalLink, Trophy } from "lucide-react";

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const [skillStates, credentials, recent] = await Promise.all([
    db.skillState.findMany({
      where: { userId: user.id },
      include: { skill: true },
      orderBy: [{ level: "desc" }, { confidence: "desc" }],
    }),
    db.issuedCredential.findMany({
      where: { userId: user.id, revokedAt: null },
      include: { credential: true },
      orderBy: { issuedAt: "desc" },
    }),
    db.lrsEvent.findMany({
      where: { userId: user.id },
      orderBy: { occurredAt: "desc" },
      take: 15,
    }),
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-display text-lg font-semibold">{user.name}</div>
              <div className="text-xs text-muted-foreground">@{user.handle}</div>
            </div>
            {user.bio && <p className="text-sm text-muted-foreground">{user.bio}</p>}
          </CardContent>
        </Card>
      </aside>

      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Skills ({skillStates.length})</h2>
          {skillStates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No skills yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skillStates.map((s) => (
                <span key={s.id} className={cn("rounded-full border px-3 py-1 text-xs", LEVEL_COLOR[s.level])}>
                  {s.skill.name} · {LEVEL_LABEL[s.level]}
                </span>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Credentials</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {credentials.map((c) => (
              <Link key={c.id} href={`/credentials/${c.verificationCode}`} className="block">
                <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40">
                  <Trophy className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{c.credential.title}</div>
                    <div className="text-xs text-muted-foreground">{new Date(c.issuedAt).toLocaleDateString()}</div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </Link>
            ))}
            {credentials.length === 0 && <p className="text-sm text-muted-foreground">No credentials yet.</p>}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Activity</h2>
          <Card>
            <CardContent className="p-5">
              <ul className="space-y-2 text-sm">
                {recent.map((e) => (
                  <li key={e.id} className="flex items-center justify-between">
                    <span>
                      <Badge variant="outline" className="mr-2 text-[10px]">
                        {e.verb}
                      </Badge>
                      {e.objectType} · {e.objectId.slice(0, 8)}
                    </span>
                    <span className="text-xs text-muted-foreground">{new Date(e.occurredAt).toLocaleString()}</span>
                  </li>
                ))}
                {recent.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
