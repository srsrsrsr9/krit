import Link from "next/link";
import { currentMembership } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMinutes } from "@/lib/utils";
import { LEVEL_LABEL } from "@/lib/progress";
import { AUTHOR_ROLES } from "@/lib/roles";
import { BookOpen, Pencil, Plus } from "lucide-react";

export default async function WorkspacePaths() {
  const m = await currentMembership();
  if (!m) return null;

  const paths = await db.path.findMany({
    where: { workspaceId: m.workspaceId },
    include: {
      items: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const canAuthor = AUTHOR_ROLES.includes(m.role);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Paths are curated sequences over your skill graph.
        </p>
        {canAuthor && (
          <Link href="/workspace/paths/new">
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />New path</Button>
          </Link>
        )}
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Path</th>
              <th className="px-4 py-2 font-medium">Level</th>
              <th className="px-4 py-2 font-medium">Items</th>
              <th className="px-4 py-2 font-medium">Duration</th>
              <th className="px-4 py-2 font-medium">Enrolled</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {paths.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-accent/30">
                <td className="px-4 py-3">
                  <Link href={`/learn/${p.slug}`} className="flex items-center gap-2 font-medium hover:underline">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    {p.title}
                  </Link>
                  {p.subtitle && <div className="text-xs text-muted-foreground">{p.subtitle}</div>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{LEVEL_LABEL[p.level]}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.items.length}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {p.estimatedMinutes ? formatMinutes(p.estimatedMinutes) : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p._count.enrollments}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      p.status === "PUBLISHED" ? "success" : p.status === "DRAFT" ? "outline" : "secondary"
                    }
                  >
                    {p.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {canAuthor && (
                    <Link href={`/workspace/paths/${p.slug}/edit`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {paths.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No paths yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
