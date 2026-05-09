import { notFound } from "next/navigation";
import Link from "next/link";
import { loadShowcaseCourse } from "@/lib/showcase-course-loader";
import { LessonFieldGuide } from "@/components/lesson/course-field-guide";

export default async function LessonNotesPage({
  params,
}: { params: Promise<{ courseSlug: string; lessonSlug: string }> }) {
  const { courseSlug, lessonSlug } = await params;
  const course = await loadShowcaseCourse(courseSlug);
  if (!course) notFound();
  const idx = course.lessons.findIndex((l) => l.slug === lessonSlug);
  if (idx < 0) notFound();
  const lesson = course.lessons[idx]!;

  return (
    <div className="min-h-dvh bg-stone-100 py-6 print:bg-white print:py-0">
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between px-5 text-sm print:hidden">
        <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-slate-500">
          <Link
            href={`/showcase/course/${course.slug}/${lesson.slug}`}
            className="hover:text-slate-900"
          >
            ← BACK TO LESSON
          </Link>
          <span className="h-1 w-1 bg-slate-300" aria-hidden />
          <Link
            href={`/showcase/course/${course.slug}/notes`}
            className="hover:text-slate-900"
          >
            FULL FIELD GUIDE
          </Link>
        </div>
        <form action="javascript:window.print()">
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.18em] text-white transition-transform hover:translate-x-0.5"
          >
            DOWNLOAD AS PDF ↓
          </button>
        </form>
      </div>

      <LessonFieldGuide
        course={course}
        lesson={lesson}
        index={idx + 1}
        totalLessons={course.lessons.length}
      />
    </div>
  );
}
