import { NextResponse } from "next/server";
import { z } from "zod";
import cuid from "cuid";
import { db } from "@/lib/db";
import { requireRole, AUTHOR_ROLES } from "@/lib/roles";
import { captureError } from "@/lib/logger";

const Item = z.object({
  kind: z.enum(["LESSON", "ASSESSMENT", "PROJECT"]),
  refId: z.string().min(1),
  title: z.string().min(1),
  required: z.boolean(),
});

const Body = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/i),
  title: z.string().min(1),
  subtitle: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  kind: z.enum(["PATH", "COLLECTION", "COHORT", "COMPLIANCE"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  level: z.enum(["NOVICE", "WORKING", "PROFICIENT", "EXPERT"]),
  estimatedMinutes: z.number().int().nullable().optional(),
  items: z.array(Item).default([]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const m = await requireRole(AUTHOR_ROLES);
    const body = Body.parse(await req.json());
    const path = await db.path.findFirst({ where: { id, workspaceId: m.workspaceId } });
    if (!path) return NextResponse.json({ error: "not_found" }, { status: 404 });

    await db.path.update({
      where: { id },
      data: {
        slug: body.slug,
        title: body.title,
        subtitle: body.subtitle ?? null,
        summary: body.summary ?? null,
        kind: body.kind,
        status: body.status,
        level: body.level,
        estimatedMinutes: body.estimatedMinutes ?? null,
        publishedAt: body.status === "PUBLISHED" ? (path.publishedAt ?? new Date()) : null,
      },
    });

    await db.pathItem.deleteMany({ where: { pathId: id } });
    if (body.items.length) {
      await db.pathItem.createMany({
        data: body.items.map((it, i) => ({
          id: cuid(),
          pathId: id,
          order: i + 1,
          kind: it.kind,
          lessonId: it.kind === "LESSON" ? it.refId : null,
          assessmentId: it.kind === "ASSESSMENT" ? it.refId : null,
          projectId: it.kind === "PROJECT" ? it.refId : null,
          title: it.title,
          required: it.required,
        })),
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    captureError(e, { route: "admin/paths PATCH" });
    const msg = e instanceof Error ? e.message : "server_error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
