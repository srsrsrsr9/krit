"use client";

import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from "remotion";

/**
 * JOIN flow: two tables glide together, matching rows highlight and
 * stitch into a result table. Different join types (INNER / LEFT)
 * showcase what survives.
 */

const customers = [
  { id: 1, name: "Ada" },
  { id: 2, name: "Grace" },
  { id: 3, name: "Alan" },
  { id: 4, name: "Margaret" },
];
const orders = [
  { id: 101, customer_id: 1, total: 25 },
  { id: 102, customer_id: 1, total: 18 },
  { id: 103, customer_id: 3, total: 9 },
  { id: 104, customer_id: 5, total: 42 },
];

export interface JoinFlowProps {
  joinType?: "INNER" | "LEFT";
}

export const JoinFlow: React.FC<JoinFlowProps> = ({ joinType = "INNER" }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isLeft = joinType === "LEFT";

  // Pre-compute matched / unmatched.
  const matches = orders.map((o) => {
    const customer = customers.find((c) => c.id === o.customer_id);
    return { ...o, customerName: customer?.name ?? null, matched: Boolean(customer) };
  });
  const leftOnly = customers.filter((c) => !orders.some((o) => o.customer_id === c.id));

  type ResultRow = { id: number; name?: string; total: number | null; order_id?: number | null };
  const result: ResultRow[] =
    joinType === "INNER"
      ? matches
          .filter((m) => m.matched)
          .map((m) => ({ id: m.customer_id, name: m.customerName ?? undefined, total: m.total, order_id: m.id }))
      : customers.flatMap((c): ResultRow[] => {
          const os = orders.filter((o) => o.customer_id === c.id);
          if (os.length === 0) return [{ id: c.id, name: c.name, total: null, order_id: null }];
          return os.map((o) => ({ id: c.id, name: c.name, total: o.total, order_id: o.id }));
        });

  const cellH = 28;
  const tableW = Math.min(220, width * 0.28);
  const startCustomersX = width * 0.07;
  const startOrdersX = width * 0.65;
  const tableY = height * 0.18;
  const resultY = height * 0.55;

  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)", color: "#e2e8f0", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Title */}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 28, opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }) }}>
        <div style={{ fontSize: 22, fontWeight: 600 }}>
          <span style={{ color: "#94a3b8" }}>{joinType}</span>{" "}
          <span style={{ fontFamily: "JetBrains Mono, monospace", color: "#cbd5e1" }}>JOIN</span>
        </div>
        <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
          {joinType === "INNER" ? "rows that match in both" : "every row from the left, NULL where no match"}
        </div>
      </AbsoluteFill>

      {/* Customers table */}
      <Table
        x={startCustomersX}
        y={tableY}
        w={tableW}
        rowH={cellH}
        title="customers"
        cols={["id", "name"]}
        rows={customers.map((c) => [c.id, c.name])}
        accent="#10b981"
        appearAt={20}
        frame={frame}
        fps={fps}
      />

      {/* Orders table */}
      <Table
        x={startOrdersX}
        y={tableY}
        w={tableW}
        rowH={cellH}
        title="orders"
        cols={["id", "customer_id", "total"]}
        rows={orders.map((o) => [o.id, o.customer_id, o.total])}
        accent="#6366f1"
        appearAt={40}
        frame={frame}
        fps={fps}
      />

      {/* Connector lines for matches */}
      <Sequence from={90}>
        <Connectors width={width} height={height} customers={customers} orders={orders} startCustomersX={startCustomersX + tableW} startOrdersX={startOrdersX} tableY={tableY} cellH={cellH} frame={frame - 90} />
      </Sequence>

      {/* Caption explaining match status */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: tableY + customers.length * cellH + 80, opacity: interpolate(frame, [110, 130], [0, 1], { extrapolateRight: "clamp" }) }}>
        <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", maxWidth: width * 0.7 }}>
          {isLeft && leftOnly.length > 0 && (
            <span><span style={{ color: "#fbbf24", fontWeight: 600 }}>{leftOnly.map((l) => l.name).join(", ")}</span> have no orders — kept in <code>LEFT JOIN</code> with NULLs.<br/></span>
          )}
          Order <span style={{ color: "#f87171", fontWeight: 600 }}>104</span> points to customer 5 — orphan, excluded either way.
        </div>
      </AbsoluteFill>

      {/* Result table — animates in */}
      <Sequence from={150}>
        <ResultTable
          frame={frame - 150}
          fps={fps}
          y={resultY}
          width={width}
          rowH={cellH}
          rows={result}
          joinType={joinType}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

