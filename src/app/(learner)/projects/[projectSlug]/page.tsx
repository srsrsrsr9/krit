import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser, currentMembership } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectSubmitForm } from "@/components/projects/submit-form";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface RubricItem {
  criterion: string;
  levels: { label: string; points: number }[];
}

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectSlug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { projectSlug } = await params;
  const sp = await searchParams;
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const m = await currentMembership();

  const project = await db.projectBrief.findFirst({
    where: { slug: projectSlug, ...(m ? { workspaceId: m.workspaceId } : {}) },
  });
  if (!project) notFound();

  const existing = await db.submission.findFirst({
    where: { projectId: project.id, userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const rubric = (project.rubric as unknown as RubricItem[]) ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <article className="space-y-6">
        <Link href={sp.from ? `/learn/${sp.from}` : "/home"} className="text-xs text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
        <div className="space-y-2">
          <Badge variant="secondary">Project</Badge>
          <h1 className="font-display text-4xl font-semibold tracking-tight">{project.title}</h1>
        </div>
        <div className="prose-krit">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.prompt}</ReactMarkdown>
        </div>
        <ProjectSubmitForm
          projectId={project.id}
          pathSlug={sp.from ?? null}
          existing={existing ? {
            id: existing.id,
            content: existing.content,
            status: existing.status,
            reviewNotes: existing.reviewNotes,
            rubricScore: existing.rubricScore as Record<string, number> | null,
          } : null}
        />
      </article>
      <aside>
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rubric</div>
            {rubric.map((r, i) => (
              <div key={i} className="space-y-1">
                <div className="text-sm font-medium">{r.criterion}</div>
                <ul className="space-y-0.5 text-xs text-muted-foreground">
                  {r.levels.map((l, j) => (
                    <li key={j}>
                      {l.points} pt — {l.label}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
