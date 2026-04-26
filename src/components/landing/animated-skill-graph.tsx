"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hero animation: a learner's skill graph fills up over a 12-second loop.
 * Evidence dots appear on a deterministic schedule, nodes master once
 * their threshold is hit (with a pop + glow), edges draw between mastered
 * neighbors, and a credential card flips in at the end. Auto-loops.
 */

const T = {
  ink2: "oklch(0.42 0.01 264)",
  rule: "oklch(0.88 0.008 264)",
  indigoFull: "oklch(0.52 0.22 264)",
  indigo70: "oklch(0.62 0.20 264)",
  violet: "oklch(0.52 0.22 290)",
  locked: "oklch(0.88 0.008 264)",
};

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  threshold: number;
}
const NODES: Node[] = [
  { id: "sql", x: 0.14, y: 0.48, label: "SQL", threshold: 3 },
  { id: "py", x: 0.36, y: 0.22, label: "Python", threshold: 3 },
  { id: "stats", x: 0.36, y: 0.74, label: "Statistics", threshold: 3 },
  { id: "ml", x: 0.6, y: 0.48, label: "ML Basics", threshold: 3 },
  { id: "reg", x: 0.8, y: 0.74, label: "Regression", threshold: 2 },
  { id: "nlp", x: 0.8, y: 0.22, label: "NLP", threshold: 2 },
];
const EDGES: [string, string][] = [
  ["sql", "py"], ["sql", "stats"],
  ["py", "ml"], ["stats", "ml"],
  ["ml", "nlp"], ["ml", "reg"],
];
const EVIDENCE: [string, number][] = [
  ["sql", 0.9], ["sql", 1.5], ["sql", 2.1],
  ["py", 2.6], ["stats", 2.8],
  ["py", 3.2], ["stats", 3.5],
  ["py", 3.9], ["stats", 4.2],
  ["ml", 4.7], ["ml", 5.2], ["ml", 5.8],
  ["reg", 6.2], ["nlp", 6.2],
  ["reg", 6.7], ["nlp", 6.7],
  ["reg", 7.15], ["nlp", 7.15],
];
const LOOP = 12;

function easeInOut(x: number): number { return x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x; }
function easeOut(x: number): number { return 1 - (1 - x) * (1 - x); }

