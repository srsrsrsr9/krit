"use client";

/**
 * Brand illustrations from the Claude Design landing page.
 * SVGs only — colors driven by the OKLCH brand tokens (T constants below).
 */

const T = {
  indigo: "oklch(0.52 0.22 264)",
  violet: "oklch(0.52 0.22 290)",
  ink2: "oklch(0.42 0.01 264)",
  ink3: "oklch(0.68 0.008 264)",
  rule: "oklch(0.88 0.008 264)",
  indigoLight: "oklch(0.94 0.04 264)",
};

interface SkillNode {
  id: string;
  x: number;
  y: number;
  label: string;
  level: 0 | 1 | 2 | 3;
  ev: number;
}

const NODES: SkillNode[] = [
  { id: "A", x: 80, y: 200, label: "SQL", level: 3, ev: 8 },
  { id: "B", x: 220, y: 100, label: "Python", level: 2, ev: 5 },
  { id: "C", x: 220, y: 300, label: "Statistics", level: 2, ev: 4 },
  { id: "D", x: 360, y: 200, label: "ML Basics", level: 1, ev: 2 },
  { id: "E", x: 490, y: 120, label: "NLP", level: 0, ev: 0 },
  { id: "F", x: 490, y: 280, label: "Regression", level: 1, ev: 1 },
];
const EDGES: [string, string][] = [
  ["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"], ["D", "E"], ["D", "F"],
];

function levelColor(l: number): string {
  if (l === 0) return T.rule;
  if (l === 1) return "oklch(0.75 0.12 264)";
  if (l === 2) return "oklch(0.62 0.18 264)";
  return T.indigo;
}

export function SkillGraph({ animated = true }: { animated?: boolean }) {
  const radius = 28;
  const maxEv = 8;
  const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]));

  return (
    <svg viewBox="0 0 580 400" width="100%" style={{ maxWidth: 580, overflow: "visible" }} aria-label="Skill graph showing connected skills with evidence dots">
      <defs>
        <marker id="krit-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={T.rule} />
        </marker>
      </defs>

      {EDGES.map(([a, b], i) => {
        const na = nodeMap[a]!;
        const nb = nodeMap[b]!;
        const dx = nb.x - na.x;
        const dy = nb.y - na.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / len;
        const uy = dy / len;
        const x1 = na.x + ux * radius;
        const y1 = na.y + uy * radius;
        const x2 = nb.x - ux * (radius + 6);
        const y2 = nb.y - uy * (radius + 6);
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={T.rule}
            strokeWidth={1.5}
            markerEnd="url(#krit-arrow)"
            className={animated ? "krit-edge-anim" : undefined}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        );
      })}

      {NODES.map((n, i) => {
        const fill = levelColor(n.level);
        const textColor = n.level >= 2 ? "#fff" : T.ink2;
        const evDots = Math.min(n.ev, maxEv);
        const dotPositions = Array.from({ length: evDots }, (_, k) => {
          const angle = (k / maxEv) * 2 * Math.PI - Math.PI / 2;
          return {
            x: n.x + Math.cos(angle) * (radius + 14),
            y: n.y + Math.sin(angle) * (radius + 14),
          };
        });
        return (
          <g
            key={n.id}
            className={animated ? "krit-node-anim" : undefined}
            style={{ animationDelay: `${0.3 + i * 0.12}s` }}
          >
            <circle cx={n.x} cy={n.y} r={radius} fill={fill} />
            {n.level > 0 && (
              <circle cx={n.x} cy={n.y} r={radius} fill="none" stroke={T.indigo} strokeWidth={1.5} opacity={0.4} />
            )}
            <text
              x={n.x} y={n.y + 1}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={10} fontWeight={500}
              fill={textColor}
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {n.label}
            </text>
            {dotPositions.map((pos, k) => (
              <circle
                key={k}
                cx={pos.x} cy={pos.y} r={3.5}
                fill={T.violet}
                className={animated ? "krit-ev-dot" : undefined}
                style={{ animationDelay: `${0.9 + i * 0.1 + k * 0.07}s`, opacity: animated ? 0 : 1 }}
              />
            ))}
          </g>
        );
      })}

      <g transform="translate(20, 360)" style={{ fontFamily: "var(--font-sans)" }} fontSize={10} fill={T.ink3}>
        <circle cx={8} cy={8} r={5} fill={T.violet} />
        <text x={18} y={12}>evidence item</text>
        <circle cx={80} cy={8} r={5} fill={T.indigo} />
        <text x={90} y={12}>mastered skill</text>
        <circle cx={162} cy={8} r={5} fill={T.rule} />
        <text x={172} y={12}>locked</text>
      </g>
    </svg>
  );
}

