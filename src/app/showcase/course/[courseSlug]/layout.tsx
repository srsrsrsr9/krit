import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";

export default async function ShowcaseCourseLayout({
  children,
}: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  // Story player + course landing both take over the viewport — no header.
  return <div className="min-h-dvh bg-slate-950">{children}</div>;
}
