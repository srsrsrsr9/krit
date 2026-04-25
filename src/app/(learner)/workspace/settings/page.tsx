import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { checkRole, ADMIN_ROLES } from "@/lib/roles";
import { Card, CardContent } from "@/components/ui/card";
import { WorkspaceSettingsForm } from "@/components/admin/workspace-settings-form";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const m = await checkRole(ADMIN_ROLES);
  if (!m) redirect("/workspace");
  const [workspace, roleProfiles] = await Promise.all([
    db.workspace.findUnique({ where: { id: m.workspaceId } }),
    db.roleProfile.findMany({
      where: { workspaceId: m.workspaceId },
      include: { _count: { select: { requirements: true, memberships: true } } },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!workspace) return null;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Workspace</h2>
        <WorkspaceSettingsForm
          initial={{ id: workspace.id, name: workspace.name, slug: workspace.slug, kind: workspace.kind, logoUrl: workspace.logoUrl, description: workspace.description }}
        />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Role profiles</h2>
          <Link href="/workspace/settings/role-profiles/new"><Button size="sm" className="gap-1"><Plus className="h-4 w-4" />New role profile</Button></Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {roleProfiles.map((rp) => (
            <Card key={rp.id}>
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="space-y-1">
                  <div className="font-medium">{rp.name}</div>
                  {rp.description && <p className="text-xs text-muted-foreground">{rp.description}</p>}
                  <div className="flex gap-3 pt-1 text-xs text-muted-foreground">
                    <Badge variant="secondary">{rp._count.requirements} skill reqs</Badge>
                    <Badge variant="outline">{rp._count.memberships} assigned</Badge>
                  </div>
                </div>
                <Link href={`/workspace/settings/role-profiles/${rp.id}/edit`} className="text-muted-foreground hover:text-foreground">
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
          {roleProfiles.length === 0 && <p className="text-sm text-muted-foreground md:col-span-2">No role profiles yet.</p>}
        </div>
      </section>
    </div>
  );
}
