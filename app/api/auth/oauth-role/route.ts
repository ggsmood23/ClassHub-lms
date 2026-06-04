import { NextResponse } from "next/server";
import {
  createGoogleOAuthRoleCookie,
  googleOAuthRoleCookie,
  googleOAuthRoleMaxAge,
  parseGoogleOAuthRole,
} from "@/lib/auth/oauth-role";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { role?: unknown } | null;
  const role = parseGoogleOAuthRole(body?.role);

  if (!role) {
    return NextResponse.json({ error: "Choose Student or Educator." }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: googleOAuthRoleCookie,
    value: createGoogleOAuthRoleCookie(role),
    httpOnly: true,
    maxAge: googleOAuthRoleMaxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
