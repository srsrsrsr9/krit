"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Globe2, Lightbulb, Info, AlertTriangle, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = {
  title?: string;
  tone: "info" | "tip" | "warn" | "success";
  md: string;
  attribution?: string;
};

export interface CulturalAsideBlockProps {
  defaultLocale: string;
  variants: Record<string, Variant>;
}

const toneClass = {
  info: "border-blue-500/30 bg-blue-500/5",
  tip: "border-accent/40 bg-accent/10",
  warn: "border-amber-500/40 bg-amber-500/10",
  success: "border-emerald-500/40 bg-emerald-500/10",
} as const;
const toneIcon = { info: Info, tip: Lightbulb, warn: AlertTriangle, success: PartyPopper };

const LOCALE_LABEL: Record<string, string> = {
  "hi-IN": "हिंदी (Hinglish)",
  en: "English",
  "ta-IN": "தமிழ்",
  "te-IN": "తెలుగు",
  "mr-IN": "मराठी",
  "bn-IN": "বাংলা",
};

export function CulturalAsideBlock({ defaultLocale, variants }: CulturalAsideBlockProps) {
  const locales = useMemo(() => Object.keys(variants), [variants]);
  const initial = variants[defaultLocale] ? defaultLocale : (locales[0] ?? defaultLocale);
  const [locale, setLocale] = useState(initial);
  const v = variants[locale] ?? variants[defaultLocale] ?? Object.values(variants)[0];
  if (!v) return null;
  const Icon = toneIcon[v.tone];

  return (
    <aside
      className={cn(
        "not-prose relative rounded-xl border-2 p-5 shadow-sm",
        toneClass[v.tone],
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <Icon className="h-4 w-4" />
          <span className="font-display">{v.title ?? "Cultural aside"}</span>
        </div>
        {locales.length > 1 && (
          <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-2 py-1 text-[10px] uppercase tracking-wide">
            <Globe2 className="h-3 w-3 text-muted-foreground" />
            {locales.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLocale(l)}
                className={cn(
                  "rounded-full px-2 py-0.5 transition-colors",
                  l === locale ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {LOCALE_LABEL[l] ?? l}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="prose-krit prose-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{v.md}</ReactMarkdown>
      </div>
      {v.attribution && (
        <div className="mt-3 text-xs text-muted-foreground">— {v.attribution}</div>
      )}
    </aside>
  );
}
