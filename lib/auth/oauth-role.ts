import { createHmac, timingSafeEqual } from "crypto";

export const googleOAuthRoleCookie = "classhub_google_oauth_role";
export const googleOAuthRoleMaxAge = 10 * 60;

export type GoogleOAuthRole = "student" | "teacher";

const roleValues = new Set<GoogleOAuthRole>(["student", "teacher"]);

export function parseGoogleOAuthRole(role: unknown): GoogleOAuthRole | null {
  if (role === "student" || role === "educator" || role === "teacher") {
    return role === "student" ? "student" : "teacher";
  }

  return null;
}

export function defaultGoogleOAuthRole(): GoogleOAuthRole {
  return "student";
}

function signingSecret() {
  return process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "classhub-local-oauth-role";
}

function signPayload(payload: string) {
  return createHmac("sha256", signingSecret()).update(payload).digest("base64url");
}

export function createGoogleOAuthRoleCookie(role: GoogleOAuthRole) {
  const issuedAt = Date.now().toString();
  const payload = `${role}.${issuedAt}`;

  return `${payload}.${signPayload(payload)}`;
}

export function readGoogleOAuthRoleCookie(value: string | undefined) {
  if (!value) {
    return defaultGoogleOAuthRole();
  }

  const [role, issuedAt, signature] = value.split(".");

  if (!roleValues.has(role as GoogleOAuthRole) || !issuedAt || !signature) {
    return defaultGoogleOAuthRole();
  }

  const issuedAtMs = Number(issuedAt);

  if (!Number.isFinite(issuedAtMs) || Date.now() - issuedAtMs > googleOAuthRoleMaxAge * 1000) {
    return defaultGoogleOAuthRole();
  }

  const expectedSignature = signPayload(`${role}.${issuedAt}`);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return defaultGoogleOAuthRole();
  }

  return role as GoogleOAuthRole;
}
