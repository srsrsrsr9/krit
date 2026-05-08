"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap } from "lucide-react";

interface XpMomentProps {
  xp: number;
  label?: string;
  streakCount?: number;
  /** Called after the animation auto-dismisses. */
  onDone?: () => void;
}

const DISMISS_MS = 2200;

export function XpMoment({ xp, label, streakCount, onDone }: XpMomentProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, DISMISS_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="xp-moment"
          initial={{ opacity: 0, scale: 0.7, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
          className="pointer-events-none absolute inset-x-0 top-2 z-20 flex flex-col items-center gap-1"
          aria-live="polite"
        >
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-1.5 text-sm font-bold text-white shadow-lg ring-4 ring-amber-400/30">
            <Zap className="h-4 w-4" />
            +{xp} XP
          </div>
          {label && (
            <span className="rounded-full bg-foreground/80 px-3 py-0.5 text-[11px] font-medium text-background">
              {label}
            </span>
          )}
          {streakCount !== undefined && streakCount > 1 && (
            <span className="rounded-full bg-orange-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
              {streakCount}x streak 🔥
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
