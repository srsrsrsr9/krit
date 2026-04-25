import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { checkRole, AUTHOR_ROLES } from "@/lib/roles";
import { LessonForm } from "@/components/author/lesson-form";
import { LessonBlocks } from "@/lib/content/blocks";

export default async function EditLesson({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = await checkRole(AUTHOR_ROLES);
  if (!m) redirect("/workspace");
  const lesson = await db.lesson.findFirst({
    where: { slug, workspaceId: m.workspaceId },
    include: { skills: true },
  });
  if (!lesson) notFound();
  const skills = await db.skill.findMany({
    where: { OR: [{ workspaceId: m.workspaceId }, { workspaceId: null }] },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  const blocks = LessonBlocks.parse(lesson.blocks);
  return (
    <div className="max-w-4xl space-y-4">
      <Link href="/workspace/lessons" className="text-xs text-muted-foreground hover:text-foreground">← Lessons</Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Edit lesson</h1>
      <LessonForm
        skills={skills}
        initial={{
          id: lesson.id,
          slug: lesson.slug,
          title: lesson.title,
          subtitle: lesson.subtitle,
          estimatedMinutes: lesson.estimatedMinutes,
          blocks,
          skillIds: lesson.skills.map((s) => s.skillId),
        }}
      />
    </div>
  );
}
