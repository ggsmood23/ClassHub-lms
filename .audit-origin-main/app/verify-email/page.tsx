import type { Metadata } from "next";
import Link from "next/link";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { hashVerificationToken } from "@/lib/auth/email-verification";
import { VerificationResendForm } from "../components/verification-resend-form";

type VerificationStatus = "success" | "failed" | "expired";

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "Verify Email | Class Hub",
  description: "Verify your Class Hub account email.",
};

async function verifyToken(token?: string): Promise<{
  status: VerificationStatus;
  email?: string;
}> {
  if (!token) {
    return { status: "failed" };
  }

  await connectDB();

  const user = await User.findOne({
    verificationToken: hashVerificationToken(token),
  }).select("email emailVerified +verificationToken +verificationTokenExpires");

  if (!user) {
    return { status: "failed" };
  }

  if (
    !user.verificationTokenExpires ||
    user.verificationTokenExpires.getTime() < Date.now()
  ) {
    return { email: user.email, status: "expired" };
  }

  user.emailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  return { status: "success" };
}

const pageContent: Record<
  VerificationStatus,
  {
    eyebrow: string;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
  }
> = {
  success: {
    eyebrow: "Email verified",
    title: "Your Class Hub account is ready.",
    description:
      "Thanks for confirming your email. You can now sign in to your learning workspace.",
    actionHref: "/login",
    actionLabel: "Continue to Login",
  },
  failed: {
    eyebrow: "Verification failed",
    title: "This verification link is not valid.",
    description:
      "The link may have already been used or changed. Request a fresh verification email to continue.",
    actionHref: "/resend-verification",
    actionLabel: "Resend Verification Email",
  },
  expired: {
    eyebrow: "Link expired",
    title: "This verification link has expired.",
    description:
      "Verification links are valid for 24 hours. Send a new link and use the latest email in your inbox.",
  },
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const result = await verifyToken(token);
  const content = pageContent[result.status];

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-50 px-4 py-10 text-slate-950 dark:bg-[#070b12] dark:text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.24),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.22),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.95),rgba(241,245,249,0.96))] dark:bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_34%),linear-gradient(180deg,#070b12,#0f172a)]" />

      <section className="w-full max-w-lg rounded-[2rem] border border-white/70 bg-white/76 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">
          {content.eyebrow}
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
          {content.title}
        </h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
          {content.description}
        </p>

        {result.status === "expired" ? (
          <VerificationResendForm initialEmail={result.email} />
        ) : null}

        {content.actionHref && content.actionLabel ? (
          <Link
            className="mt-7 flex h-13 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 text-sm font-black text-white shadow-xl shadow-cyan-500/25 transition hover:-translate-y-0.5 hover:shadow-cyan-500/35"
            href={content.actionHref}
          >
            {content.actionLabel}
          </Link>
        ) : null}
      </section>
    </main>
  );
}
