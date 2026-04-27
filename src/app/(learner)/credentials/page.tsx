import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, ExternalLink } from "lucide-react";
import { CredentialsEmptyState } from "@/components/empty-states/empty-states";

export default async function CredentialsPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const [issued, recommended] = await Promise.all([
    db.issuedCredential.findMany({
      where: { userId: user.id, revokedAt: null },
      include: { credential: true },
      orderBy: { issuedAt: "desc" },
    }),
    db.path.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "asc" },
      select: { slug: true, title: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Your credentials</h1>
        <p className="mt-1 text-muted-foreground">
          Every credential carries the evidence that earned it. Share the public URL as proof of your skills.
        </p>
      </div>

      {issued.length === 0 ? (
        <CredentialsEmptyState recommendedPath={recommended ?? undefined} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {issued.map((c) => (
            <Link key={c.id} href={`/credentials/${c.verificationCode}`} className="group">
              <Card className="h-full overflow-hidden transition-colors group-hover:border-primary/40">
                <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary/15 via-accent/15 to-background">
                  <Trophy className="h-10 w-10 text-primary" />
                </div>
                <CardContent className="space-y-2 p-5">
                  <div className="font-display text-lg font-semibold">{c.credential.title}</div>
                  <div className="text-xs text-muted-foreground">
                    Issued {new Date(c.issuedAt).toLocaleDateString()} · by {c.credential.issuerName}
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs text-primary">
                    View credential <ExternalLink className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
