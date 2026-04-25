import Link from "next/link";
import { redirect } from "next/navigation";
import { currentMembership } from "@/lib/auth";

const ELEVATED_ROLES = ["OWNER", "ADMIN", "MANAGER", "AUTHOR", "INSTRUCTOR"] as const;

const tabs = [
  { href: "/workspace", label: "Overview", roles: ["OWNER", "ADMIN", "MANAGER"] },
  { href: "/workspace/paths", label: "Paths", roles: ["OWNER", "ADMIN", "AUTHOR", "MANAGER"] },
  { href: "/workspace/lessons", label: "Lessons", roles: ["OWNER", "ADMIN", "AUTHOR"] },
  { href: "/workspace/assessments", label: "Assessments", roles: ["OWNER", "ADMIN", "AUTHOR"] },
  { href: "/workspace/projects", label: "Projects", roles: ["OWNER", "ADMIN", "AUTHOR"] },
  { href: "/workspace/skills", label: "Skills", roles: ["OWNER", "ADMIN", "AUTHOR", "MANAGER"] },
  { href: "/workspace/assignments", label: "Assignments", roles: ["OWNER", "ADMIN", "MANAGER"] },
  { href: "/workspace/review", label: "Review", roles: ["OWNER", "ADMIN", "INSTRUCTOR"] },
  { href: "/workspace/people", label: "People", roles: ["OWNER", "ADMIN", "MANAGER"] },
  { href: "/workspace/analytics", label: "Analytics", roles: ["OWNER", "ADMIN", "MANAGER"] },
  { href: "/workspace/settings", label: "Settings", roles: ["OWNER", "ADMIN"] },
];

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const m = await currentMembership();
  if (!m) redirect("/sign-in");
  if (!ELEVATED_ROLES.includes(m.role as typeof ELEVATED_ROLES[number])) redirect("/home");
  const visibleTabs = tabs.filter((t) => t.roles.includes(m.role));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b border-border">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Workspace</div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{m.workspace.name}</h1>
        </div>
        <nav className="flex flex-wrap items-center gap-1">
          {visibleTabs.map((t) => (
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
