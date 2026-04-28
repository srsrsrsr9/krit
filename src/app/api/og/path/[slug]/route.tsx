import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 630 };

/**
 * OG image for a published path. Pulls live data so the preview shows
 * the real title + skills + first-credential time estimate.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = await db.path.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      items: {
        include: {
          lesson: { include: { skills: { include: { skill: true } } } },
          assessment: { include: { skills: { include: { skill: true } } } },
        },
      },
    },
  });

  const title = path?.title ?? "Krit Learning Path";
  const minutes = path?.estimatedMinutes ?? 60;
  const skillSet = new Set<string>();
  for (const it of path?.items ?? []) {
    if (it.lesson) for (const ls of it.lesson.skills) skillSet.add(ls.skill.name);
    if (it.assessment) for (const as of it.assessment.skills) skillSet.add(as.skill.name);
  }
  const pills = [...skillSet].slice(0, 4);
  const itemCount = path?.items.length ?? 0;

  const titleLines = title.split(/\s+/).reduce<string[]>((acc, w) => {
    const last = acc[acc.length - 1] ?? "";
    if ((last + " " + w).trim().length > 14) acc.push(w);
    else acc[acc.length - 1] = (last + " " + w).trim();
    return acc;
  }, [""]);

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          background: "oklch(0.12 0.018 264)",
          fontFamily: "system-ui, sans-serif",
          color: "white",
          position: "relative",
          padding: 80,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 70% 50%, oklch(0.52 0.22 264 / 0.18), transparent 60%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, zIndex: 1 }}>
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", display: "flex" }}>
            Krit · Learning Path
          </div>
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column" }}>
            {titleLines.map((line, i) => (
              <div
                key={i}
                style={{
                  fontSize: 64,
                  fontWeight: 300,
                  lineHeight: 1.05,
                  color: "white",
                  display: "flex",
                }}
              >
                {line}
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 20,
              fontStyle: "italic",
              color: "rgba(255,255,255,0.55)",
              display: "flex",
            }}
          >
            Earn the credential →
          </div>
          <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 12 }}>
            {pills.map((s) => (
              <div
                key={s}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 14,
                  display: "flex",
                }}
              >
                {s}
              </div>
            ))}
          </div>
          <div style={{ marginTop: "auto", display: "flex", gap: 56 }}>
            <Stat value={String(skillSet.size || 4)} label="core skills" />
            <Stat value={`${Math.ceil(minutes / 60)} hr`} label="of content" />
            <Stat value={`${itemCount}`} label="items" />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 56,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            padding: "0 80px",
            fontSize: 15,
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.5)", display: "flex" }}>
            krit.so/learn/{slug}
          </div>
          <div
            style={{
              marginLeft: "auto",
              fontSize: 22,
              fontWeight: 600,
              display: "flex",
            }}
          >
            Krit
          </div>
        </div>
      </div>
    ),
    SIZE,
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 32, fontWeight: 600, color: "white", display: "flex" }}>{value}</div>
      <div style={{ marginTop: 4, fontSize: 14, color: "rgba(255,255,255,0.45)", display: "flex" }}>{label}</div>
    </div>
  );
}
