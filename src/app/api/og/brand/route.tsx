import { ImageResponse } from "next/og";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

/**
 * Krit homepage OG image. Brand-only — used as the site-wide default
 * social preview. Visual derives from design/OG Social Images.html.
 */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "oklch(0.985 0.006 80)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 50%, oklch(0.52 0.22 264 / 0.08), transparent 70%)",
          }}
        />
        <div
          style={{
            fontSize: 140,
            fontWeight: 400,
            color: "oklch(0.14 0.015 264)",
            letterSpacing: "-0.02em",
            display: "flex",
          }}
        >
          Krit
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            fontStyle: "italic",
            color: "oklch(0.42 0.01 264)",
            display: "flex",
          }}
        >
          Learn skills. Not courses. Show your work.
        </div>
        <div style={{ marginTop: 56, display: "flex", gap: 20 }}>
          {["Skill graph", "AI tutor", "Verifiable credentials"].map((label) => (
            <div
              key={label}
              style={{
                padding: "10px 24px",
                borderRadius: 999,
                border: "1px solid oklch(0.52 0.22 264 / 0.4)",
                background: "oklch(0.52 0.22 264 / 0.12)",
                color: "oklch(0.52 0.22 264)",
                fontSize: 18,
                fontWeight: 500,
                display: "flex",
              }}
            >
              {label}
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: "oklch(0.14 0.015 264)",
            color: "rgba(255,255,255,0.6)",
            display: "flex",
            alignItems: "center",
            padding: "0 80px",
            fontSize: 16,
          }}
        >
          <div style={{ display: "flex" }}>krit.so</div>
          <div style={{ flex: 1, textAlign: "center", fontSize: 14, opacity: 0.7, display: "flex", justifyContent: "center" }}>
            Skill-first learning · Free to start · Verifiable credentials
          </div>
          <div style={{ display: "flex", fontSize: 14, opacity: 0.6 }}>© 2026 Krit Learning, Inc.</div>
        </div>
      </div>
    ),
    SIZE,
  );
}
