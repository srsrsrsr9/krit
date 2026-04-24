# AI.md — AI Feature Integration

---

## When This File Applies

Load this file whenever the task involves:
- Calling an LLM API (Anthropic, OpenAI, etc.)
- Building features powered by AI (chat, generation, classification, extraction)
- Prompt engineering or management
- AI output validation or moderation
- Agents or tool use within the application

This file covers AI as a **feature inside your app** — not Claude Code itself.

---

## Core Principles

**AI is an unreliable dependency.** Unlike a database query that either succeeds or fails
predictably, LLM responses are probabilistic. They can be wrong, incomplete, badly formatted,
or refused. Every AI call needs a fallback path.

**Treat AI outputs as untrusted input.** Validate, sanitise, and type-check every response
before it touches your data layer or renders to users. An LLM response is not trusted
just because your code requested it.

**Cost and latency are first-class concerns.** LLM calls are 10-100x more expensive than
database queries and 10-100x slower. Design around this from the start, not as an
afterthought when the bill arrives.

---

## SDK Setup

```bash
npm install @anthropic-ai/sdk    # Anthropic (Claude)
npm install openai               # OpenAI
```

```ts
// lib/ai.ts — single shared client, never instantiate in component files
import Anthropic from "@anthropic-ai/sdk"

export const anthropic = new Anthropic({
  apiKey: process.env.MYAPP_ANTHROPIC_KEY,
})

// lib/openai.ts — if using OpenAI
import OpenAI from "openai"

export const openai = new OpenAI({
  apiKey: process.env.MYAPP_OPENAI_KEY,
})
```

**Rules:**
- Never instantiate AI clients in component files — always import from `lib/ai.ts`.
- Never put API keys in client-side code. AI calls always go through your API routes.
- Name keys after the project: `MYAPP_ANTHROPIC_KEY`, not `ANTHROPIC_API_KEY`.

---

## Prompt Management

### Never hardcode prompts inline

```ts
// ❌ Wrong — prompt is buried in business logic, impossible to test or version
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-6",
  messages: [{ role: "user", content: `Summarise this: ${text}` }]
})

// ✅ Correct — prompts are named, versioned, testable
import { buildSummaryPrompt } from "@/lib/prompts/summary"

const response = await anthropic.messages.create({
  model: "claude-sonnet-4-6",
  messages: buildSummaryPrompt({ text, maxLength: 200 })
})
```

### Prompt files

```ts
// lib/prompts/summary.ts
import type { MessageParam } from "@anthropic-ai/sdk/resources"

type SummaryPromptInput = {
  text: string
  maxLength?: number
  tone?: "formal" | "casual"
}

export function buildSummaryPrompt({
  text,
  maxLength = 150,
  tone = "formal",
}: SummaryPromptInput): MessageParam[] {
  return [
    {
      role: "user",
      content: [
        `Summarise the following text in ${maxLength} words or fewer.`,
        `Tone: ${tone}.`,
        `Return only the summary — no preamble, no explanation.`,
        ``,
        `Text to summarise:`,
        text,
      ].join("\n"),
    },
  ]
}
```

**Rules:**
- Every prompt lives in `lib/prompts/[name].ts`.
- Prompts are functions that accept typed inputs and return `MessageParam[]`.
- System prompts are separate from user prompts — don't merge them.
- Prompt text is never constructed with template literals directly in route handlers.

---

## Structured Output / Output Validation

Never trust that the AI returned what you asked for. Always validate the shape.

```ts
// lib/prompts/classify.ts
import { z } from "zod"

const ClassificationSchema = z.object({
  category:   z.enum(["billing", "technical", "general", "abuse"]),
  confidence: z.number().min(0).max(1),
  reasoning:  z.string().max(500),
})

export type Classification = z.infer<typeof ClassificationSchema>

export function buildClassifyPrompt(ticket: string): string {
  return [
    "Classify the following support ticket.",
    "Respond with ONLY valid JSON matching this schema:",
    JSON.stringify(ClassificationSchema.shape, null, 2),
    "",
    "Ticket:",
    ticket,
  ].join("\n")
}

export function parseClassification(raw: string): Classification {
  // Strip markdown code fences if present
  const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim()
  const parsed = JSON.parse(cleaned)
  return ClassificationSchema.parse(parsed)  // throws if invalid
}
```

