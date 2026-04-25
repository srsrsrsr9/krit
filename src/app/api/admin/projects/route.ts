import { NextResponse } from "next/server";
import { z } from "zod";
import cuid from "cuid";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole, AUTHOR_ROLES } from "@/lib/roles";
import { captureError } from "@/lib/logger";

const Rubric = z.array(z.object({
  criterion: z.string().min(1),
  levels: z.array(z.object({ label: z.string().min(1), points: z.number().int().min(0) })).min(1),
}));

const Body = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/i),
  title: z.string().min(1),
  prompt: z.string().min(10),
  rubric: Rubric,
});

export async function POST(req: Request) {
  try {
    const m = await requireRole(AUTHOR_ROLES);
    const body = Body.parse(await req.json());
    const id = cuid();
    await db.projectBrief.create({
      data: {
        id,
        workspaceId: m.workspaceId,
        slug: body.slug,
        title: body.title,
        prompt: body.prompt,
        rubric: body.rubric as unknown as Prisma.InputJsonValue,
      },
    });
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    captureError(e, { route: "admin/projects POST" });
    const msg = e instanceof Error ? e.message : "server_error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
