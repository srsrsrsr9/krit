import { cache } from "react";
import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import { db } from "./db";

export type SessionData = {
  userId?: string;
  workspaceId?: string;
};

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "dev_only_insecure_secret_please_change_me_now_32b",
  cookieName: "krit_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export async function getSession() {
  const store = await cookies();
  return getIronSession<SessionData>(store, sessionOptions);
}

export async function signIn(userId: string, workspaceId?: string) {
  const session = await getSession();
  session.userId = userId;
  session.workspaceId = workspaceId;
  await session.save();
}

export async function signOut() {
  const session = await getSession();
  session.destroy();
}

// React.cache() dedupes calls within a single server render. The lesson
// page used to query the user twice (once in currentUser, once in
// currentMembership.user). Now both reuse a single round-trip.
export const currentUser = cache(async () => {
  const session = await getSession();
  if (!session.userId) return null;
  return db.user.findUnique({ where: { id: session.userId } });
});

export const currentMembership = cache(async () => {
  const session = await getSession();
  if (!session.userId || !session.workspaceId) return null;
  return db.membership.findUnique({
    where: {
      userId_workspaceId: { userId: session.userId, workspaceId: session.workspaceId },
    },
    include: { workspace: true, user: true },
  });
});

export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireMembership() {
  const m = await currentMembership();
  if (!m) throw new Error("NO_WORKSPACE");
  return m;
}