export function IllustrationGraph() {
  const positions: [number, number, string][] = [
    [40, 70, "A"], [100, 30, "B"], [100, 110, "C"], [160, 70, "D"],
  ];
  return (
    <svg viewBox="0 0 200 140" width="100%" aria-hidden>
      {positions.map(([x, y, l], i) => (
        <g key={l}>
          {i > 0 && <line x1={40} y1={70} x2={x} y2={y} stroke={T.rule} strokeWidth={1.5} />}
          <circle
            cx={x} cy={y} r={22}
            fill={i === 0 ? T.indigo : i === 3 ? "oklch(0.75 0.12 264)" : T.indigoLight}
          />
          <text
            x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
            fontSize={9} fontWeight={500}
            fill={i === 0 ? "#fff" : T.ink2}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {l}
          </text>
          {[...Array(i === 0 ? 5 : i === 1 ? 3 : i === 2 ? 2 : 1)].map((_, k) => (
            <circle
              key={k}
              cx={x + Math.cos((k / 5) * Math.PI * 2) * 32}
              cy={y + Math.sin((k / 5) * Math.PI * 2) * 32}
              r={3}
              fill={T.violet}
              opacity={0.8}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

export function IllustrationTutor() {
  return (
    <svg viewBox="0 0 200 140" width="100%" aria-hidden>
      <rect x={10} y={10} width={120} height={120} rx={8} fill="white" stroke={T.rule} strokeWidth={1} />
      {[20, 30, 40, 50, 60, 70, 80, 90, 100].map((y, i) => (
        <rect
          key={y}
          x={20} y={y}
          width={[80, 60, 90, 70, 50, 85, 65, 75, 55][i]}
          height={6} rx={3}
          fill={i === 3 ? "oklch(0.88 0.07 264)" : T.rule}
        />
      ))}
      <rect x={10} y={52} width={120} height={18} fill="oklch(0.88 0.07 264 / 0.4)" />
      <rect x={145} y={30} width={50} height={80} rx={8} fill={T.indigoLight} stroke={T.rule} strokeWidth={1} />
      <text x={170} y={55} textAnchor="middle" fontSize={8} fill={T.indigo} fontWeight={600} style={{ fontFamily: "var(--font-sans)" }}>AI</text>
      {[70, 82, 94, 106].map((y, i) => (
        <rect key={y} x={152} y={y} width={[35, 25, 30, 20][i]} height={5} rx={2.5} fill={T.rule} />
      ))}
      <line x1={140} y1={62} x2={145} y2={62} stroke={T.indigo} strokeWidth={1.5} strokeDasharray="2,2" />
    </svg>
  );
}

export function IllustrationCredential() {
  return (
    <svg viewBox="0 0 200 140" width="100%" aria-hidden>
      <rect x={25} y={15} width={150} height={110} rx={8} fill="white" stroke={T.rule} strokeWidth={1} />
      <rect x={25} y={15} width={150} height={32} rx={8} fill={T.indigo} />
      <rect x={25} y={31} width={150} height={16} fill={T.indigo} />
      <text x={100} y={35} textAnchor="middle" fontSize={9} fill="white" fontWeight={600} style={{ fontFamily: "var(--font-sans)" }}>CERTIFICATE</text>
      <circle cx={100} cy={80} r={22} fill={T.indigoLight} stroke={T.indigo} strokeWidth={2} />
      <text x={100} y={78} textAnchor="middle" fontSize={7} fill={T.indigo} style={{ fontFamily: "var(--font-sans)" }}>verified</text>
      <text x={100} y={88} textAnchor="middle" fontSize={14} fill={T.indigo} style={{ fontFamily: "var(--font-serif)" }}>✓</text>
      <rect x={40} y={110} width={120} height={6} rx={3} fill={T.rule} />
      <rect x={60} y={120} width={80} height={5} rx={2.5} fill={T.rule} />
    </svg>
  );
}

export function StepDiagram({ step }: { step: 1 | 2 | 3 }) {
  if (step === 1)
    return (
      <svg viewBox="0 0 120 80" width={120} height={80} aria-hidden>
        <rect x={10} y={20} width={100} height={40} rx={6} fill={T.indigoLight} />
        <text x={60} y={44} textAnchor="middle" fontSize={9} style={{ fontFamily: "var(--font-sans)" }} fill={T.indigo} fontWeight={500}>Add a skill goal</text>
        {[0, 1, 2].map((i) => <circle key={i} cx={30 + i * 30} cy={55} r={3} fill={T.indigo} opacity={0.3 + i * 0.3} />)}
      </svg>
    );
  if (step === 2)
    return (
      <svg viewBox="0 0 120 80" width={120} height={80} aria-hidden>
        <rect x={5} y={5} width={70} height={70} rx={6} fill="white" stroke={T.rule} strokeWidth={1} />
        {[15, 25, 35, 45].map((y, i) => (
          <rect
            key={y}
            x={12} y={y}
            width={[55, 40, 50, 35][i]} height={5} rx={2.5}
            fill={i === 1 ? "oklch(0.88 0.07 264)" : T.rule}
          />
        ))}
        <rect x={82} y={20} width={35} height={45} rx={6} fill={T.indigoLight} />
        <text x={99} y={42} textAnchor="middle" fontSize={7} fill={T.indigo} style={{ fontFamily: "var(--font-sans)" }} fontWeight={600}>AI</text>
        <text x={99} y={52} textAnchor="middle" fontSize={7} fill={T.ink2} style={{ fontFamily: "var(--font-sans)" }}>tutor</text>
      </svg>
    );
  return (
    <svg viewBox="0 0 120 80" width={120} height={80} aria-hidden>
      <rect x={20} y={10} width={80} height={60} rx={6} fill="white" stroke={T.indigo} strokeWidth={1.5} />
      <rect x={20} y={10} width={80} height={20} rx={6} fill={T.indigo} />
      <rect x={20} y={24} width={80} height={6} fill={T.indigo} />
      <text x={60} y={24} textAnchor="middle" fontSize={7} fill="white" style={{ fontFamily: "var(--font-sans)" }} fontWeight={600}>CREDENTIAL</text>
      <circle cx={60} cy={54} r={12} fill={T.indigoLight} />
      <text x={60} y={58} textAnchor="middle" fontSize={11} fill={T.indigo} style={{ fontFamily: "var(--font-serif)" }}>✓</text>
    </svg>
  );
}
