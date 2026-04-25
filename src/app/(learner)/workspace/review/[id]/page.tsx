import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { db } from "@/lib/db";
import { checkRole, INSTRUCTOR_ROLES } from "@/lib/roles";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { ReviewForm } from "@/components/instructor/review-form";

interface RubricItem { criterion: string; levels: { label: string; points: number }[]; }

export default async function ReviewSubmission({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await checkRole(INSTRUCTOR_ROLES);
  if (!m) redirect("/workspace");

  const submission = await db.submission.findUnique({
    where: { id },
    include: { project: true, user: true },
  });
  if (!submission || submission.project.workspaceId !== m.workspaceId) notFound();
  const rubric = (submission.project.rubric as unknown as RubricItem[]) ?? [];
  const existingScores = (submission.rubricScore as Record<string, number> | null) ?? {};

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <article className="space-y-4">
        <Link href="/workspace/review" className="text-xs text-muted-foreground hover:text-foreground">← Review queue</Link>
        <header className="flex items-center gap-3">
          <Avatar className="h-10 w-10"><AvatarFallback>{initials(submission.user.name)}</AvatarFallback></Avatar>
          <div className="flex-1">
            <h1 className="font-display text-xl font-semibold">{submission.user.name}</h1>
            <p className="text-sm text-muted-foreground">{submission.project.title}</p>
          </div>
          <Badge variant={submission.status === "REVIEWED" ? "success" : "outline"}>{submission.status}</Badge>
        </header>
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Submission</div>
            <div className="prose-krit"><ReactMarkdown remarkPlugins={[remarkGfm]}>{submission.content}</ReactMarkdown></div>
          </CardContent>
        </Card>
        <details>
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted-foreground">Brief & rubric reference</summary>
          <Card className="mt-2">
            <CardContent className="p-5">
              <div className="prose-krit"><ReactMarkdown remarkPlugins={[remarkGfm]}>{submission.project.prompt}</ReactMarkdown></div>
            </CardContent>
          </Card>
        </details>
      </article>
      <aside>
        <ReviewForm
          submissionId={submission.id}
          rubric={rubric}
          existingScores={existingScores}
          existingNotes={submission.reviewNotes ?? ""}
          status={submission.status}
        />
      </aside>
    </div>
  );
}
