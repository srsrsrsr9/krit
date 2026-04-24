import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { buildTutorSystemPrompt, streamTutorReply } from "@/lib/ai";
import { captureError } from "@/lib/logger";

export const runtime = "nodejs";

const Body = z.object({
  lessonId: z.string().optional(),
  lessonTitle: z.string().optional(),
  lessonSummary: z.string().optional(),
  pathTitle: z.string().optional(),
  skillHints: z.array(z.string()).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .min(1)
    .max(30),
});

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return new Response("Unauthorized", { status: 401 });
    const body = Body.parse(await req.json());

    const system = buildTutorSystemPrompt({
      learnerName: user.name,
      lessonTitle: body.lessonTitle,
      lessonSummary: body.lessonSummary,
      pathTitle: body.pathTitle,
      skillHints: body.skillHints,
    });

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const enc = new TextEncoder();
        try {
          for await (const chunk of streamTutorReply(system, body.messages)) {
            controller.enqueue(enc.encode(chunk));
          }
        } catch (e) {
          captureError(e, { route: "tutor" });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (e) {
    captureError(e, { route: "tutor" });
    return new Response("Server error", { status: 500 });
  }
}
