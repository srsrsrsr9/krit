import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import cuid from "cuid";
import { db } from "@/lib/db";
import { signIn, getSession } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/brand/logo";

async function joinAction(formData: FormData) {
  "use server";
  const token = String(formData.get("token") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const handle = email.split("@")[0]!.replace(/[^a-z0-9]+/gi, "").slice(0, 24).toLowerCase() || `user${Date.now().toString(36)}`;

  if (!token || !name || !email) throw new Error("Missing fields");

  const invite = await db.workspaceInvite.findUnique({ where: { token } });
  if (!invite || invite.revokedAt) throw new Error("Invite not valid");
  if (invite.expiresAt && invite.expiresAt < new Date()) throw new Error("Invite expired");
  if (invite.uses >= invite.maxUses) throw new Error("Invite has been fully used");

  // Find or create user.
  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    let h = handle;
    let suffix = 0;
    while (await db.user.findUnique({ where: { handle: h } })) {
      suffix++;
      h = `${handle}${suffix}`;
    }
    user = await db.user.create({ data: { id: cuid(), email, name, handle: h } });
  }

  // Add membership if missing.
  const existing = await db.membership.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId: invite.workspaceId } },
  });
  if (!existing) {
    await db.membership.create({
      data: {
        id: cuid(),
        userId: user.id,
        workspaceId: invite.workspaceId,
        role: invite.role,
        roleProfileId: invite.roleProfileId,
      },
    });
  }

  await db.workspaceInvite.update({ where: { id: invite.id }, data: { uses: { increment: 1 } } });

  const session = await getSession();
  session.userId = user.id;
  session.workspaceId = invite.workspaceId;
  await session.save();
  // Direct call, not signIn helper, because we want to set both fields atomically.
  redirect("/home");
}

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await db.workspaceInvite.findUnique({
    where: { token },
    include: { workspace: true },
  });
  if (!invite || invite.revokedAt) notFound();
  const expired = invite.expiresAt && invite.expiresAt < new Date();
  const used = invite.uses >= invite.maxUses;

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-16">
        <Logo className="mb-8" />
        <Card className="w-full">
          <CardContent className="space-y-4 p-6">
            <div>
              <h1 className="font-display text-xl font-semibold">Join {invite.workspace.name}</h1>
              <p className="text-sm text-muted-foreground">You've been invited as <span className="font-medium text-foreground">{invite.role}</span>.</p>
            </div>
            {expired || used ? (
              <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{expired ? "This invite has expired." : "This invite has already been used."}</p>
            ) : (
              <form action={joinAction} className="space-y-3">
                <input type="hidden" name="token" value={token} />
                <label className="block space-y-1"><span className="text-sm font-medium">Name</span><Input name="name" required /></label>
                <label className="block space-y-1"><span className="text-sm font-medium">Email</span><Input name="email" type="email" required /></label>
                <Button type="submit" className="w-full">Accept invite</Button>
              </form>
            )}
            <p className="text-center text-xs text-muted-foreground">
              Already have an account? <Link href="/sign-in" className="underline underline-offset-4">Sign in</Link>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
