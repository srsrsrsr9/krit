import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { checkRole, AUTHOR_ROLES } from "@/lib/roles";
import { AssessmentForm } from "@/components/author/assessment-form";

interface ChoiceShape { id: string; label: string; correct: boolean; explain?: string }

export default async function EditAssessment({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = await checkRole(AUTHOR_ROLES);
  if (!m) redirect("/workspace");
  const a = await db.assessment.findFirst({
    where: { slug, workspaceId: m.workspaceId },
    include: {
      skills: true,
      questions: { orderBy: { order: "asc" } },
    },
  });
  if (!a) notFound();
  const skills = await db.skill.findMany({
    where: { OR: [{ workspaceId: m.workspaceId }, { workspaceId: null }] },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-4xl space-y-4">
      <Link href="/workspace/assessments" className="text-xs text-muted-foreground hover:text-foreground">← Assessments</Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Edit assessment</h1>
      <AssessmentForm
        skills={skills}
        initial={{
          id: a.id,
          slug: a.slug,
          title: a.title,
          description: a.description,
          mode: a.mode,
          passThreshold: a.passThreshold,
          timeLimitSec: a.timeLimitSec,
          attemptsAllowed: a.attemptsAllowed,
          shuffleQuestions: a.shuffleQuestions,
          skillIds: a.skills.map((s) => s.skillId),
          questions: a.questions.map((q) => ({
            kind: q.kind === "MCQ_MULTI" ? "MCQ_MULTI" : "MCQ_SINGLE",
            stem: q.stem,
            points: q.points,
            explanation: q.explanation ?? "",
            skillSlug: q.skillSlug,
            choices: ((q.payload as { choices?: ChoiceShape[] })?.choices ?? []) as ChoiceShape[],
          })),
        }}
      />
    </div>
  );
}
