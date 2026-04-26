"use client";

import { motion, useReducedMotion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface AnimatedTimelineBlockProps {
  title?: string;
  steps: { label: string; body: string; code?: string }[];
}

export function AnimatedTimelineBlock({ title, steps }: AnimatedTimelineBlockProps) {
  const prefersReduced = useReducedMotion();

  return (
    <div className="not-prose space-y-4">
      {title && (
        <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
      )}
      <ol className="relative space-y-6 border-l-2 border-border pl-6">
        {steps.map((step, i) => (
          <motion.li
            key={i}
            initial={prefersReduced ? false : { opacity: 0, x: -16 }}
            whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative"
          >
            <span className="absolute -left-[33px] top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-md">
              {i + 1}
            </span>
            <div className="font-display text-base font-semibold">{step.label}</div>
            <div className="prose-krit prose-sm mt-1">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{step.body}</ReactMarkdown>
            </div>
            {step.code && (
              <motion.pre
                initial={prefersReduced ? false : { opacity: 0, y: 8 }}
                whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.06 + 0.15 }}
                className="mt-3 overflow-x-auto rounded-lg border border-border bg-card p-3 text-xs"
              >
                <code>{step.code}</code>
              </motion.pre>
            )}
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
