"use client";

import { Newspaper } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface FieldNotesBlockProps {
  title: string;
  source: string;
  date?: string;
  story: string;
  takeaway: string;
}

export function FieldNotesBlock({ title, source, date, story, takeaway }: FieldNotesBlockProps) {
  return (
    <aside className="not-prose relative overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm dark:from-amber-950/40 dark:to-orange-950/30">
      <div className="absolute -top-4 -right-4 rotate-12 rounded-md border border-amber-700/40 bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-900 shadow-sm dark:bg-amber-900/50 dark:text-amber-200">
        Field Notes
      </div>
      <div className="mb-3 flex items-center gap-2 text-amber-900 dark:text-amber-200">
        <Newspaper className="h-5 w-5 shrink-0" />
        <h3 className="font-display text-lg font-bold tracking-tight">{title}</h3>
      </div>
      <div className="mb-3 text-xs text-amber-800/80 dark:text-amber-300/80">
        <span className="font-medium">{source}</span>
        {date && <span> · {date}</span>}
      </div>
      <div className="prose-krit prose-sm mb-4 text-amber-950 dark:text-amber-100">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{story}</ReactMarkdown>
      </div>
      <div className="rounded-lg border-l-4 border-amber-600 bg-amber-100/60 p-3 text-sm font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
          What this proves →
        </span>
        <div className="mt-1">{takeaway}</div>
      </div>
    </aside>
  );
}
