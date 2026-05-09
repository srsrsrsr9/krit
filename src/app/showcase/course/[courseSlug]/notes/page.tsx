import { notFound } from "next/navigation";
import Link from "next/link";
import { loadShowcaseCourse } from "@/lib/showcase-course-loader";
import { CourseFieldGuide } from "@/components/lesson/course-field-guide";

export default async function CourseNotesPage({
  params,
}: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const course = await loadShowcaseCourse(courseSlug);
  if (!course) notFound();

  return (
    <div className="min-h-dvh bg-stone-100 py-6 print:bg-white print:py-0">
      {/* Top bar — hidden when printing */}
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between px-5 text-sm print:hidden">
        <Link
          href={`/showcase/course/${course.slug}`}
          className="font-mono text-[11px] tracking-[0.18em] text-slate-500 hover:text-slate-900"
        >
          ← BACK TO COURSE
        </Link>
        <PrintButton />
      </div>

      <CourseFieldGuide course={course} />
    </div>
  );
}

// Client-side print button — uses the browser's native print dialog,
// which gives the user "Save as PDF" on every desktop + mobile browser.
function PrintButton() {
  return (
    <form action="javascript:window.print()">
      <button
        type="submit"
        className="rounded-full bg-slate-900 px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.18em] text-white transition-transform hover:translate-x-0.5"
      >
        DOWNLOAD AS PDF ↓
      </button>
    </form>
  );
}
