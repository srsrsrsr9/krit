import {
  LandingNav,
  LandingHero,
  LandingFeatures,
  LandingHowItWorks,
  LandingSocialProof,
  LandingPricing,
  LandingFooter,
} from "@/components/landing/sections";
import { BeforeAfterSection } from "@/components/landing/before-after";

/**
 * Production landing page derived from the Claude Design handoff at
 * design/krit-ai/. OKLCH brand tokens are scoped to .krit-landing so
 * the rest of the app's HSL theme is undisturbed.
 */
export default function Landing() {
  return (
    <div className="krit-landing min-h-screen">
      <LandingNav />
      <LandingHero />
      <BeforeAfterSection />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingSocialProof />
      <LandingPricing />
      <LandingFooter />
    </div>
  );
}
