/**
 * Result<T, E> — a typed success/failure value.
 *
 * Use at data-layer boundaries (server actions, route handlers, services)
 * instead of throwing. Callers must handle both branches, which the type
 * system enforces.
 *
 * Convert to throw only at the framework edge (e.g. Next.js server actions
 * returning to `useFormState` where the framework expects thrown errors).
 * Add a comment at the boundary.
 */

export type Ok<T> = { ok: true; data: T }
export type Err<E> = { ok: false; error: E }
export type Result<T, E = string> = Ok<T> | Err<E>

export const ok = <T>(data: T): Ok<T> => ({ ok: true, data })
export const err = <E>(error: E): Err<E> => ({ ok: false, error })

export const isOk = <T, E>(r: Result<T, E>): r is Ok<T> => r.ok
export const isErr = <T, E>(r: Result<T, E>): r is Err<E> => !r.ok

/**
 * Unwrap or throw. Use only at framework boundaries where throws are expected.
 * Never use inside the data layer — that defeats the point of Result.
 */
export function unwrap<T, E>(r: Result<T, E>): T {
  if (r.ok) return r.data
  throw new Error(typeof r.error === 'string' ? r.error : JSON.stringify(r.error))
}

/** Map the success value. No-op on error. */
export function map<T, U, E>(r: Result<T, E>, f: (t: T) => U): Result<U, E> {
  return r.ok ? ok(f(r.data)) : r
}

/** Map the error value. No-op on success. */
export function mapErr<T, E, F>(r: Result<T, E>, f: (e: E) => F): Result<T, F> {
  return r.ok ? r : err(f(r.error))
}

/** Chain: like flatMap / andThen. */
export function andThen<T, U, E>(
  r: Result<T, E>,
  f: (t: T) => Result<U, E>,
): Result<U, E> {
  return r.ok ? f(r.data) : r
}

/**
 * Wrap an async function that may throw into one that returns Result.
 * Useful at the boundary with third-party libraries that only throw.
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  mapErrMsg: (e: unknown) => string = (e) =>
    e instanceof Error ? e.message : 'Unknown error',
): Promise<Result<T, string>> {
  try {
    return ok(await fn())
  } catch (e) {
    return err(mapErrMsg(e))
  }
}
