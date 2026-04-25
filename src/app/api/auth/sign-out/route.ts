import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

// Always redirect to "/" on the same host the request came from. This
// works in dev and prod without depending on NEXT_PUBLIC_APP_URL.
export async function POST(req: Request) {
  await signOut();
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
