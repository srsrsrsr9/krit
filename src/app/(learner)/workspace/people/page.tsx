import { currentMembership } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";

export default async function WorkspacePeople() {
  const m = await currentMembership();
  if (!m) return null;

  const members = await db.membership.findMany({
    where: { workspaceId: m.workspaceId },
    include: {
      user: {
        include: {
          skillStates: true,
          enrollments: { where: { status: "ACTIVE" } },
          credentials: { where: { revokedAt: null } },
        },
      },
      roleProfile: true,
    },
    orderBy: { joinedAt: "asc" },
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Every member's skill state lives against the shared graph. Roll-ups by team and role come for free.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {members.map((mm) => (
          <Card key={mm.id}>
            <CardContent className="flex items-start gap-4 p-5">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{initials(mm.user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{mm.user.name}</div>
                  <Badge variant="outline">{mm.role}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{mm.user.email}</div>
                {mm.roleProfile && (
                  <div className="text-xs text-muted-foreground">Role: {mm.roleProfile.name}</div>
                )}
                <div className="flex gap-4 pt-2 text-xs text-muted-foreground">
                  <span>{mm.user.skillStates.length} skills</span>
                  <span>{mm.user.enrollments.length} active paths</span>
                  <span>{mm.user.credentials.length} credentials</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
