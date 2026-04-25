import { NextResponse } from "next/server";
import { z } from "zod";
import cuid from "cuid";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole, AUTHOR_ROLES } from "@/lib/roles";
import { captureError } from "@/lib/logger";

const QuestionSchema = z.object({
  kind: z.enum(["MCQ_SINGLE", "MCQ_MULTI"]),
  stem: z.string().min(1),
  points: z.number().int().min(1).max(20),
  explanation: z.string().nullable().optional(),
  skillSlug: z.string().nullable().optional(),
  choices: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    correct: z.boolean(),
    explain: z.string().optional().nullable(),
  })).min(2),
});

const Body = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/i),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  mode: z.enum(["PRACTICE", "GRADED", "PROCTORED", "ADAPTIVE"]),
  passThreshold: z.number().int().min(0).max(100),
  timeLimitSec: z.number().int().nullable().optional(),
  attemptsAllowed: z.number().int().min(1),
  shuffleQuestions: z.boolean(),
  skillIds: z.array(z.string()).default([]),
  questions: z.array(QuestionSchema).min(1),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const m = await requireRole(AUTHOR_ROLES);
    const body = Body.parse(await req.json());
    const a = await db.assessment.findFirst({ where: { id, workspaceId: m.workspaceId } });
    if (!a) return NextResponse.json({ error: "not_found" }, { status: 404 });

    await db.assessment.update({
      where: { id },
      data: {
        slug: body.slug,
        title: body.title,
        description: body.description ?? null,
        mode: body.mode,
        passThreshold: body.passThreshold,
        timeLimitSec: body.timeLimitSec ?? null,
        attemptsAllowed: body.attemptsAllowed,
        shuffleQuestions: body.shuffleQuestions,
      },
    });
    await db.assessmentSkill.deleteMany({ where: { assessmentId: id } });
    if (body.skillIds.length) {
      await db.assessmentSkill.createMany({
        data: body.skillIds.map((sid) => ({ id: cuid(), assessmentId: id, skillId: sid, awardsAtLevel: "WORKING", weight: 1.0 })),
      });
    }
    // Replace question set wholesale. Existing attempts retain their answers
    // via foreign-key cascade-on-delete, but we want to keep history — so
    // instead we soft-delete by bumping version. For simplicity in this
    // build, we delete and recreate; in production attempts would block.
    await db.question.deleteMany({ where: { assessmentId: id } });
    await db.question.createMany({
      data: body.questions.map((q, i) => ({
        id: cuid(),
        assessmentId: id,
        order: i + 1,
        kind: q.kind,
        stem: q.stem,
        payload: { choices: q.choices } as unknown as Prisma.InputJsonValue,
        points: q.points,
        explanation: q.explanation ?? null,
        skillSlug: q.skillSlug ?? null,
      })),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    captureError(e, { route: "admin/assessments PATCH" });
    const msg = e instanceof Error ? e.message : "server_error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
