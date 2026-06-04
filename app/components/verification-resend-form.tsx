"use client";

import { FormEvent, useState } from "react";

type ResendState = {
  message: string;
  variant: "idle" | "success" | "error";
};

export function VerificationResendForm({
  initialEmail = "",
}: Readonly<{ initialEmail?: string }>) {
  const [email, setEmail] = useState(initialEmail);
  const [state, setState] = useState<ResendState>({
    message: "",
    variant: "idle",
  });
  const [isLoading, setIsLoading] = useState(false);

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setState({ message: "", variant: "idle" });

    const response = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const result = (await response.json()) as { message?: string };

    setIsLoading(false);
    setState({
      message:
        result.message ??
        (response.ok
          ? "Verification email sent."
          : "Unable to send verification email."),
      variant: response.ok ? "success" : "error",
    });
  }

  return (
    <form onSubmit={submitForm} className="mt-6 space-y-4" noValidate>
      <label className="block">
        <span className="text-sm font-black text-slate-700 dark:text-slate-200">
          Email address
        </span>
        <input
          autoComplete="email"
          className="mt-2 h-13 w-full rounded-2xl border border-slate-200 bg-white/75 px-4 text-sm font-semibold text-slate-950 outline-none backdrop-blur-xl transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/15 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-slate-500"
          inputMode="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@classhub.com"
          type="email"
          value={email}
        />
      </label>

      {state.message ? (
        <p
          className={`text-sm font-semibold ${
            state.variant === "success" ? "text-emerald-600" : "text-rose-500"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <button
        className="flex h-13 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 text-sm font-black text-white shadow-xl shadow-cyan-500/25 transition hover:-translate-y-0.5 hover:shadow-cyan-500/35 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? "Sending..." : "Resend Verification Email"}
      </button>
    </form>
  );
}
