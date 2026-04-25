import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, ADMIN_ROLES } from "@/lib/roles";

const Body = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/i),
  kind: z.enum(["CORPORATE", "ACADEMY", "PERSONAL"]),
  logoUrl: z.string().url().nullable().optional(),
  description: z.string().nullable().optional(),
});

export async function PATCH(req: Request) {
  try {
    const m = await requireRole(ADMIN_ROLES);
    const body = Body.parse(await req.json());
    await db.workspace.update({
      where: { id: m.workspaceId },
      data: {
        name: body.name,
        slug: body.slug,
        kind: body.kind,
        logoUrl: body.logoUrl ?? null,
        description: body.description ?? null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "server_error" }, { status: 400 });
  }
}
