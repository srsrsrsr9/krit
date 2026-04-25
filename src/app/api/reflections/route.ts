import { NextResponse } from "next/server";
import { z } from "zod";
import cuid from "cuid";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { captureError } from "@/lib/logger";

const Body = z.object({
  lessonId: z.string().min(1),
  prompt: z.string().min(1).max(500),
  content: z.string().max(10_000),
});

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const { lessonId, prompt, content } = Body.parse(await req.json());
    const promptKey = prompt.slice(0, 200);
    await db.reflection.upsert({
      where: { userId_lessonId_prompt: { userId: user.id, lessonId, prompt: promptKey } },
      create: { id: cuid(), userId: user.id, lessonId, prompt: promptKey, content },
      update: { content },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    captureError(e, { route: "reflections" });
    return NextResponse.json({ error: e instanceof Error ? e.message : "server_error" }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const url = new URL(req.url);
    const lessonId = url.searchParams.get("lessonId");
    if (!lessonId) return NextResponse.json({ error: "missing lessonId" }, { status: 400 });
    const rows = await db.reflection.findMany({
      where: { userId: user.id, lessonId },
      select: { prompt: true, content: true },
    });
    return NextResponse.json({ reflections: rows });
  } catch (e) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
