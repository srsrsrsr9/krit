import { redirect } from "next/navigation";
import Link from "next/link";
import { checkRole, AUTHOR_ROLES } from "@/lib/roles";
import { ProjectForm } from "@/components/author/project-form";

export default async function NewProject() {
  const m = await checkRole(AUTHOR_ROLES);
  if (!m) redirect("/workspace");
  return (
    <div className="max-w-4xl space-y-4">
      <Link href="/workspace/projects" className="text-xs text-muted-foreground hover:text-foreground">← Projects</Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight">New project</h1>
      <ProjectForm />
    </div>
  );
}
