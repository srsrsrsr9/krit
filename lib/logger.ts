import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
  base: { service: "krit" },
  redact: ["req.headers.authorization", "req.headers.cookie", "password", "token", "email"],
});

// Sentry shim — swap to real Sentry SDK when wired.
export function captureError(e: unknown, context?: Record<string, unknown>) {
  const err = e instanceof Error ? e : new Error(String(e));
  logger.error({ err, ...context }, err.message);
}
