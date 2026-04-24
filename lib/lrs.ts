import cuid from "cuid";
import { db } from "./db";
import type { Prisma } from "@prisma/client";

export type LrsVerb =
  | "enrolled"
  | "started"
  | "viewed"
  | "completed"
  | "answered"
  | "submitted"
  | "passed"
  | "failed"
  | "attempted"
  | "reviewed"
  | "earned"
  | "expired";

export type LrsObjectType =
  | "path"
  | "lesson"
  | "assessment"
  | "attempt"
  | "question"
  | "project"
  | "submission"
  | "credential"
  | "live_session";

export interface RecordEventInput {
  userId: string;
  workspaceId?: string | null;
  verb: LrsVerb;
  objectType: LrsObjectType;
  objectId: string;
  result?: Prisma.InputJsonValue;
  context?: Prisma.InputJsonValue;
}

export async function recordEvent(input: RecordEventInput) {
  return db.lrsEvent.create({
    data: {
      id: cuid(),
      userId: input.userId,
      workspaceId: input.workspaceId ?? null,
      verb: input.verb,
      objectType: input.objectType,
      objectId: input.objectId,
      result: input.result,
      context: input.context,
    },
  });
}

export async function recordEvents(inputs: RecordEventInput[]) {
  if (inputs.length === 0) return { count: 0 };
  return db.lrsEvent.createMany({
    data: inputs.map((i) => ({
      id: cuid(),
      userId: i.userId,
      workspaceId: i.workspaceId ?? null,
      verb: i.verb,
      objectType: i.objectType,
      objectId: i.objectId,
      result: i.result as Prisma.InputJsonValue | undefined,
      context: i.context as Prisma.InputJsonValue | undefined,
    })),
  });
}