```ts
// Usage in API route
try {
  const raw = await callAI(buildClassifyPrompt(ticket))
  const classification = parseClassification(raw)
  // classification is fully typed and validated
} catch (err) {
  // JSON parse failed or schema validation failed
  logger.error({ err, ticket }, "Classification parsing failed")
  return { category: "general", confidence: 0, reasoning: "parse_failed" }
}
```

**Rules:**
- Define a Zod schema for every structured output.
- Parse with the schema — don't trust the shape even if it "looks right."
- Always handle parse failures with a sensible fallback, never let them crash.

---

## Token Budgeting

```ts
// lib/ai.ts
export const TOKEN_LIMITS = {
  summary:      500,    // short summaries
  classification: 200,  // classification with reasoning
  generation:  2000,    // content generation
  analysis:    4000,    // document analysis
} as const

// Always set max_tokens explicitly — never let it default
const response = await anthropic.messages.create({
  model:      "claude-sonnet-4-6",
  max_tokens: TOKEN_LIMITS.summary,
  messages:   buildSummaryPrompt({ text }),
})
```

**Cost awareness:**
- `claude-haiku-4-5` → use for classification, extraction, short tasks
- `claude-sonnet-4-6` → use for generation, analysis, moderate complexity
- `claude-opus-4-6` → use only when quality is critical and cost is justified

Document the model choice and rationale in `docs/DECISIONS.md`.

**Rules:**
- Always set `max_tokens` explicitly.
- Use the cheapest model that meets the quality requirement.
- Log token usage per call for cost monitoring (see Observability section).
- Set a monthly spend alert in the API provider dashboard.

---

## Streaming

For user-facing features where latency matters, stream the response:

```ts
// app/api/chat/route.ts
import { anthropic } from "@/lib/ai"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const stream = anthropic.messages.stream({
    model:      "claude-sonnet-4-6",
    max_tokens: 1000,
    messages,
  })

  // Convert to a Web ReadableStream for the response
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
```

```tsx
// Client-side consumption with useChat (Vercel AI SDK) if preferred
import { useChat } from "ai/react"

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  })
  // ...
}
```

---

## Guardrails

### Input guardrails — before sending to the AI

```ts
// lib/ai-guardrails.ts

const MAX_INPUT_CHARS = 50_000   // ~12k tokens — adjust per use case

export function validateAIInput(input: string): Result<string> {
  if (!input.trim()) {
    return { ok: false, error: "Input cannot be empty" }
  }
  if (input.length > MAX_INPUT_CHARS) {
    return { ok: false, error: "Input too long" }
  }
  // Block prompt injection attempts
  const injectionPatterns = [
    /ignore previous instructions/i,
    /you are now/i,
    /system prompt/i,
  ]
  if (injectionPatterns.some(p => p.test(input))) {
    logger.warn({ input: input.slice(0, 100) }, "Potential prompt injection blocked")
    return { ok: false, error: "Input contains disallowed content" }
  }
  return { ok: true, data: input }
}
```

### Output guardrails — after receiving from the AI

```ts
export function validateAIOutput(output: string): Result<string> {
  if (!output.trim()) {
    return { ok: false, error: "Empty response from AI" }
  }
  // Check for known refusal patterns
  const refusalPatterns = [
    /I cannot (help|assist|provide)/i,
    /I'm (unable|not able) to/i,
    /This (request|content) (violates|goes against)/i,
  ]
  if (refusalPatterns.some(p => p.test(output))) {
    return { ok: false, error: "ai_refusal" }
  }
  return { ok: true, data: output }
}
```

