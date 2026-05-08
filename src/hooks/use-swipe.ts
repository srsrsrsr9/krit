"use client";

import { useEffect, useRef } from "react";

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const MIN_DELTA = 50;

export function useSwipe<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  { onSwipeLeft, onSwipeRight }: SwipeHandlers,
) {
  const start = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      if (t) start.current = { x: t.clientX, y: t.clientY };
    }

    function onTouchEnd(e: TouchEvent) {
      if (!start.current) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - start.current.x;
      const dy = t.clientY - start.current.y;
      start.current = null;
      // Reject if vertical movement dominates — user is scrolling, not swiping.
      if (Math.abs(dy) > Math.abs(dx)) return;
      if (dx < -MIN_DELTA) onSwipeLeft?.();
      else if (dx > MIN_DELTA) onSwipeRight?.();
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight]);
}
