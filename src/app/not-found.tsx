import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <div>
        <div className="font-mono text-xs text-muted-foreground">404</div>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Not found</h1>
        <p className="mt-2 text-muted-foreground">This page doesn't exist — or you don't have access.</p>
      </div>
      <Link href="/home">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
