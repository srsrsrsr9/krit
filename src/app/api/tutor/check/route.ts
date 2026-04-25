import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Diagnostic for the AI tutor. Hit this from the browser to see whether
 * the env is correctly set on Vercel. Reveals nothing sensitive.
 */
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const apiKey = process.env.OPENROUTER_API_KEY ?? "";
  const model = process.env.OPENROUTER_MODEL ?? "(default)";
  const keyPresent = apiKey.length > 0;
  const keyLength = apiKey.length;
  const keyPrefix = keyPresent ? apiKey.slice(0, 8) + "…" : "";

  if (!keyPresent) {
    return NextResponse.json({
      ok: false,
      reason: "OPENROUTER_API_KEY env var is not set in this deployment.",
      model,
      keyPresent,
    });
  }

  // Live ping — tries one cheap completion to confirm the key + model work.
  let upstream: { status: number; ok: boolean; body?: unknown } = { status: 0, ok: false };
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Krit",
      },
      body: JSON.stringify({
        model,
        max_tokens: 8,
        messages: [{ role: "user", content: "Say OK." }],
      }),
    });
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    upstream = { status: res.status, ok: res.ok, body };
  } catch (e) {
    upstream = { status: 0, ok: false, body: e instanceof Error ? e.message : String(e) };
  }

  return NextResponse.json({
    ok: upstream.ok,
    keyPresent,
    keyLength,
    keyPrefix,
    model,
    upstream,
  });
}
