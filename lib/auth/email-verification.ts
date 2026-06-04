import { createHash, randomBytes } from "crypto";

const VERIFICATION_TOKEN_BYTES = 32;
export const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

type VerificationEmailInput = {
  email: string;
  name: string;
  token: string;
};

function getAppUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function createVerificationToken() {
  const token = randomBytes(VERIFICATION_TOKEN_BYTES).toString("hex");

  return {
    expires: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS),
    hash: hashVerificationToken(token),
    token,
  };
}

export function hashVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getVerificationUrl(token: string) {
  const url = new URL("/verify-email", getAppUrl());
  url.searchParams.set("token", token);

  return url.toString();
}

export async function sendVerificationEmail({
  email,
  name,
  token,
}: VerificationEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const verifyUrl = getVerificationUrl(token);
  const safeName = escapeHtml(name || "Class Hub learner");
  const safeVerifyUrl = escapeHtml(verifyUrl);
  const from = process.env.RESEND_FROM_EMAIL || "Class Hub <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Verify your Class Hub email",
      html: `<!doctype html>
<html>
  <body style="margin:0;background:#f8fafc;font-family:Inter,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;border-radius:24px;background:#ffffff;border:1px solid #e2e8f0;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 10px;">
                <p style="margin:0;color:#0891b2;font-size:12px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;">Class Hub</p>
                <h1 style="margin:16px 0 0;font-size:28px;line-height:1.15;color:#020617;">Verify your email</h1>
                <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#475569;">Hi ${safeName}, welcome to Class Hub. Please verify your email address so we can secure your learning workspace.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 8px;">
                <a href="${safeVerifyUrl}" style="display:inline-block;border-radius:16px;background:#0891b2;color:#ffffff;text-decoration:none;font-weight:800;padding:14px 22px;">Verify Email</a>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 28px 28px;">
                <p style="margin:0;font-size:13px;line-height:1.7;color:#64748b;">This link expires in 24 hours. If the button does not work, open this URL:</p>
                <p style="margin:10px 0 0;font-size:13px;line-height:1.6;word-break:break-all;color:#0891b2;">${safeVerifyUrl}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    }),
  });

  if (!response.ok) {
    throw new Error("Verification email could not be sent.");
  }
}
