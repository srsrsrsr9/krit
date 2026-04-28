import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 630 };

interface EvidenceBlobItem { skillName?: string; level?: string; count?: number; }

const LEVEL_FRAC: Record<string, number> = {
  NOVICE: 0.25,
  WORKING: 0.55,
  PROFICIENT: 0.8,
  EXPERT: 1.0,
};

/**
 * OG image for a public credential. Pulls evidence snapshot so the
 * preview shows the actual skills + levels at issue time.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const issued = await db.issuedCredential.findUnique({
    where: { verificationCode: code },
    include: { credential: true, user: true },
  });

  const title = issued?.credential.title ?? "Verified Credential";
  const learner = issued?.user.name ?? "Learner";
  const verCode = issued?.verificationCode ?? code;
  const blob = (Array.isArray(issued?.evidenceBlob) ? issued?.evidenceBlob : []) as EvidenceBlobItem[];
  const skills = blob.slice(0, 6).map((e) => ({
    name: e.skillName ?? "Skill",
    width: typeof e.level === "string" && e.level in LEVEL_FRAC ? LEVEL_FRAC[e.level]! : 0.5,
  }));

  const titleLines = title.split(/\s+/).reduce<string[]>((acc, w) => {
    const last = acc[acc.length - 1] ?? "";
    if ((last + " " + w).trim().length > 16) acc.push(w);
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
              "radial-gradient(circle at 30% 50%, oklch(0.52 0.22 264 / 0.22), transparent 60%)",
          }}
        />

        {/* Seal */}
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 999,
            background: "oklch(0.52 0.22 264)",
            border: "2px solid rgba(255,255,255,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 56,
            color: "white",
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1,
            zIndex: 1,
          }}
        >
          ✓
        </div>

        {/* Copy + bars */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, zIndex: 1 }}>
          <div style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", display: "flex" }}>
            Krit · Verified Credential
          </div>
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column" }}>
            {titleLines.map((line, i) => (
              <div
                key={i}
                style={{ fontSize: 56, fontWeight: 400, lineHeight: 1.05, color: "white", display: "flex" }}
              >
                {line}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, fontSize: 22, color: "rgba(255,255,255,0.55)", display: "flex" }}>
            Earned by{" "}
            <span style={{ color: "white", fontWeight: 500, marginLeft: 8 }}>{learner}</span>
          </div>

          {/* Skill bars */}
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 8 }}>
            {skills.map((s) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 140,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.5)",
                    display: "flex",
                  }}
                >
                  {s.name}
                </div>
                <div
                  style={{
                    width: 320,
                    height: 7,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.1)",
                    display: "flex",
                  }}
                >
                  <div
                    style={{
                      width: 320 * s.width,
                      height: 7,
                      borderRadius: 999,
                      background: "oklch(0.66 0.22 264)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Verification chip */}
          <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                background: "oklch(0.52 0.22 264 / 0.22)",
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ color: "oklch(0.66 0.22 264)", display: "flex" }}>●</span>
              {verCode} · krit.so/credentials/{verCode}
            </div>
          </div>
        </div>

        {/* Brand corner */}
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 80,
            fontSize: 28,
            fontWeight: 600,
            display: "flex",
          }}
        >
          Krit
        </div>
      </div>
    ),
    SIZE,
  );
}
