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

export async function POST(req: Request) {
  try {
    const m = await requireRole(AUTHOR_ROLES);
    const body = Body.parse(await req.json());
    // Validate at least one correct per question.
    for (const q of body.questions) {
      const correct = q.choices.filter((c) => c.correct).length;
      if (correct < 1) return NextResponse.json({ error: `Question "${q.stem.slice(0, 40)}…" has no correct choice` }, { status: 400 });
      if (q.kind === "MCQ_SINGLE" && correct !== 1) return NextResponse.json({ error: `Single-answer question must have exactly one correct choice` }, { status: 400 });
    }

    const id = cuid();
    await db.assessment.create({
      data: {
        id,
        workspaceId: m.workspaceId,
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
    if (body.skillIds.length) {
      await db.assessmentSkill.createMany({
        data: body.skillIds.map((sid) => ({ id: cuid(), assessmentId: id, skillId: sid, awardsAtLevel: "WORKING", weight: 1.0 })),
      });
    }
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
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    captureError(e, { route: "admin/assessments POST" });
    const msg = e instanceof Error ? e.message : "server_error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
