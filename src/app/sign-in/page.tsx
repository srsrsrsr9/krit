import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";

async function signInAs(formData: FormData) {
  "use server";
  const userId = String(formData.get("userId"));
  const workspaceId = String(formData.get("workspaceId") ?? "");
  if (!userId) throw new Error("Missing user id");
  await signIn(userId, workspaceId || undefined);
  redirect("/home");
}

export default async function SignInPage() {
  const devLoginEnabled = (process.env.KRIT_DEV_LOGIN ?? "true") === "true";
  const demoUsers = devLoginEnabled
    ? await db.user.findMany({
        orderBy: { createdAt: "asc" },
        include: {
          memberships: { include: { workspace: true } },
        },
      })
    : [];

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-16">
        <Logo className="mb-8" />
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Choose a demo account to experience Krit. In production this becomes SSO / email magic link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoUsers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No demo users yet. Run <code className="rounded bg-muted px-1 py-0.5 text-xs">npm run db:seed</code>.
              </p>
            )}
            {demoUsers.map((u) => {
              const m = u.memberships[0];
              return (
                <form key={u.id} action={signInAs}>
                  <input type="hidden" name="userId" value={u.id} />
                  {m && <input type="hidden" name="workspaceId" value={m.workspaceId} />}
                  <Button type="submit" variant="outline" className="h-auto w-full justify-between gap-4 px-4 py-3 text-left">
                    <span className="flex flex-col items-start">
                      <span className="font-medium">{u.name}</span>
                      <span className="text-xs text-muted-foreground">{u.email}</span>
                    </span>
                    {m && <Badge variant="secondary">{m.role}</Badge>}
                  </Button>
                </form>
              );
            })}
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Back to <Link href="/" className="underline underline-offset-4">homepage</Link>.
        </p>
      </div>
    </div>
  );
}
