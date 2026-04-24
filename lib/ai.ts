import Anthropic from "@anthropic-ai/sdk";
import { logger } from "./logger";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

let _client: Anthropic | null = null;
function client(): Anthropic | null {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  _client = new Anthropic({ apiKey });
  return _client;
}

export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export interface TutorContext {
  learnerName: string;
  lessonTitle?: string;
  lessonSummary?: string;
  pathTitle?: string;
  skillHints?: string[];
  recentWrongAnswers?: { stem: string; chosen: string }[];
}

export function buildTutorSystemPrompt(ctx: TutorContext): string {
  const lines: string[] = [
    "You are Atlas, the learner's personal tutor inside Krit, a skill-first learning platform.",
    "",
    "Principles:",
    "- Be concise. Default to 2–4 short paragraphs or a short list.",
    "- Teach; do not just answer. If the learner asks for the answer to a quiz, redirect with a hint or question.",
    "- Use the learner's current lesson as primary context.",
    "- When code is relevant, show it in fenced blocks with the right language.",
    "- If you don't know, say so; never fabricate API syntax or citations.",
    "- No prefaces ('Great question!'). Get to value in sentence one.",
    "",
    `Learner: ${ctx.learnerName}.`,
  ];
  if (ctx.pathTitle) lines.push(`Current path: ${ctx.pathTitle}.`);
  if (ctx.lessonTitle) lines.push(`Current lesson: ${ctx.lessonTitle}.`);
  if (ctx.lessonSummary) {
    lines.push("Lesson summary (verbatim, cache-pinned):");
    lines.push(ctx.lessonSummary);
  }
  if (ctx.skillHints?.length) {
    lines.push(`Skills being developed: ${ctx.skillHints.join(", ")}.`);
  }
  if (ctx.recentWrongAnswers?.length) {
    lines.push("Recent mistakes (use to tailor hints):");
    for (const w of ctx.recentWrongAnswers) {
      lines.push(`- Q: ${w.stem} | chose: ${w.chosen}`);
    }
  }
  return lines.join("\n");
}

export interface TutorTurn {
  role: "user" | "assistant";
  content: string;
}

/** Streaming response as an async iterable of text chunks. */
export async function* streamTutorReply(
  system: string,
  history: TutorTurn[],
): AsyncGenerator<string, void, unknown> {
  const c = client();
  if (!c) {
    yield fallbackTutorReply(history[history.length - 1]?.content ?? "");
    return;
  }

  try {
    // Cache the (usually longer) system prompt across turns. The SDK's
    // TextBlockParam type doesn't yet expose cache_control in some versions,
    // so we type-erase just that field at the boundary.
    const systemBlocks = [
      { type: "text", text: system, cache_control: { type: "ephemeral" } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as unknown as any;

    const stream = await c.messages.stream({
      model: MODEL,
      max_tokens: 800,
      system: systemBlocks,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
  } catch (e) {
    logger.error({ err: e }, "tutor_stream_failed");
    yield "\n\n(I'm having trouble reaching the tutor right now. Try again in a moment.)";
  }
}

function fallbackTutorReply(userMsg: string): string {
  return [
    "The AI tutor isn't configured yet (no `ANTHROPIC_API_KEY`), so here's a human-written nudge:",
    "",
    "- Re-read the lesson's **Key takeaways** section.",
    "- Try the **Try it** block with a small variation — change a column, a filter, or a join side.",
    "- Still stuck? Flag the quiz question and continue; come back with a night's sleep.",
    "",
    `You asked: "${userMsg.slice(0, 200)}"`,
  ].join("\n");
}
