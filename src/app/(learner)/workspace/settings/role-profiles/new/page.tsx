import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { checkRole, ADMIN_ROLES } from "@/lib/roles";
import { RoleProfileForm } from "@/components/admin/role-profile-form";

export default async function NewRoleProfile() {
  const m = await checkRole(ADMIN_ROLES);
  if (!m) redirect("/workspace");
  const skills = await db.skill.findMany({
    where: { OR: [{ workspaceId: m.workspaceId }, { workspaceId: null }] },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/workspace/settings" className="text-xs text-muted-foreground hover:text-foreground">← Settings</Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight">New role profile</h1>
      <RoleProfileForm skills={skills} />
    </div>
  );
}
