import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CredentialPublicView, type CredentialView } from "@/components/credentials/credential-public-view";
import { LEVEL_RANK } from "@/lib/progress";

interface EvidenceBlobItem {
  skillName?: string;
  level?: string;
  count?: number;
  description?: string;
}

/**
 * Public credential page. Anyone with the URL can verify.
 * Visual derives from design/Credential Page.html — bound to the
 * IssuedCredential evidence snapshot.
 */
export default async function PublicCredentialPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const issued = await db.issuedCredential.findUnique({
    where: { verificationCode: code },
    include: {
      credential: { include: { workspace: true } },
      user: true,
    },
  });
  if (!issued) notFound();

  const blob = (Array.isArray(issued.evidenceBlob) ? issued.evidenceBlob : []) as EvidenceBlobItem[];
  const skills = blob.map((e) => ({
    name: e.skillName ?? "Skill",
    level:
      typeof e.level === "string" && e.level in LEVEL_RANK
        ? LEVEL_RANK[e.level as keyof typeof LEVEL_RANK]
        : 0,
    evidence: e.count ?? 0,
    description: e.description,
  }));

  const view: CredentialView = {
    title: issued.credential.title,
    learner: issued.user.name,
    issuer: issued.credential.workspace.name,
    issueDate: issued.issuedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    expiryDate: issued.expiresAt
      ? issued.expiresAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : null,
    code: issued.verificationCode,
    skills,
  };

  return <CredentialPublicView credential={view} />;
}
