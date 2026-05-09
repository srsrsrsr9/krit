import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";

export default async function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  // Story player takes over the full viewport — no header chrome.
  return <div className="min-h-dvh bg-slate-950">{children}</div>;
}
