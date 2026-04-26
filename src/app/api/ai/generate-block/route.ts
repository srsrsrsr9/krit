import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { ContentBlock } from "@/lib/content/blocks";
import { requireRole, AUTHOR_ROLES } from "@/lib/roles";
import { captureError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  concept: z.string().min(3).max(500),
  lessonTitle: z.string().optional(),
  lessonOutline: z.string().optional(),  // a digest of nearby blocks for context
});

const SYSTEM_PROMPT = `You are a content design assistant for Krit, a skill-first LMS. Given a learning concept, you produce ONE content block in our typed JSON format that best teaches it.

The 12 block types you can choose from. Pick the ONE that best matches the concept.

1. markdown — { "type":"markdown", "md": string }
2. callout — { "type":"callout", "tone":"info"|"tip"|"warn"|"success", "title"?: string, "md": string }
3. code — { "type":"code", "lang": string, "code": string, "caption"?: string }
4. quiz — { "type":"quiz", "prompt": string, "multi": boolean, "choices": [{"id":"a","label":"…","correct":true|false,"explain":"…"}, …] } — 3-4 choices, include explain for each.
5. tryIt — { "type":"tryIt", "instruction": string, "lang"?: string, "starter"?: string, "expected"?: string }
6. keyTakeaways — { "type":"keyTakeaways", "points": string[] } — 3-5 punchy bullets.
7. reflect — { "type":"reflect", "prompt": string }
8. animatedTimeline — { "type":"animatedTimeline", "title"?: string, "steps":[{"label":"…","body":"…","code"?:"…"}, …] } — 3-6 steps.
9. sortableSteps — { "type":"sortableSteps", "prompt": string, "items":[{"id":"x","label":"…","detail"?:"…"}, …], "hint"?: string } — items MUST be in correct order; UI shuffles them.
10. remotion — { "type":"remotion", "composition": "sqlExecutionOrder"|"joinFlow"|"groupByCollapse", "durationFrames": 270-360, "fps":30, "width":1280, "height":720, "caption"?: string, "props": object }
    Pre-built compositions:
    - "sqlExecutionOrder" → no props. Use when teaching the difference between written and executed SQL clause order.
    - "joinFlow" → props: { "joinType": "INNER"|"LEFT" }. Use when introducing JOINs.
    - "groupByCollapse" → no props. Use when introducing GROUP BY / aggregation.
    Use ONLY when the concept matches one of these. Don't invent new composition ids.
11. joinExplorer — interactive JOIN visualizer with live row computation.
    { "type":"joinExplorer", "prompt"?: string, "left":{"name":"…","keyColumn":"…","rows":[{…},…]}, "right":{"name":"…","keyColumn":"…","rows":[{…},…]} }
    Include 3-5 rows per side, with at least one orphan that won't match.
12. sqlPlayground — real browser-side SQL execution.
    { "type":"sqlPlayground", "prompt": string, "tables":[{"name":"…","columns":["…"],"rows":[[…],…]}], "starter"?: string, "expected"?: string, "hint"?: string }
    5-10 rows per table.

PICK THE BEST TYPE for the concept. If concept involves:
- a process or sequence → animatedTimeline or sortableSteps
- SQL JOINs visualisation → joinExplorer or remotion(joinFlow)
- GROUP BY / aggregation → remotion(groupByCollapse) or sqlPlayground
- SQL execution order → remotion(sqlExecutionOrder)
- hands-on practice → sqlPlayground or tryIt
- a misconception or pitfall → callout(warn) or quiz
- summary → keyTakeaways
- otherwise → markdown or callout

OUTPUT FORMAT:
Reply with ONLY a single valid JSON object — no prose, no markdown fence, no commentary. The first character of your response MUST be \`{\` and the last MUST be \`}\`. Property names in double quotes. Strings escaped properly.`;

interface BlockResult {
  ok: true;
  block: z.infer<typeof ContentBlock>;
  modelTookMs: number;
  attempts: number;
}
interface BlockError {
  ok: false;
  error: string;
  rawResponse?: string;
  attempts: number;
}

export async function POST(req: Request) {
  try {
    await requireRole(AUTHOR_ROLES);
    const { concept, lessonTitle, lessonOutline } = Body.parse(await req.json());

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json<BlockError>({ ok: false, error: "OPENROUTER_API_KEY not configured", attempts: 0 }, { status: 503 });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://krit.app",
        "X-Title": "Krit",
      },
    });
    const model = process.env.OPENROUTER_MODEL ?? "deepseek/deepseek-chat";

    const userMessage = [
      `Concept to teach: ${concept}`,
      lessonTitle ? `Lesson: ${lessonTitle}` : null,
      lessonOutline ? `Surrounding content (for context):\n${lessonOutline}` : null,
      "",
      "Produce one content block JSON now.",
    ].filter(Boolean).join("\n");

    let attempts = 0;
    let lastRaw = "";
    let lastError = "";
    const t0 = Date.now();

    // Up to 2 tries: if the model returns invalid JSON or fails Zod, feed
    // the error back and retry once.
    for (attempts = 1; attempts <= 2; attempts++) {
      const completion = await client.chat.completions.create({
        model,
        max_tokens: 1500,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
          ...(attempts > 1 && lastRaw
            ? [
                { role: "assistant" as const, content: lastRaw },
                { role: "user" as const, content: `That output failed validation: ${lastError}\n\nPlease re-emit a single valid JSON object that conforms to one of the block schemas. No prose.` },
              ]
            : []),
        ],
      });

      const raw = completion.choices[0]?.message?.content ?? "";
      lastRaw = raw;
      const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(trimmed);
      } catch (e) {
        lastError = `Not valid JSON: ${e instanceof Error ? e.message : "parse error"}`;
        continue;
      }

      const validated = ContentBlock.safeParse(parsedJson);
      if (validated.success) {
        return NextResponse.json<BlockResult>({
          ok: true,
          block: validated.data,
          modelTookMs: Date.now() - t0,
          attempts,
        });
      }
      lastError = validated.error.issues.slice(0, 3).map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    }

    return NextResponse.json<BlockError>({
      ok: false,
      error: lastError || "Model failed to produce a valid block after 2 attempts.",
      rawResponse: lastRaw.slice(0, 500),
      attempts,
    }, { status: 422 });
  } catch (e) {
    captureError(e, { route: "ai/generate-block" });
    return NextResponse.json<BlockError>({
      ok: false,
      error: e instanceof Error ? e.message : "server_error",
      attempts: 0,
    }, { status: 500 });
  }
}
