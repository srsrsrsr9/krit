import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 font-display text-lg font-semibold tracking-tight", className)}>
      <LogoMark />
      <span>Krit</span>
    </Link>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent text-primary-foreground",
        className,
      )}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2 8.5L7 3.5L12 8.5M2 8.5L7 13.5L12 8.5M2 8.5H14"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
