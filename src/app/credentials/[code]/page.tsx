import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import { Trophy, ShieldCheck } from "lucide-react";
import { LEVEL_LABEL } from "@/lib/progress";

/**
 * Public credential page. Anyone with the URL can verify.
 * This is what learners share on résumés and LinkedIn.
 */
export default async function PublicCredentialPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const issued = await db.issuedCredential.findUnique({
    where: { verificationCode: code },
    include: {
      credential: { include: { path: true, workspace: true } },
      user: true,
    },
  });
  if (!issued) notFound();

  const evidence = Array.isArray(issued.evidenceBlob) ? (issued.evidenceBlob as { skillName: string; level: string; count: number }[]) : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Verified credential
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <Trophy className="h-10 w-10" />
          </div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">This certifies that</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">{issued.user.name}</h1>
          <p className="mt-3 text-muted-foreground">has earned the credential</p>
          <h2 className="mt-2 font-display text-2xl">{issued.credential.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Issued by {issued.credential.issuerName} on {new Date(issued.issuedAt).toLocaleDateString()}
          </p>
          {issued.credential.description && (
            <p className="mx-auto mt-6 max-w-xl text-balance text-muted-foreground">{issued.credential.description}</p>
          )}
        </div>

        {evidence.length > 0 && (
          <Card className="mt-12">
            <CardContent className="space-y-4 p-6">
              <div className="text-sm font-semibold">Skills evidenced</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {evidence.map((e, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border border-border p-3">
                    <div>
                      <div className="text-sm font-medium">{e.skillName}</div>
                      <div className="text-xs text-muted-foreground">{e.count} piece{e.count === 1 ? "" : "s"} of evidence</div>
                    </div>
                    <Badge variant="secondary">{LEVEL_LABEL[e.level as keyof typeof LEVEL_LABEL] ?? e.level}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardContent className="flex flex-col items-start gap-2 p-6 text-xs text-muted-foreground">
            <div>
              Verification code: <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">{issued.verificationCode}</code>
            </div>
            <div>Issuer: {issued.credential.workspace.name}</div>
            <div>
              Anyone can verify this URL:{" "}
              <Link href={`/credentials/${issued.verificationCode}`} className="underline underline-offset-4">
                share this link
              </Link>
              .
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
