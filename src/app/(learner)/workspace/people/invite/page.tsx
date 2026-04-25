import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { checkRole, ADMIN_ROLES } from "@/lib/roles";
import { InviteForm } from "@/components/admin/invite-form";

export default async function InvitePage() {
  const m = await checkRole(ADMIN_ROLES);
  if (!m) redirect("/workspace");
  const [invites, roleProfiles] = await Promise.all([
    db.workspaceInvite.findMany({
      where: { workspaceId: m.workspaceId, revokedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    db.roleProfile.findMany({
      where: { workspaceId: m.workspaceId },
      orderBy: { name: "asc" },
    }),
  ]);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/workspace/people" className="text-xs text-muted-foreground hover:text-foreground">← People</Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Invite people</h1>
      <p className="text-sm text-muted-foreground">Generate a one-time signup link to share. Anyone with the link claims a seat at the chosen role.</p>
      <InviteForm
        invites={invites.map((i) => ({
          id: i.id,
          token: i.token,
          role: i.role,
          maxUses: i.maxUses,
          uses: i.uses,
          expiresAt: i.expiresAt?.toISOString() ?? null,
          createdAt: i.createdAt.toISOString(),
          link: `${baseUrl}/join/${i.token}`,
        }))}
        roleProfiles={roleProfiles.map((rp) => ({ id: rp.id, name: rp.name }))}
        baseUrl={baseUrl}
      />
    </div>
  );
}
