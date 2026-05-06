"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmbedAnimationBlockProps {
  src: string;
  height?: number;
  caption?: string;
  fallbackImage?: string;
}

export function EmbedAnimationBlock({ src, height = 420, caption, fallbackImage }: EmbedAnimationBlockProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [bust, setBust] = useState(0);
  const [errored, setErrored] = useState(false);

  useEffect(() => { setErrored(false); }, [src, bust]);

  const url = `${src}${src.includes("?") ? "&" : "?"}v=${bust}`;

  return (
    <figure className="not-prose space-y-2">
      <div
        className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        style={{ height: `${height}px` }}
      >
        {errored ? (
          fallbackImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fallbackImage} alt={caption ?? "Animation poster"} className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Animation unavailable. The HTML file may not have been uploaded yet.
            </div>
          )
        ) : (
          <iframe
            ref={ref}
            src={url}
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
            className="h-full w-full"
            onError={() => setErrored(true)}
            title={caption ?? "Embedded animation"}
          />
        )}
        <div className="absolute right-2 top-2 flex gap-1 opacity-70 transition-opacity hover:opacity-100">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-8 w-8"
            onClick={() => setBust((b) => b + 1)}
            aria-label="Restart animation"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-8 w-8"
            onClick={() => window.open(src, "_blank")}
            aria-label="Open in full window"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {caption && (
        <figcaption className="text-center text-xs italic text-muted-foreground">{caption}</figcaption>
      )}
    </figure>
  );
}
