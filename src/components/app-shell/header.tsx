import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";
import type { User, Workspace } from "@prisma/client";

export function AppHeader({
  user,
  workspace,
  nav,
}: {
  user: Pick<User, "name" | "handle" | "avatarUrl">;
  workspace?: Pick<Workspace, "name" | "slug"> | null;
  nav: { href: string; label: string }[];
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        {workspace && (
          <div className="hidden text-xs text-muted-foreground sm:block">
            <span className="text-foreground">{workspace.name}</span>
          </div>
        )}
        <nav className="ml-6 hidden items-center gap-1 sm:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <form action="/api/auth/sign-out" method="post">
            <Button type="submit" variant="ghost" size="sm" className="text-xs text-muted-foreground">
              Sign out
            </Button>
          </form>
          <Link href="/profile" className="flex items-center gap-2">
            <span className="hidden text-right text-xs leading-tight sm:block">
              <span className="block font-medium">{user.name}</span>
              <span className="block text-muted-foreground">@{user.handle}</span>
            </span>
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
