import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { checkRole, AUTHOR_ROLES } from "@/lib/roles";
import { LessonForm } from "@/components/author/lesson-form";

export default async function NewLesson() {
  const m = await checkRole(AUTHOR_ROLES);
  if (!m) redirect("/workspace");
  const skills = await db.skill.findMany({
    where: { OR: [{ workspaceId: m.workspaceId }, { workspaceId: null }] },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return (
    <div className="max-w-4xl space-y-4">
      <Link href="/workspace/lessons" className="text-xs text-muted-foreground hover:text-foreground">← Lessons</Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight">New lesson</h1>
      <LessonForm skills={skills} />
    </div>
  );
}