**Rules:**
- Always validate inputs before sending — length, content, injection patterns.
- Always validate outputs before using — empty check, refusal detection, schema validation.
- Log both validated-and-blocked and validation-failures for monitoring.

---

## Error Handling & Fallbacks

AI calls fail. Rate limits, timeouts, model errors, refusals. Every AI call needs a fallback.

```ts
// lib/ai-client.ts
import type { Result } from "@/lib/types"
import { captureError } from "@/lib/monitoring"
import { logger } from "@/lib/logger"
import { anthropic, TOKEN_LIMITS } from "@/lib/ai"

type AICallOptions = {
  prompt: string
  maxTokens?: number
  model?: string
  timeoutMs?: number
}

export async function callAI({
  prompt,
  maxTokens = TOKEN_LIMITS.generation,
  model = "claude-sonnet-4-6",
  timeoutMs = 30_000,
}: AICallOptions): Promise<Result<string>> {
  const start = performance.now()

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    const response = await anthropic.messages.create(
      {
        model,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      },
      { signal: controller.signal }
    )

    clearTimeout(timeout)

    const durationMs = Math.round(performance.now() - start)
    logger.info({
      model,
      inputTokens:  response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      durationMs,
    }, "AI call completed")

    const text = response.content
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("")

    return { ok: true, data: text }

  } catch (err) {
    const durationMs = Math.round(performance.now() - start)

    if (err instanceof Error && err.name === "AbortError") {
      logger.warn({ model, timeoutMs, durationMs }, "AI call timed out")
      return { ok: false, error: "ai_timeout" }
    }

    captureError(err, { model, durationMs })
    return { ok: false, error: "ai_error" }
  }
}
```

**Fallback strategy — define before building:**

```ts
// Always decide what happens when AI fails
const result = await callAI({ prompt: buildSummaryPrompt({ text }) })

if (!result.ok) {
  switch (result.error) {
    case "ai_timeout":
      // Show truncated original text as fallback
      return text.slice(0, 300) + "..."
    case "ai_refusal":
      // Log and return a neutral message
      return "Summary unavailable for this content."
    default:
      // Log and show a user-safe error
      return null  // caller renders a "Summary unavailable" state
  }
}
```

---

## Observability

Log every AI call. This is how you catch cost spikes, quality regressions, and prompt failures.

```ts
// lib/ai-logger.ts — wrap callAI to log to your observability tool

// Minimum fields to log for every call:
type AICallLog = {
  feature:      string   // which feature made this call ("ticket-classification")
  model:        string
  inputTokens:  number
  outputTokens: number
  durationMs:   number
  success:      boolean
  errorType?:   string
  // NEVER log the full prompt or response if they contain user PII
}
```

