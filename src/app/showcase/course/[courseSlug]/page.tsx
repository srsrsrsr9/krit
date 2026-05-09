import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, Users, X } from "lucide-react";
import { loadShowcaseCourse } from "@/lib/showcase-course-loader";

export default async function CourseLandingPage({
  params,
}: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const course = await loadShowcaseCourse(courseSlug);
  if (!course) notFound();

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-2xl flex-col px-5 py-6 text-slate-100 sm:px-7">
      {/* Top bar */}
      <div className="mb-8 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-slate-500">
        <Link
          href="/home"
          aria-label="Exit course"
          className="flex h-7 w-7 items-center justify-center text-slate-400 hover:text-amber-400"
        >
          <X className="h-3.5 w-3.5" />
        </Link>
        <span className="uppercase">Story · Course</span>
        <span className="w-7" aria-hidden />
      </div>

      {/* Briefing */}
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-amber-400">
          <span className="h-1.5 w-1.5 bg-amber-400" />
          BRIEFING · A KRIT COURSE
        </div>
        <h1 className="font-display text-[42px] font-black leading-[0.95] tracking-tight sm:text-[60px]">
          {course.title}
        </h1>
        {course.subtitle && (
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-300">{course.subtitle}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2.5 font-mono text-[10px] tracking-[0.18em] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            ~{course.estimatedMinutes} MIN
          </span>
          <span className="h-1 w-1 bg-slate-600" aria-hidden />
          <span>{course.lessons.length} LESSONS</span>
          {course.audience && (
            <>
              <span className="h-1 w-1 bg-slate-600" aria-hidden />
              <span className="flex items-center gap-1.5">
                <Users className="h-3 w-3" /> {course.audience.toUpperCase()}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Cast */}
      {course.cast.length > 0 && (
        <div className="mb-10">
          <div className="mb-3 font-mono text-[10px] font-bold tracking-[0.18em] text-slate-500">
            THE CAST
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {course.cast.map((c) => (
              <div key={c.id} className="rounded-md border border-slate-800 bg-slate-900/40 p-2.5">
                <div className="font-display text-sm font-bold text-slate-100">{c.name}</div>
                <div className="text-[11px] text-slate-400">{c.role}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lesson list */}
      <div className="flex-1">
        <div className="mb-3 font-mono text-[10px] font-bold tracking-[0.18em] text-slate-500">
          LESSONS · IN ORDER
        </div>
        <ol className="space-y-2">
          {course.lessons.map((lesson, i) => (
            <li key={lesson.slug} className="group/lesson relative">
              <Link
                href={`/showcase/course/${course.slug}/${lesson.slug}`}
                className="group flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3.5 pr-12 transition-all hover:border-amber-400/50 hover:bg-slate-900/70"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400/10 font-mono text-sm font-bold text-amber-400 ring-2 ring-amber-400/20">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-base font-bold leading-tight text-slate-100">
                    {lesson.title}
                  </div>
                  {lesson.subtitle && (
                    <div className="mt-0.5 truncate text-[12.5px] text-slate-400">{lesson.subtitle}</div>
                  )}
                  <div className="mt-1.5 flex items-center gap-2 font-mono text-[9px] tracking-[0.16em] text-slate-500">
                    <span>{lesson.estimatedMinutes} MIN</span>
                    {lesson.skillHints.slice(0, 2).map((h) => (
                      <span key={h} className="rounded-full border border-slate-700 px-1.5 py-0.5 text-slate-400">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-amber-400" />
              </Link>

              {/* Per-lesson notes — opt-in, sits as a small icon top-right of the row */}
              <Link
                href={`/showcase/course/${course.slug}/notes/${lesson.slug}`}
                aria-label={`Notes for ${lesson.title}`}
                title="Lesson notes (PDF)"
                className="absolute right-3 top-3 flex h-7 items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-2 font-mono text-[9px] font-bold tracking-[0.18em] text-slate-400 opacity-0 transition-all group-hover/lesson:opacity-100 hover:border-amber-400/60 hover:text-amber-400"
              >
                NOTES
              </Link>
            </li>
          ))}
        </ol>
      </div>

      {/* Start CTA */}
      <Link
        href={`/showcase/course/${course.slug}/${course.lessons[0]!.slug}`}
        className="group mt-10 flex h-14 items-center justify-between bg-amber-400 px-6 font-mono text-sm font-bold tracking-[0.2em] text-slate-950 transition-transform hover:translate-x-1"
      >
        BEGIN COURSE
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Link>

      {/* Field Guide download — sits below the start CTA, lower-key */}
      <Link
        href={`/showcase/course/${course.slug}/notes`}
        className="mt-3 flex items-center justify-between border border-slate-700 bg-slate-900/40 px-5 py-3 font-mono text-[11px] font-bold tracking-[0.18em] text-slate-300 transition-colors hover:border-amber-400/50 hover:text-amber-400"
      >
        <span>FIELD GUIDE · PDF</span>
        <span className="text-slate-500">↓</span>
      </Link>
    </main>
  );
}
