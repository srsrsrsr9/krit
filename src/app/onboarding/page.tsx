import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export const metadata = {
  title: "Welcome to Krit",
};

export default async function OnboardingPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  return <OnboardingFlow />;
}
