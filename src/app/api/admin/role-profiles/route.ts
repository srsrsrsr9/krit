import { NextResponse } from "next/server";
import { z } from "zod";
import cuid from "cuid";
import { db } from "@/lib/db";
import { requireRole, ADMIN_ROLES } from "@/lib/roles";

const Body = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  requirements: z.array(z.object({
    skillId: z.string(),
    requiredLevel: z.enum(["NOVICE", "WORKING", "PROFICIENT", "EXPERT"]),
  })),
});

export async function POST(req: Request) {
  try {
    const m = await requireRole(ADMIN_ROLES);
    const body = Body.parse(await req.json());
    const id = cuid();
    await db.roleProfile.create({
      data: {
        id,
        workspaceId: m.workspaceId,
        name: body.name,
        description: body.description ?? null,
      },
    });
    if (body.requirements.length) {
      await db.roleRequirement.createMany({
        data: body.requirements.map((r) => ({ id: cuid(), roleProfileId: id, skillId: r.skillId, requiredLevel: r.requiredLevel })),
      });
    }
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "server_error" }, { status: 400 });
  }
}
