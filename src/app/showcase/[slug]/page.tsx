import fs from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import { LessonBlocks } from "@/lib/content/blocks";
import { LessonStoryPlayer } from "@/components/lesson/lesson-story-player";

interface ShowcaseLesson {
  title: string;
  subtitle?: string;
  pathTitle?: string;
  blocks: unknown;
}

async function loadShowcase(slug: string): Promise<ShowcaseLesson | null> {
  // Allow only safe slugs — defence-in-depth against path traversal.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const filePath = path.join(process.cwd(), "courses", "showcase", `${slug}.json`);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as ShowcaseLesson;
  } catch {
    return null;
  }
}

export default async function ShowcasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = await loadShowcase(slug);
  if (!lesson) notFound();

  const blocks = LessonBlocks.parse(lesson.blocks);

  return (
    <LessonStoryPlayer
      blocks={blocks}
      lessonTitle={lesson.title}
      lessonSubtitle={lesson.subtitle}
      pathTitle={lesson.pathTitle ?? "Story Mode"}
      closeHref="/home"
    />
  );
}
