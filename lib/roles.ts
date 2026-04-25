import { Role } from "@prisma/client";
import { currentMembership } from "./auth";

export const AUTHOR_ROLES: Role[] = ["OWNER", "ADMIN", "AUTHOR"];
export const ADMIN_ROLES: Role[] = ["OWNER", "ADMIN"];
export const MANAGER_ROLES: Role[] = ["OWNER", "ADMIN", "MANAGER"];
export const INSTRUCTOR_ROLES: Role[] = ["OWNER", "ADMIN", "INSTRUCTOR"];

/**
 * Returns the membership if the current user has one of the allowed roles
 * in their workspace. Throws otherwise.
 */
export async function requireRole(allowed: Role[]) {
  const m = await currentMembership();
  if (!m) throw new Error("UNAUTHORIZED");
  if (!allowed.includes(m.role)) throw new Error("FORBIDDEN");
  return m;
}

/**
 * Same as requireRole but returns null instead of throwing — for UI gating
 * inside server components where we want to redirect or hide instead.
 */
export async function checkRole(allowed: Role[]) {
  const m = await currentMembership();
  if (!m) return null;
  if (!allowed.includes(m.role)) return null;
  return m;
}
