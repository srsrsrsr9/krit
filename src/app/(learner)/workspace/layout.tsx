import Link from "next/link";
import { redirect } from "next/navigation";
import { currentMembership } from "@/lib/auth";

const tabs = [
  { href: "/workspace", label: "Overview" },
  { href: "/workspace/paths", label: "Paths" },
  { href: "/workspace/people", label: "People" },
  { href: "/workspace/skills", label: "Skills" },
  { href: "/workspace/analytics", label: "Analytics" },
];

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const m = await currentMembership();
  if (!m) redirect("/sign-in");
  if (!["OWNER", "ADMIN", "MANAGER"].includes(m.role)) redirect("/home");

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b border-border">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Workspace</div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{m.workspace.name}</h1>
        </div>
        <nav className="flex items-center gap-1">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="rounded-t-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
      <div>{children}</div>
    </div>
  );
}
