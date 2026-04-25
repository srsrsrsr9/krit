import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { checkRole, ADMIN_ROLES } from "@/lib/roles";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { LEVEL_LABEL, LEVEL_COLOR } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { MembershipForm } from "@/components/admin/membership-form";

export default async function PersonPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const m = await checkRole(ADMIN_ROLES);
  if (!m) redirect("/workspace");

  const user = await db.user.findUnique({
    where: { handle },
    include: {
      memberships: {
        where: { workspaceId: m.workspaceId },
        include: { roleProfile: { include: { requirements: { include: { skill: true } } } } },
      },
      skillStates: { include: { skill: true }, orderBy: { lastEvidenceAt: "desc" } },
      enrollments: { where: { status: "ACTIVE" }, include: { path: true } },
      credentials: { where: { revokedAt: null }, include: { credential: true } },
    },
  });
  if (!user || user.memberships.length === 0) notFound();
  const membership = user.memberships[0]!;

  const [allRoleProfiles, allManagers] = await Promise.all([
    db.roleProfile.findMany({ where: { workspaceId: m.workspaceId }, orderBy: { name: "asc" } }),
    db.membership.findMany({
      where: { workspaceId: m.workspaceId, role: { in: ["OWNER", "ADMIN", "MANAGER"] } },
      include: { user: true },
    }),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-3">
        <Link href="/workspace/people" className="text-xs text-muted-foreground hover:text-foreground">← People</Link>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <Avatar className="h-20 w-20"><AvatarFallback className="text-xl">{initials(user.name)}</AvatarFallback></Avatar>
            <div>
              <div className="font-display text-lg font-semibold">{user.name}</div>
              <div className="text-xs text-muted-foreground">@{user.handle}</div>
              <div className="mt-1 text-xs text-muted-foreground">{user.email}</div>
            </div>
            <Badge variant="outline">{membership.role}</Badge>
          </CardContent>
        </Card>
      </aside>

      <div className="space-y-6">
        <MembershipForm
          membership={{
            id: membership.id,
            role: membership.role,
            managerId: membership.managerId,
            roleProfileId: membership.roleProfileId,
          }}
          roleProfiles={allRoleProfiles.map((rp) => ({ id: rp.id, name: rp.name }))}
          managers={allManagers.filter((mg) => mg.userId !== user.id).map((mg) => ({ id: mg.userId, name: mg.user.name }))}
        />

        {membership.roleProfile && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Readiness · {membership.roleProfile.name}
            </h2>
            <div className="grid gap-2 md:grid-cols-2">
              {membership.roleProfile.requirements.map((req) => {
                const state = user.skillStates.find((s) => s.skillId === req.skillId);
                const ready = state ? rankOk(state.level, req.requiredLevel) : false;
                return (
                  <div key={req.id} className="flex items-center justify-between rounded-md border border-border p-3">
                    <div>
                      <div className="text-sm font-medium">{req.skill.name}</div>
                      <div className="text-xs text-muted-foreground">required: {LEVEL_LABEL[req.requiredLevel]}</div>
                    </div>
                    <Badge variant={ready ? "success" : "warn"}>
                      {state ? LEVEL_LABEL[state.level] : "Not started"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Skill profile</h2>
          <div className="flex flex-wrap gap-2">
            {user.skillStates.map((s) => (
              <span key={s.id} className={cn("rounded-full border px-3 py-1 text-xs", LEVEL_COLOR[s.level])}>{s.skill.name} · {LEVEL_LABEL[s.level]}</span>
            ))}
            {user.skillStates.length === 0 && <p className="text-sm text-muted-foreground">No evidence yet.</p>}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Active paths · Credentials</h2>
          <div className="grid gap-2 md:grid-cols-2">
            {user.enrollments.map((e) => (
              <div key={e.id} className="rounded-md border border-border p-3 text-sm">{e.path.title}</div>
            ))}
            {user.credentials.map((c) => (
              <div key={c.id} className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">🏆 {c.credential.title}</div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const RANK = { NOVICE: 0, WORKING: 1, PROFICIENT: 2, EXPERT: 3 } as const;
function rankOk(have: keyof typeof RANK, need: keyof typeof RANK) {
  return RANK[have] >= RANK[need];
}
