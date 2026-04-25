import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser, currentMembership } from "@/lib/auth";
import { db } from "@/lib/db";

// Catalog changes infrequently — cache the page for 60s per workspace.
export const revalidate = 60;
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LEVEL_LABEL } from "@/lib/progress";
import { formatMinutes } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default async function CatalogPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const m = await currentMembership();

  const paths = await db.path.findMany({
    where: {
      status: "PUBLISHED",
      ...(m ? { workspaceId: m.workspaceId } : {}),
    },
    include: {
      items: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Catalog</h1>
        <p className="mt-1 text-muted-foreground">Paths curated for your workspace.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paths.map((p) => (
          <Link key={p.id} href={`/learn/${p.slug}`} className="group">
            <Card className="h-full overflow-hidden transition-colors group-hover:border-primary/40">
              <div className="h-28 bg-gradient-to-br from-primary/20 via-accent/20 to-background" />
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{LEVEL_LABEL[p.level]}</Badge>
                  {p.kind === "COMPLIANCE" && <Badge variant="warn">Compliance</Badge>}
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold leading-tight">{p.title}</h3>
                  {p.subtitle && <p className="mt-1 text-sm text-muted-foreground">{p.subtitle}</p>}
                </div>
                <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                  <span>{p.items.length} items · {p.estimatedMinutes ? formatMinutes(p.estimatedMinutes) : "—"}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {paths.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
              No published paths yet. Seed the SQL Foundations course with <code>npm run db:seed</code>.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
