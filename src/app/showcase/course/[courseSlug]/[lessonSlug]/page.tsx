import { notFound } from "next/navigation";
import { LessonStoryPlayer } from "@/components/lesson/lesson-story-player";
import { loadShowcaseCourse } from "@/lib/showcase-course-loader";

export default async function CourseLessonPage({
  params,
}: { params: Promise<{ courseSlug: string; lessonSlug: string }> }) {
  const { courseSlug, lessonSlug } = await params;
  const course = await loadShowcaseCourse(courseSlug);
  if (!course) notFound();

  const idx = course.lessons.findIndex((l) => l.slug === lessonSlug);
  if (idx < 0) notFound();
  const lesson = course.lessons[idx]!;
  const next = course.lessons[idx + 1];

  const courseHref = `/showcase/course/${course.slug}`;
  const nextHref = next ? `${courseHref}/${next.slug}` : courseHref;
  // Player UI shows this on the win-screen "Finish" button.
  const nextLabel = next
    ? `NEXT · ${next.title.toUpperCase()}`
    : "BACK TO COURSE";

  return (
    <LessonStoryPlayer
      blocks={lesson.blocks}
      lessonTitle={lesson.title}
      lessonSubtitle={lesson.subtitle}
      pathTitle={course.title}
      closeHref={courseHref}
      nextHref={nextHref}
      nextLabel={nextLabel}
      notesHref={`${courseHref}/notes/${lesson.slug}`}
    />
  );
}
