import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Brain, Trophy, Users2, Sparkles, Network, LineChart } from "lucide-react";

export default function Landing() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-3">
          <Link href="/catalog" className="hidden text-sm text-muted-foreground hover:text-foreground sm:block">
            Catalog
          </Link>
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="sm">Start learning</Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-12 pt-16 text-center sm:pt-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          AI-native · skill-first · built for corporate L&D and retail learners
        </div>
        <h1 className="text-balance font-display text-5xl font-semibold tracking-tight sm:text-6xl">
          Stop collecting courses. <span className="text-primary">Start building skills.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
          Krit is a learning platform where the atomic unit is the skill, not the course. Every lesson,
          project, and assessment is evidence against a living skill profile — portable across jobs and careers.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/sign-in">
            <Button size="lg" className="gap-2">
              Try the demo course <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/catalog">
            <Button size="lg" variant="outline">
              Browse catalog
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title} className="transition-colors hover:border-primary/40">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Krit</span>
          <span>Built skill-first.</span>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Network,
    title: "Skill graph, not a course list",
    body: "Skills are the nodes. Lessons, projects, and assessments are evidence. Paths are just curated views.",
  },
  {
    icon: Brain,
    title: "Atlas — your AI tutor",
    body: "A tutor that sees your lesson, your gaps, and your recent mistakes. Streams answers in context.",
  },
  {
    icon: Trophy,
    title: "Verifiable credentials",
    body: "Every credential carries the evidence that earned it. Share a public link that stays with you.",
  },
  {
    icon: Users2,
    title: "Corporate & retail in one engine",
    body: "Compliance, role architecture, and manager dashboards for teams. Creator tooling and community for retail.",
  },
  {
    icon: LineChart,
    title: "Analytics that answer real questions",
    body: "Team readiness, skill coverage, overdue compliance, content effectiveness — not just scores.",
  },
  {
    icon: Sparkles,
    title: "AI-native authoring",
    body: "Start from an outcome, not a blank page. Generate, edit, and calibrate content with the loop on your side.",
  },
];
