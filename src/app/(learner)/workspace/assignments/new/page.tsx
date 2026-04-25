import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { checkRole, MANAGER_ROLES } from "@/lib/roles";
import { AssignmentForm } from "@/components/admin/assignment-form";

export default async function NewAssignment() {
  const m = await checkRole(MANAGER_ROLES);
  if (!m) redirect("/workspace");
  const [paths, members] = await Promise.all([
    db.path.findMany({ where: { workspaceId: m.workspaceId, status: "PUBLISHED" }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
    db.membership.findMany({ where: { workspaceId: m.workspaceId }, include: { user: true }, orderBy: { joinedAt: "asc" } }),
  ]);
  const people = members.map((mem) => ({ id: mem.userId, name: mem.user.name, email: mem.user.email, role: mem.role }));
  return (
    <div className="space-y-4">
      <Link href="/workspace/assignments" className="text-xs text-muted-foreground hover:text-foreground">← Assignments</Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight">New assignment</h1>
      <AssignmentForm paths={paths} people={people} />
    </div>
  );
}
