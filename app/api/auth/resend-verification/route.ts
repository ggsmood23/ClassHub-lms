import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import {
  createVerificationToken,
  sendVerificationEmail,
} from "@/lib/auth/email-verification";
import { isValidEmail, normalizeEmail } from "@/lib/auth/validation";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
  } | null;
  const email = normalizeEmail(body?.email ?? "");

  if (!isValidEmail(email)) {
    return Response.json(
      { message: "Enter a valid email address." },
      { status: 400 },
    );
  }

  await connectDB();

  const user = await User.findOne({ email }).select(
    "name email emailVerified +verificationToken +verificationTokenExpires",
  );

  if (!user) {
    return Response.json(
      { message: "No account was found for that email." },
      { status: 404 },
    );
  }

  if (user.emailVerified) {
    return Response.json(
      { message: "This email is already verified. Please sign in." },
      { status: 200 },
    );
  }

  const verification = createVerificationToken();
  user.verificationToken = verification.hash;
  user.verificationTokenExpires = verification.expires;
  await user.save();

  try {
    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token: verification.token,
    });
  } catch {
    return Response.json(
      {
        message:
          "Unable to send verification email right now. Please try again shortly.",
      },
      { status: 502 },
    );
  }

  return Response.json({
    message: "Verification email sent. Please check your inbox.",
  });
}
