"use client";

import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

/**
 * GROUP BY collapse: rows visually slide together by the grouping
 * column, then aggregate functions resolve into the result.
 */

const ROWS = [
  { plan: "pro",     city: "London",  total: 25 },
  { plan: "pro",     city: "London",  total: 18 },
  { plan: "free",    city: "NYC",     total:  9 },
  { plan: "starter", city: "Mumbai",  total: 12 },
  { plan: "pro",     city: "Mumbai",  total: 30 },
  { plan: "starter", city: "London",  total:  7 },
  { plan: "free",    city: "Mumbai",  total: 14 },
  { plan: "pro",     city: "NYC",     total: 22 },
];

const PLAN_COLORS: Record<string, string> = {
  pro: "#6366f1",
  starter: "#f59e0b",
  free: "#10b981",
};

export const GroupByCollapse: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const rowW = Math.min(220, width * 0.35);
  const rowH = 32;
  const inputX = width * 0.08;
  const outputX = width * 0.6;
  const startY = height * 0.22;

  // Sort target by plan to get target indices
  const grouped = [...ROWS].sort((a, b) => a.plan.localeCompare(b.plan));
  const planOrder = ["free", "pro", "starter"] as const;
  const groups = planOrder.map((p) => ({
    plan: p,
    rows: ROWS.filter((r) => r.plan === p),
    sum: ROWS.filter((r) => r.plan === p).reduce((s, r) => s + r.total, 0),
    count: ROWS.filter((r) => r.plan === p).length,
  }));

  const groupTargetY = (planIdx: number) => startY + planIdx * (rowH * 1.4) + 20;
  const collapseProg = interpolate(frame, [60, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const aggregateProg = interpolate(frame, [140, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)", color: "#e2e8f0", fontFamily: "Inter, system-ui, sans-serif" }}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 28, opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }) }}>
        <div style={{ fontSize: 22, fontWeight: 600 }}>GROUP BY plan, then SUM(total)</div>
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>watch many rows collapse into one row per group</div>
      </AbsoluteFill>

      {/* Header on the left side */}
      <div style={{ position: "absolute", left: inputX, top: startY - 28, fontSize: 12, color: "#94a3b8", fontFamily: "JetBrains Mono, monospace" }}>orders</div>

      {ROWS.map((row, i) => {
        const planIdx = planOrder.indexOf(row.plan as typeof planOrder[number]);
        const targetY = groupTargetY(planIdx);
        const initialY = startY + i * rowH;
        const enter = spring({ frame: frame - i * 3, fps, config: { damping: 14, stiffness: 100 } });
        const y = interpolate(collapseProg, [0, 1], [initialY, targetY]);
        const x = interpolate(collapseProg, [0, 1], [inputX, inputX + 24]);
        const rowOpacity = interpolate(aggregateProg, [0.3, 0.8], [1, 0.18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const color = PLAN_COLORS[row.plan]!;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x, top: y, width: rowW, height: rowH - 6,
              borderRadius: 8,
              background: `${color}1f`,
              border: `1px solid ${color}66`,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              alignItems: "center",
              padding: "0 12px",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 12,
              color: "#e2e8f0",
              opacity: enter * rowOpacity,
              transform: `scale(${0.95 + enter * 0.05})`,
            }}
          >
            <div style={{ color }}>{row.plan}</div>
            <div>{row.city}</div>
            <div style={{ textAlign: "right" }}>${row.total}</div>
          </div>
        );
      })}

      {/* Result group cards appear */}
      <div style={{ position: "absolute", left: outputX, top: startY - 28, fontSize: 12, color: "#22d3ee", fontFamily: "JetBrains Mono, monospace", opacity: aggregateProg }}>result</div>

      {groups.map((g, gi) => {
        const targetY = groupTargetY(gi);
        const enter = spring({ frame: frame - 140 - gi * 8, fps, config: { damping: 14, stiffness: 100 } });
        const color = PLAN_COLORS[g.plan]!;
        return (
          <div
            key={g.plan}
            style={{
              position: "absolute",
              left: outputX + (1 - enter) * -20,
              top: targetY,
              width: rowW,
              height: rowH - 6,
              borderRadius: 8,
              background: `${color}33`,
              border: `2px solid ${color}`,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              alignItems: "center",
              padding: "0 12px",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 12,
              color: "#f8fafc",
              opacity: enter,
            }}
          >
            <div style={{ color, fontWeight: 700 }}>{g.plan}</div>
            <div style={{ color: "#94a3b8", fontSize: 10 }}>{g.count} rows</div>
            <div style={{ textAlign: "right", color: "#22d3ee", fontWeight: 700 }}>${g.sum}</div>
          </div>
        );
      })}

      {/* SQL caption */}
      <div style={{
        position: "absolute",
        bottom: 28, left: 0, right: 0,
        textAlign: "center",
        opacity: interpolate(frame, [200, 230], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <div style={{ display: "inline-block", padding: "10px 18px", background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(99, 102, 241, 0.4)", borderRadius: 8, fontFamily: "JetBrains Mono, monospace", fontSize: 14, color: "#cbd5e1" }}>
          <span style={{ color: "#a78bfa" }}>SELECT</span> plan, <span style={{ color: "#22d3ee" }}>SUM</span>(total) <span style={{ color: "#a78bfa" }}>FROM</span> orders <span style={{ color: "#a78bfa" }}>GROUP BY</span> plan;
        </div>
      </div>
    </AbsoluteFill>
  );
};
