import fs from "node:fs/promises";
import path from "node:path";
import { Course, type Course as CourseT } from "@/lib/content/course";

export async function loadShowcaseCourse(slug: string): Promise<CourseT | null> {
  // Defence-in-depth: only allow safe slugs.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const filePath = path.join(process.cwd(), "courses", "showcase", `${slug}.json`);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(raw);
    return Course.parse(json);
  } catch {
    return null;
  }
}