interface TableProps {
  x: number; y: number; w: number; rowH: number;
  title: string; cols: string[]; rows: (string | number | null)[][];
  accent: string; appearAt: number; frame: number; fps: number;
}
const Table: React.FC<TableProps> = ({ x, y, w, rowH, title, cols, rows, accent, appearAt, frame, fps }) => {
  const enter = spring({ frame: frame - appearAt, fps, config: { damping: 14, stiffness: 90 } });
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: w,
      transform: `translateY(${(1 - enter) * 30}px) scale(${0.94 + enter * 0.06})`,
      opacity: enter,
    }}>
      <div style={{ fontFamily: "JetBrains Mono, monospace", color: accent, fontSize: 14, marginBottom: 6 }}>{title}</div>
      <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${accent}33` }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, 1fr)`, background: `${accent}22`, padding: "6px 10px", fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#e2e8f0", letterSpacing: "0.03em" }}>
          {cols.map((c) => <div key={c}>{c}</div>)}
        </div>
        {rows.map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, 1fr)`, padding: `${(rowH - 16) / 2}px 10px`, fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#cbd5e1", borderTop: i > 0 ? "1px solid rgba(148, 163, 184, 0.1)" : undefined }}>
            {row.map((cell, j) => <div key={j}>{cell === null ? <span style={{ color: "#475569" }}>NULL</span> : String(cell)}</div>)}
          </div>
        ))}
      </div>
    </div>
  );
};

const Connectors: React.FC<{ width: number; height: number; customers: typeof customers; orders: typeof orders; startCustomersX: number; startOrdersX: number; tableY: number; cellH: number; frame: number }> = ({ customers, orders, startCustomersX, startOrdersX, tableY, cellH, frame }) => {
  const headerH = 28;
  const titleH = 26;
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      {orders.map((o, oi) => {
        const customer = customers.find((c) => c.id === o.customer_id);
        if (!customer) return null;
        const ci = customers.findIndex((c) => c.id === customer.id);
        const x1 = startCustomersX;
        const y1 = tableY + titleH + headerH + ci * cellH + cellH / 2;
        const x2 = startOrdersX;
        const y2 = tableY + titleH + headerH + oi * cellH + cellH / 2;
        const reveal = interpolate(frame, [oi * 6, oi * 6 + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const path = `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;
        return (
          <path
            key={o.id}
            d={path}
            stroke="#22d3ee"
            strokeWidth={2}
            fill="none"
            strokeDasharray={400}
            strokeDashoffset={400 * (1 - reveal)}
            opacity={0.7}
          />
        );
      })}
    </svg>
  );
};

const ResultTable: React.FC<{ frame: number; fps: number; y: number; width: number; rowH: number; rows: { id: number; name?: string; total: number | null; order_id?: number | null }[]; joinType: "INNER" | "LEFT" }> = ({ frame, fps, y, width, rowH, rows, joinType }) => {
  const tableW = Math.min(360, width * 0.5);
  const x = (width - tableW) / 2;
  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 80 } });
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: tableW,
      transform: `translateY(${(1 - enter) * 40}px)`,
      opacity: enter,
    }}>
      <div style={{ fontFamily: "JetBrains Mono, monospace", color: "#22d3ee", fontSize: 14, marginBottom: 6, textAlign: "center" }}>
        result of {joinType} JOIN
      </div>
      <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid rgba(34, 211, 238, 0.3)", background: "rgba(34, 211, 238, 0.05)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr", background: "rgba(34, 211, 238, 0.15)", padding: "6px 10px", fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#e2e8f0" }}>
          <div>id</div><div>name</div><div>order_id</div><div>total</div>
        </div>
        {rows.map((r, i) => {
          const rowEnter = spring({ frame: frame - 4 - i * 3, fps, config: { damping: 16, stiffness: 100 } });
          return (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr",
              padding: `${(rowH - 16) / 2}px 10px`,
              fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#e0f2fe",
              opacity: rowEnter, transform: `translateX(${(1 - rowEnter) * -10}px)`,
              borderTop: i > 0 ? "1px solid rgba(148, 163, 184, 0.1)" : undefined,
            }}>
              <div>{r.id}</div>
              <div>{r.name ?? <span style={{ color: "#475569" }}>NULL</span>}</div>
              <div>{r.order_id ?? <span style={{ color: "#475569" }}>NULL</span>}</div>
              <div>{r.total ?? <span style={{ color: "#475569" }}>NULL</span>}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
