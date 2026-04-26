"use client";

import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from "remotion";

/**
 * SQL execution order — the often-misunderstood truth that SQL clauses
 * don't run in the order they're written. This composition fans the
 * clauses out, then re-orders them in their actual execution sequence
 * with the answer of "what does each step produce" annotated.
 */

const CLAUSES = [
  { written: "SELECT", executed: 5, color: "#6366f1", emits: "the columns you asked for" },
  { written: "FROM",   executed: 1, color: "#10b981", emits: "the source table(s)" },
  { written: "WHERE",  executed: 2, color: "#f59e0b", emits: "rows that match the filter" },
  { written: "GROUP BY", executed: 3, color: "#ef4444", emits: "one row per group" },
  { written: "HAVING", executed: 4, color: "#ec4899", emits: "groups that match" },
  { written: "ORDER BY", executed: 6, color: "#8b5cf6", emits: "sorted output" },
  { written: "LIMIT",  executed: 7, color: "#14b8a6", emits: "first N rows" },
] as const;

export interface SqlExecutionOrderProps {
  accentColor?: string;
}

export const SqlExecutionOrder: React.FC<SqlExecutionOrderProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Phase 1: 0-90 — clauses appear in written order
  // Phase 2: 90-180 — they shuffle into execution order
  // Phase 3: 180-360 — each one gets a spotlight + caption

  const cardWidth = Math.min(160, width / 8);
  const cardHeight = Math.min(60, height / 10);
  const gap = 12;
  const totalWidth = cardWidth * CLAUSES.length + gap * (CLAUSES.length - 1);
  const startX = (width - totalWidth) / 2;
  const writtenY = height * 0.25;
  const executedY = height * 0.55;

  const ordered = [...CLAUSES].sort((a, b) => a.executed - b.executed);
  const spotlightFrame = 180;
  const perClause = 26;

  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)" }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: height * 0.08 }}>
        <div style={{
          color: "#e2e8f0",
          fontSize: Math.min(28, width / 28),
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          What you write vs. what SQL runs
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: writtenY }}>
        <div style={{ color: "#94a3b8", fontSize: 14, marginBottom: 12, fontFamily: "Inter" }}>You write:</div>
      </AbsoluteFill>

      {CLAUSES.map((c, i) => {
        const enter = spring({
          frame: frame - i * 5,
          fps,
          config: { damping: 12, stiffness: 100 },
        });
        const writtenX = startX + i * (cardWidth + gap);
        const execIndex = ordered.findIndex((o) => o.written === c.written);
        const execX = startX + execIndex * (cardWidth + gap);
        const shuffleProgress = interpolate(frame, [90, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const x = interpolate(shuffleProgress, [0, 1], [writtenX, execX]);
        const y = interpolate(shuffleProgress, [0, 1], [writtenY, executedY]);

        const spotlightStart = spotlightFrame + execIndex * perClause;
        const isSpotlit = frame >= spotlightStart && frame < spotlightStart + perClause;
        const spotlightScale = isSpotlit ? interpolate(frame, [spotlightStart, spotlightStart + 6], [1, 1.18], { extrapolateRight: "clamp" }) : 1;

        return (
          <div
            key={c.written}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: cardWidth,
              height: cardHeight,
              transform: `scale(${enter * spotlightScale})`,
              borderRadius: 12,
              background: c.color,
              boxShadow: isSpotlit ? `0 0 0 4px ${c.color}55, 0 12px 32px ${c.color}66` : `0 6px 16px ${c.color}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: Math.min(16, cardWidth / 9),
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            {c.written}
          </div>
        );
      })}

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: executedY - 24, opacity: interpolate(frame, [80, 110], [0, 1], { extrapolateRight: "clamp" }) }}>
        <div style={{ color: "#94a3b8", fontSize: 14, fontFamily: "Inter" }}>SQL actually runs:</div>
      </AbsoluteFill>

      {ordered.map((c, execIndex) => {
        const spotlightStart = spotlightFrame + execIndex * perClause;
        const captionOpacity = interpolate(
          frame,
          [spotlightStart - 4, spotlightStart + 8, spotlightStart + perClause - 4, spotlightStart + perClause + 4],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const numberLabel = `${execIndex + 1}`;
        return (
          <Sequence key={c.written} from={spotlightStart - 4} durationInFrames={perClause + 8}>
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: height * 0.18, opacity: captionOpacity }}>
              <div style={{
                background: "rgba(15, 23, 42, 0.85)",
                padding: "16px 28px",
                borderRadius: 14,
                border: `2px solid ${c.color}`,
                color: "#f8fafc",
                fontFamily: "Inter",
                display: "flex",
                gap: 18,
                alignItems: "center",
                maxWidth: width * 0.8,
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: c.color,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 20,
                }}>
                  {numberLabel}
                </div>
                <div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 18, fontWeight: 700, color: c.color }}>
                    {c.written}
                  </div>
                  <div style={{ fontSize: 14, color: "#cbd5e1", marginTop: 2 }}>
                    emits {c.emits}
                  </div>
                </div>
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
