import type { Metadata } from "next";
import Link from "next/link";
import { VerificationResendForm } from "../components/verification-resend-form";
import { RoleAwareLogoLink } from "../components/role-aware-logo-link";

export const metadata: Metadata = {
  title: "Resend Verification | Class Hub",
  description: "Send a new Class Hub email verification link.",
};

export default function ResendVerificationPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-50 px-4 py-10 text-slate-950 dark:bg-[#070b12] dark:text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.24),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.22),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.95),rgba(241,245,249,0.96))] dark:bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_34%),linear-gradient(180deg,#070b12,#0f172a)]" />

      <section className="w-full max-w-lg rounded-[2rem] border border-white/70 bg-white/76 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 sm:p-8">
        <RoleAwareLogoLink className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-lg font-black text-white shadow-lg shadow-cyan-500/20 dark:bg-white dark:text-slate-950">
            CH
          </span>
          <span className="text-xl font-black tracking-tight">Class Hub</span>
        </RoleAwareLogoLink>
        <p className="mt-8 text-sm font-black uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">
          Email verification
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
          Send a fresh verification link.
        </h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
          Enter the email you used for Class Hub and we will send a new link if
          the account still needs verification.
        </p>

        <VerificationResendForm />

        <p className="mt-6 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
          Already verified?{" "}
          <Link href="/login" className="font-black text-cyan-700 dark:text-cyan-200">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
