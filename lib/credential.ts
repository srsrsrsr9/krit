import cuid from "cuid";
import { db } from "./db";
import { recordEvent } from "./lrs";

/**
 * Issue the path's credential to the learner if the path has one and they
 * haven't already received it. Snapshots evidence at issue time.
 */
export async function maybeIssueCredential(userId: string, pathId: string) {
  const credential = await db.credential.findUnique({ where: { pathId } });
  if (!credential) return null;

  const existing = await db.issuedCredential.findFirst({
    where: { credentialId: credential.id, userId, revokedAt: null },
  });
  if (existing) return existing;

  const path = await db.path.findUnique({
    where: { id: pathId },
    include: {
      items: { include: { lesson: { include: { skills: true } }, assessment: { include: { skills: true } } } },
    },
  });
  if (!path) return null;

  // Collect evidence summary per skill touched by the path.
  const skillIds = new Set<string>();
  for (const i of path.items) {
    if (i.lesson) for (const ls of i.lesson.skills) skillIds.add(ls.skillId);
    if (i.assessment) for (const as of i.assessment.skills) skillIds.add(as.skillId);
  }
  const skills = await db.skill.findMany({ where: { id: { in: [...skillIds] } } });
  const states = await db.skillState.findMany({
    where: { userId, skillId: { in: [...skillIds] } },
  });
  const counts = await db.evidence.groupBy({
    by: ["skillId"],
    where: { userId, skillId: { in: [...skillIds] } },
    _count: true,
  });
  const countById = Object.fromEntries(counts.map((c) => [c.skillId, c._count]));

  const evidenceBlob = skills.map((s) => ({
    skillName: s.name,
    level: states.find((st) => st.skillId === s.id)?.level ?? "WORKING",
    count: countById[s.id] ?? 0,
  }));

  const verificationCode = `KRT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const issued = await db.issuedCredential.create({
    data: {
      id: cuid(),
      credentialId: credential.id,
      userId,
      verificationCode,
      evidenceBlob,
    },
  });

  await recordEvent({
    userId,
    workspaceId: path.workspaceId,
    verb: "earned",
    objectType: "credential",
    objectId: credential.id,
    context: { issuedCredentialId: issued.id },
  });

  return issued;
}