export function AnimatedSkillGraph({ width = 560, height = 400 }: { width?: number; height?: number }) {
  const [phase, setPhase] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ((ts - startRef.current) / 1000) % LOOP;
      setPhase(elapsed);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const t = phase;

  // Evidence accumulated by time t.
  const evidenceByNode: Record<string, number[]> = {};
  for (const n of NODES) evidenceByNode[n.id] = [];
  for (const [nid, at] of EVIDENCE) if (t >= at) evidenceByNode[nid]!.push(at);

  const isMastered = (nid: string) => {
    const node = NODES.find((n) => n.id === nid)!;
    return evidenceByNode[nid]!.length >= node.threshold;
  };
  const nodeProgress = (nid: string) => {
    const node = NODES.find((n) => n.id === nid)!;
    return Math.min(1, evidenceByNode[nid]!.length / node.threshold);
  };
  const edgeVisible = ([a, b]: [string, string]) => isMastered(a) && isMastered(b);

  const glowPhase = Math.max(0, Math.min(1, (t - 7.5) / 1.5));
  const zoom = 0.95 + 0.05 * easeInOut(Math.min(1, t / 8));

  const px = (frac: number) => frac * width;
  const py = (frac: number) => frac * height;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
      style={{ overflow: "visible", transform: `scale(${zoom})`, transformOrigin: "center" }}
    >
      <defs>
        <radialGradient id="krit-node-grad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="white" stopOpacity={0.35} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {EDGES.map(([a, b], i) => {
        const na = NODES.find((n) => n.id === a)!;
        const nb = NODES.find((n) => n.id === b)!;
        const x1 = px(na.x), y1 = py(na.y);
        const x2 = px(nb.x), y2 = py(nb.y);
        const len = Math.hypot(x2 - x1, y2 - y1);
        const vis = edgeVisible([a, b]);
        const evA = EVIDENCE.filter(([nid]) => nid === a)[na.threshold - 1]?.[1] ?? 0;
        const evB = EVIDENCE.filter(([nid]) => nid === b)[nb.threshold - 1]?.[1] ?? 0;
        const unlockT = Math.max(evA, evB);
        const drawP = vis ? Math.min(1, (t - unlockT) / 0.7) : 0;
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={vis ? T.indigoFull : T.rule}
            strokeWidth={vis ? 2 : 1.5}
            strokeDasharray={len}
            strokeDashoffset={len * (1 - easeOut(drawP))}
            opacity={vis ? 0.65 + glowPhase * 0.35 : 0.5}
          />
        );
      })}

      {NODES.map((node) => {
        const cx = px(node.x), cy = py(node.y);
        const prog = nodeProgress(node.id);
        const mast = isMastered(node.id);
        const evDots = evidenceByNode[node.id]!;
        const r = 28;
        const fillColor = mast ? T.indigoFull : prog > 0 ? T.indigo70 : T.locked;
        const textColor = mast || prog > 0.5 ? "white" : T.ink2;
        const mastT = mast ? EVIDENCE.filter(([nid]) => nid === node.id)[node.threshold - 1]?.[1] ?? 0 : 0;
        const popProgress = mast ? Math.min(1, (t - mastT) / 0.5) : 0;
        const nodeScale = mast
          ? 0.88 + 0.12 * easeOut(popProgress) + (popProgress < 1 ? 0.12 * Math.sin(popProgress * Math.PI) : 0)
          : 0.85 + prog * 0.15;
        const ringOpacity = mast ? Math.max(0, 1 - (t - mastT) / 1.2) * 0.6 : 0;
        const ringR = mast ? 28 + ((t - mastT) / 1.2) * 20 : 28;

        const evPositions = evDots.map((evT, k) => {
          const angle = (k / node.threshold) * Math.PI * 2 - Math.PI / 2;
          const dist = r + 14;
          return { x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist, at: evT };
        });

        return (
          <g
            key={node.id}
            style={{
              filter:
                mast && glowPhase > 0
                  ? `drop-shadow(0 0 ${8 * glowPhase}px oklch(0.52 0.22 264 / 0.6))`
                  : "none",
            }}
          >
            {mast && ringOpacity > 0 && (
              <circle cx={cx} cy={cy} r={Math.min(ringR, 46)} fill="none" stroke={T.indigoFull} strokeWidth={1.5} opacity={ringOpacity} />
            )}
            <circle cx={cx} cy={cy} r={r * nodeScale} fill={fillColor} opacity={mast ? 1 : 0.5 + prog * 0.5} />
            <circle cx={cx} cy={cy} r={r * nodeScale} fill="url(#krit-node-grad)" />
            {mast && <circle cx={cx} cy={cy} r={r * nodeScale} fill="none" stroke="white" strokeWidth={1} opacity={0.25} />}
            <text
              x={cx} y={cy + 1}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={10} fontWeight={600}
              fill={textColor}
              style={{ fontFamily: "var(--font-sans)", userSelect: "none" }}
            >
              {node.label}
            </text>
            {evPositions.map((ev, k) => {
              const age = t - ev.at;
              const dotProg = Math.min(1, age / 0.3);
              const dotR = 4 * easeOut(dotProg);
              return <circle key={k} cx={ev.x} cy={ev.y} r={dotR} fill={T.violet} opacity={0.85} />;
            })}
            {mast && popProgress > 0.5 && (
              <text
                x={cx} y={cy + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={10} fontWeight={700}
                fill="white" opacity={(popProgress - 0.5) * 2}
                style={{ fontFamily: "var(--font-sans)", userSelect: "none" }}
              >
                ✓
              </text>
            )}
          </g>
        );
      })}

      {t > 8.2 && (
        <g opacity={Math.min(1, (t - 8.2) / 0.8)}>
          <rect x={px(0.5) - 70} y={py(0.5) - 26} width={140} height={52} rx={10} fill={T.indigoFull} opacity={0.92} />
          <rect x={px(0.5) - 70} y={py(0.5) - 26} width={140} height={52} rx={10} fill="none" stroke="white" strokeWidth={1} opacity={0.25} />
          <text
            x={px(0.5)} y={py(0.5) - 6}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={9} fontWeight={500}
            fill="rgba(255,255,255,0.75)" letterSpacing="0.08em"
            style={{ fontFamily: "var(--font-sans)", userSelect: "none" }}
          >
            CREDENTIAL EARNED
          </text>
          <text
            x={px(0.5)} y={py(0.5) + 12}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={13} fontWeight={600}
            fill="white"
            style={{ fontFamily: "var(--font-sans)", userSelect: "none" }}
          >
            ML Foundations
          </text>
        </g>
      )}
    </svg>
  );
}
