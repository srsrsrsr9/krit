import { redirect } from "next/navigation";
import { currentMembership, currentUser } from "@/lib/auth";
import { AppHeader } from "@/components/app-shell/header";

export default async function LearnerLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const membership = await currentMembership();

  const nav = [
    { href: "/home", label: "Home" },
    { href: "/catalog", label: "Catalog" },
    { href: "/skills", label: "Skills" },
    { href: "/credentials", label: "Credentials" },
  ];
  if (membership && (membership.role === "ADMIN" || membership.role === "OWNER" || membership.role === "MANAGER")) {
    nav.push({ href: "/workspace", label: "Workspace" });
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} workspace={membership?.workspace ?? null} nav={nav} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
