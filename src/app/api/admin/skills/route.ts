import { NextResponse } from "next/server";
import { z } from "zod";
import cuid from "cuid";
import { db } from "@/lib/db";
import { requireRole, AUTHOR_ROLES } from "@/lib/roles";
import { captureError } from "@/lib/logger";

const Body = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/i),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  decayDays: z.number().int().min(0).nullable().optional(),
  prerequisiteIds: z.array(z.string()).default([]),
});

export async function POST(req: Request) {
  try {
    const m = await requireRole(AUTHOR_ROLES);
    const body = Body.parse(await req.json());
    const skill = await db.skill.create({
      data: {
        id: cuid(),
        workspaceId: m.workspaceId,
        slug: body.slug,
        name: body.name,
        description: body.description ?? null,
        category: body.category ?? null,
        decayDays: body.decayDays ?? null,
      },
    });
    if (body.prerequisiteIds.length) {
      await db.skillPrerequisite.createMany({
        data: body.prerequisiteIds.map((pid) => ({
          id: cuid(),
          skillId: skill.id,
          prereqId: pid,
        })),
      });
    }
    return NextResponse.json({ ok: true, id: skill.id });
  } catch (e) {
    captureError(e, { route: "admin/skills POST" });
    const msg = e instanceof Error ? e.message : "server_error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