**Recommended tools:**
- [Langfuse](https://langfuse.com) — open source, self-hostable, traces + evals
- [Helicone](https://helicone.ai) — proxy-based, zero code change
- [LangSmith](https://smith.langchain.com) — if using LangChain

**At minimum, log to your structured logger with the fields above.**
Even without a dedicated tool, you need token usage per feature to understand costs.

---

## Prompt Versioning & Evals

### Versioning

Track prompt changes the same way you track code changes. A prompt change is a code change.

```ts
// lib/prompts/summary.ts
export const SUMMARY_PROMPT_VERSION = "v3"  // bump when prompt changes

// Log the version with every call
logger.info({ promptVersion: SUMMARY_PROMPT_VERSION, ... }, "AI call")
```

Append to `docs/DECISIONS.md` when a prompt changes meaningfully:
```
## [2026-04-01] — Summary prompt v2 → v3
Context: v2 was producing overly formal summaries for casual content
Change: Added tone parameter, default casual for short texts
Result: Manual review of 20 samples showed improvement
```

### Evals

For any AI feature that needs reliable quality, build an eval before shipping to production:

```ts
// evals/summary.eval.ts
const testCases = [
  {
    input: "Long technical document...",
    expectedContains: ["key finding", "recommendation"],
    maxLength: 150,
  },
  // ...10-20 representative cases
]

for (const tc of testCases) {
  const result = await callAI({ prompt: buildSummaryPrompt({ text: tc.input }) })
  assert(result.ok, "AI call should succeed")
  assert(result.data.length <= tc.maxLength, "Summary should be within length limit")
  for (const phrase of tc.expectedContains) {
    assert(result.data.toLowerCase().includes(phrase), `Should contain "${phrase}"`)
  }
}
```

Run evals manually before deploying prompt changes. Not in CI (cost + latency), but as
a pre-deploy checklist step when prompts change.

---

## Rate Limiting AI Endpoints

AI endpoints need stricter rate limiting than regular endpoints — token costs mean a
single abusive user can generate significant charges.

```ts
// Stricter limits for AI endpoints
export const aiRateLimiter = new Ratelimit({
  redis:   Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),  // 10 AI calls per minute per user
  analytics: true,
})

// In API route
const { success, remaining } = await aiRateLimiter.limit(session.user.id)
if (!success) {
  return Response.json(
    { error: "Rate limit exceeded. Please wait before making more requests." },
    { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
  )
}
```

---

## Agents & Tool Use

If the app uses LLM tool/function calling (agent patterns):

```ts
// Define tools with strict Zod schemas — the LLM will hallucinate parameters
// if schemas are vague
const tools = [
  {
    name: "get_order",
    description: "Retrieve a specific order by ID. Use when the user asks about a specific order.",
    input_schema: {
      type: "object",
      properties: {
        order_id: { type: "string", description: "The order ID (format: ord_xxxxx)" },
      },
      required: ["order_id"],
    },
  },
]

// Execute tool calls with the same validation as API input
async function executeTool(name: string, input: unknown): Promise<Result<unknown>> {
  switch (name) {
    case "get_order": {
      const parsed = GetOrderInputSchema.safeParse(input)
      if (!parsed.success) return { ok: false, error: "Invalid tool input" }
      return getOrder(parsed.data.order_id)
    }
    default:
      return { ok: false, error: `Unknown tool: ${name}` }
  }
}
```

**Rules for agents:**
- Every tool must validate its inputs with Zod — never trust the LLM's parameter values.
- Tools that write data (create, update, delete) must verify the user is authorised.
- Log every tool call and its result — agents are harder to debug without traces.
- Implement a maximum turn limit to prevent infinite agent loops.
- Human-in-the-loop: for tools with irreversible effects (send email, charge payment),
  confirm with the user before executing.

---

## ENV.md Entries for AI Features

Add these when AI is enabled:

```
## MYAPP_ANTHROPIC_KEY
- Service: Anthropic
- Purpose: AI feature calls via @anthropic-ai/sdk
- Expiry: never
- Environment: all (same key, usage tracked separately per env)

## MYAPP_OPENAI_KEY (if used)
- Service: OpenAI
- Purpose: [describe use]
- Expiry: never
```

Set a monthly spend alert in both the Anthropic and OpenAI dashboards.
The alert threshold should be 2x your expected monthly cost as a warning,
and 4x as a hard limit.

---

## Self-Check — Run Before Shipping Any AI Feature

```
[ ] Is the AI client initialised in lib/ai.ts, not inline in route handlers?
[ ] Is every prompt in lib/prompts/, not hardcoded in route/component files?
[ ] Is the API key server-only (no NEXT_PUBLIC_ prefix)?
[ ] Is max_tokens set explicitly on every call?
[ ] Is the model choice documented and appropriate for the task?
[ ] Is there a fallback for every failure mode (timeout, refusal, parse error)?
[ ] Is the output validated against a Zod schema if structured data is expected?
[ ] Is token usage logged per call?
[ ] Is there rate limiting on the AI endpoint?
[ ] For agent tool use: are all tool inputs validated, and are write tools auth-checked?
[ ] Is there a spend alert set in the API provider dashboard?
```
