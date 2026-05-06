"use client";

import { useMemo } from "react";

export interface SvgFigureBlockProps {
  svg: string;
  alt: string;
  caption?: string;
  maxWidth?: number;
}

/**
 * Inline SVG with light sanitization. SVGs come from authored content (trusted
 * authoring path); this is defense-in-depth — strip scripts, event handlers,
 * and external refs before injecting.
 */
function sanitizeSvg(svg: string): string {
  let out = svg;
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/\son[a-z]+="[^"]*"/gi, "");
  out = out.replace(/\son[a-z]+='[^']*'/gi, "");
  out = out.replace(/javascript:/gi, "");
  out = out.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "");
  return out;
}

export function SvgFigureBlock({ svg, alt, caption, maxWidth }: SvgFigureBlockProps) {
  const safe = useMemo(() => sanitizeSvg(svg), [svg]);
  return (
    <figure
      className="not-prose mx-auto"
      style={maxWidth ? { maxWidth: `${maxWidth}px` } : undefined}
      role="img"
      aria-label={alt}
    >
      <div
        className="overflow-hidden rounded-xl border border-border bg-card p-2 shadow-sm [&_svg]:h-auto [&_svg]:w-full"
        dangerouslySetInnerHTML={{ __html: safe }}
      />
      {caption && (
        <figcaption className="mt-2 text-center text-xs italic text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
