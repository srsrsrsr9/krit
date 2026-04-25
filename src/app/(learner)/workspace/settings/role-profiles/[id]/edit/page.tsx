import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { checkRole, ADMIN_ROLES } from "@/lib/roles";
import { RoleProfileForm } from "@/components/admin/role-profile-form";

export default async function EditRoleProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await checkRole(ADMIN_ROLES);
  if (!m) redirect("/workspace");
  const rp = await db.roleProfile.findFirst({
    where: { id, workspaceId: m.workspaceId },
    include: { requirements: true },
  });
  if (!rp) notFound();
  const skills = await db.skill.findMany({
    where: { OR: [{ workspaceId: m.workspaceId }, { workspaceId: null }] },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/workspace/settings" className="text-xs text-muted-foreground hover:text-foreground">← Settings</Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Edit role profile</h1>
      <RoleProfileForm
        skills={skills}
        initial={{
          id: rp.id,
          name: rp.name,
          description: rp.description,
          requirements: rp.requirements.map((r) => ({ skillId: r.skillId, requiredLevel: r.requiredLevel })),
        }}
      />
    </div>
  );
}
