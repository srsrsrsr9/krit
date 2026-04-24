"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("app_error", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <div>
        <div className="font-mono text-xs text-muted-foreground">500 · {error.digest}</div>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Something broke</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          We logged the error. Try again, or head back to your home dashboard.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <a href="/home">
          <Button variant="outline">Go home</Button>
        </a>
      </div>
    </div>
  );
}
