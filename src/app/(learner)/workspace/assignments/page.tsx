import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { checkRole, MANAGER_ROLES } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default async function AssignmentsList() {
  const m = await checkRole(MANAGER_ROLES);
  if (!m) redirect("/workspace");

  const assignments = await db.assignment.findMany({
    where: { workspaceId: m.workspaceId },
    include: { path: true, assignedTo: true, assignedBy: true },
    orderBy: [{ status: "asc" }, { dueAt: { sort: "asc", nulls: "last" } }],
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Top-down learning assignments. Compliance flag enables stricter due-date tracking.</p>
        <Link href="/workspace/assignments/new"><Button size="sm" className="gap-1"><Plus className="h-4 w-4" />New assignment</Button></Link>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Person</th>
              <th className="px-4 py-2 font-medium">Path</th>
              <th className="px-4 py-2 font-medium">Reason</th>
              <th className="px-4 py-2 font-medium">Due</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => {
              const overdue = a.dueAt && a.dueAt < new Date() && a.status !== "COMPLETED";
              return (
                <tr key={a.id} className="border-t border-border hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{a.assignedTo.name}</div>
                    <div className="text-xs text-muted-foreground">by {a.assignedBy.name}</div>
                  </td>
                  <td className="px-4 py-3">{a.path.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {a.compliance && <Badge variant="warn" className="mr-2">Compliance</Badge>}
                    {a.reason}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {a.dueAt ? (
                      <span className={overdue ? "text-destructive" : ""}>
                        {a.dueAt.toLocaleDateString()}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3"><Badge variant={a.status === "COMPLETED" ? "success" : a.status === "OVERDUE" || overdue ? "destructive" : "outline"}>{overdue && a.status !== "COMPLETED" ? "OVERDUE" : a.status}</Badge></td>
                </tr>
              );
            })}
            {assignments.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No assignments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
