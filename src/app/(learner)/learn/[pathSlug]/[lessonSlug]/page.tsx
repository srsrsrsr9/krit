import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import cuid from "cuid";
import { currentUser, currentMembership } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordEvent } from "@/lib/lrs";
import { LessonBlocks } from "@/lib/content/blocks";
import { BlockRenderer } from "@/components/lesson/block-renderer";
import { CompleteLessonButton } from "@/components/lesson/complete-button";
import { TutorSidebar } from "@/components/tutor/tutor-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { formatMinutes } from "@/lib/utils";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ pathSlug: string; lessonSlug: string }>;
}) {
  const { pathSlug, lessonSlug } = await params;
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const m = await currentMembership();

  const path = await db.path.findFirst({
    where: { slug: pathSlug, ...(m ? { workspaceId: m.workspaceId } : {}) },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: { lesson: true, assessment: true, project: true },
      },
    },
  });
  if (!path) notFound();

  const lesson = await db.lesson.findFirst({
    where: { slug: lessonSlug, workspaceId: path.workspaceId },
    include: { skills: { include: { skill: true } } },
  });
  if (!lesson) notFound();

  // Ensure enrollment + lessonProgress start row.
  let enrollment = await db.enrollment.findUnique({
    where: { userId_pathId: { userId: user.id, pathId: path.id } },
  });
  if (!enrollment) {
    enrollment = await db.enrollment.create({
      data: { id: cuid(), userId: user.id, pathId: path.id, lastActivityAt: new Date() },
    });
  }
  const existingProgress = await db.lessonProgress.findUnique({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId: lesson.id } },
  });
  if (!existingProgress) {
    await db.lessonProgress.create({
      data: {
        id: cuid(),
        enrollmentId: enrollment.id,
        lessonId: lesson.id,
      },
    });
    await recordEvent({
      userId: user.id,
      workspaceId: path.workspaceId,
      verb: "started",
      objectType: "lesson",
      objectId: lesson.id,
      context: { pathId: path.id },
    });
  } else {
    await recordEvent({
      userId: user.id,
      workspaceId: path.workspaceId,
      verb: "viewed",
      objectType: "lesson",
      objectId: lesson.id,
      context: { pathId: path.id },
    });
  }

  const blocks = LessonBlocks.parse(lesson.blocks);

  const itemIndex = path.items.findIndex((i) => i.lessonId === lesson.id);
  const prevItem = itemIndex > 0 ? path.items[itemIndex - 1] : null;
  const nextItem = itemIndex >= 0 && itemIndex < path.items.length - 1 ? path.items[itemIndex + 1] : null;

  const nextHref = nextItem ? linkFor(nextItem, path.slug) : null;
  const prevHref = prevItem ? linkFor(prevItem, path.slug) : null;

  const summary = blocks
    .filter((b) => b.type === "markdown" || b.type === "heading" || b.type === "keyTakeaways")
    .slice(0, 12)
    .map((b) => {
      if (b.type === "heading") return `# ${b.text}`;
      if (b.type === "markdown") return b.md.slice(0, 400);
      if (b.type === "keyTakeaways") return `Key takeaways: ${b.points.join("; ")}`;
      return "";
    })
    .join("\n\n");

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <article className="max-w-3xl space-y-6">
        <Link href={`/learn/${pathSlug}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> {path.title}
        </Link>

        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {lesson.skills.map((ls) => (
              <Badge key={ls.skill.id} variant="secondary">
                {ls.skill.name}
              </Badge>
            ))}
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-balance">{lesson.title}</h1>
          {lesson.subtitle && <p className="text-lg text-muted-foreground">{lesson.subtitle}</p>}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatMinutes(lesson.estimatedMinutes)} · Lesson {itemIndex + 1} of {path.items.length}
          </div>
        </header>

        <BlockRenderer blocks={blocks} />

        <Card>
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {prevHref && (
                <Link href={prevHref}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ArrowLeft className="h-3.5 w-3.5" /> Previous
                  </Button>
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2">
              <CompleteLessonButton
                lessonId={lesson.id}
                pathSlug={path.slug}
                nextHref={nextHref}
                alreadyComplete={Boolean(existingProgress?.completedAt)}
              />
              {nextHref && (
                <Link href={nextHref}>
                  <Button variant="ghost" size="sm" className="gap-1">
                    Skip <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </article>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <TutorSidebar
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          lessonSummary={summary}
          pathTitle={path.title}
          skillHints={lesson.skills.map((s) => s.skill.name)}
        />
      </aside>
    </div>
  );
}

function linkFor(
  item: { kind: string; lesson: { slug: string } | null; assessment: { slug: string } | null; project: { slug: string } | null },
  pathSlug: string,
): string {
  if (item.kind === "LESSON" && item.lesson) return `/learn/${pathSlug}/${item.lesson.slug}`;
  if (item.kind === "ASSESSMENT" && item.assessment) return `/assess/${item.assessment.slug}?from=${pathSlug}`;
  if (item.kind === "PROJECT" && item.project) return `/projects/${item.project.slug}?from=${pathSlug}`;
  return `/learn/${pathSlug}`;
}
