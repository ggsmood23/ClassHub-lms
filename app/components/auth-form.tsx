"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useState } from "react";
import { AuthInput } from "./auth-input";
import { SocialAuthButtons } from "./social-auth-buttons";
import { useToast } from "./toast-provider";
import {
  isValidEmail,
  normalizeEmail,
  validatePassword,
} from "@/lib/auth/validation";

type AuthMode = "login" | "signup" | "forgot";

type FormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: AuthRole;
  remember: boolean;
};

type AuthRole = "admin" | "student" | "teacher";

const initialState: FormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "student",
  remember: true,
};

const roles: Array<{ value: AuthRole; label: string }> = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Educator" },
  { value: "admin", label: "Admin" },
];

export function AuthForm({ mode }: Readonly<{ mode: AuthMode }>) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasSocialProviders, setHasSocialProviders] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const isLogin = mode === "login";
  const isSignup = mode === "signup";
  const title = isLogin
    ? "Welcome back"
    : isSignup
      ? "Create your account"
      : "Reset your password";
  const subtitle = isLogin
    ? "Sign in to continue your learning dashboard."
    : isSignup
      ? "Start building skills with guided courses and mentor support."
      : "Enter your email and we will send password reset instructions.";
  const passwordValidation = validatePassword(form.password);
  const availableRoles = isSignup
    ? roles.filter((role) => role.value !== "admin")
    : roles;
  const canSubmit =
    !isLoading && (!isSignup || passwordValidation.isValid);

  function updateField(field: keyof FormState, value: string | boolean) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  }

  function validate() {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    const normalizedEmail = normalizeEmail(form.email);

    if (isSignup && form.name.trim().length < 2) {
      nextErrors.name = "Enter your full name.";
    }

    if (!isValidEmail(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address, like user@gmail.com.";
    }

    if (isSignup && !passwordValidation.isValid) {
      nextErrors.password = "Choose a stronger password.";
    }

    if (isLogin && !form.password) {
      nextErrors.password = "Enter your password.";
    }

    if (isSignup && form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (!availableRoles.some((role) => role.value === form.role)) {
      nextErrors.role = isSignup
        ? "Choose Student or Educator."
        : "Choose Student, Educator, or Admin.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  const handleSocialProviderCountChange = useCallback((count: number) => {
    setHasSocialProviders(count > 0);
  }, []);

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      showToast({
        title: "Check the form",
        message: "A couple of fields need your attention.",
        variant: "error",
      });
      return;
    }

    setIsLoading(true);

    if (mode === "forgot") {
      setIsLoading(false);
      showToast({
        title: "Reset link sent",
        message: "Check your inbox for next steps.",
        variant: "success",
      });
      return;
    }

    const callbackUrl =
      form.role === "admin"
        ? "/admin"
        : form.role === "teacher"
          ? "/educator/dashboard"
          : "/dashboard";

    const result = await signIn("credentials", {
      redirect: false,
      callbackUrl,
      mode,
      name: form.name,
      email: normalizeEmail(form.email),
      password: form.password,
      role: form.role,
    });

    setIsLoading(false);

    if (result?.error) {
      const isRoleMismatch = result.error.startsWith("You are registered as a ");
      const needsVerification =
        result.error === "Please verify your email before logging in." ||
        result.error.startsWith("Account created, but the verification email");
      const isDuplicate = result.error.startsWith(
        "An account with this email already exists.",
      );

      showToast({
        title: needsVerification
          ? "Check your email"
          : isLogin
            ? "Sign in failed"
            : "Account setup failed",
        message: isRoleMismatch || needsVerification || isDuplicate
          ? result.error
          : isLogin
            ? "Check your email and password, then try again."
            : "Use a different email or try again.",
        variant: needsVerification ? "success" : "error",
      });

      if (needsVerification && isSignup) {
        router.push("/resend-verification");
      }

      return;
    }

    showToast({
      title: isLogin ? "Signed in" : "Account created",
      message: "Taking you to your learning dashboard.",
      variant: "success",
    });
    router.push(result?.url ?? "/dashboard");
    router.refresh();
  }

  return (
    <div className="animate-fade-up w-full max-w-md rounded-[2rem] border border-white/70 bg-white/76 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 sm:p-8">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">
          Class Hub
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
          {subtitle}
        </p>
      </div>

      {mode !== "forgot" ? (
        <>
          <div className="mt-8">
            <SocialAuthButtons
              onProviderCountChange={handleSocialProviderCountChange}
            />
          </div>

          {hasSocialProviders ? (
            <div className="my-7 flex items-center gap-4">
              <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                or continue with email
              </span>
              <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            </div>
          ) : null}
        </>
      ) : null}

      <form
        onSubmit={submitForm}
        className={mode === "forgot" ? "mt-8 space-y-5" : "space-y-5"}
        noValidate
      >
        {mode !== "forgot" ? (
          <RoleSelector
            value={form.role}
            roles={availableRoles}
            error={errors.role}
            disabled={isLoading}
            onChange={(role) => updateField("role", role)}
          />
        ) : null}

        {isSignup ? (
          <AuthInput
            label="Full name"
            autoComplete="name"
            placeholder="Aarav Mehta"
            value={form.name}
            error={errors.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        ) : null}

        <AuthInput
          label="Email address"
          autoComplete="email"
          inputMode="email"
          placeholder="you@classhub.com"
          value={form.email}
          error={errors.email}
          onChange={(event) => updateField("email", event.target.value)}
        />

        {mode !== "forgot" ? (
          <AuthInput
            label="Password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            placeholder="Enter your password"
            type="password"
            value={form.password}
            error={errors.password}
            onChange={(event) => updateField("password", event.target.value)}
          />
        ) : null}

        {isSignup ? <PasswordRequirementList validation={passwordValidation} /> : null}

        {isSignup ? (
          <AuthInput
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Confirm your password"
            type="password"
            value={form.confirmPassword}
            error={errors.confirmPassword}
            onChange={(event) =>
              updateField("confirmPassword", event.target.value)
            }
          />
        ) : null}

        {isLogin ? (
          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-300">
              <input
                checked={form.remember}
                onChange={(event) => updateField("remember", event.target.checked)}
                className="size-4 rounded border-slate-300 accent-cyan-500"
                type="checkbox"
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="font-black text-cyan-700 hover:text-cyan-600 dark:text-cyan-200"
            >
              Forgot password?
            </Link>
          </div>
        ) : null}

        <button
          disabled={!canSubmit}
          className="flex h-13 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 text-sm font-black text-white shadow-xl shadow-cyan-500/25 transition hover:-translate-y-0.5 hover:shadow-cyan-500/35 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          type="submit"
        >
          {isLoading
            ? "Please wait..."
            : isLogin
              ? "Sign in"
              : isSignup
                ? "Create account"
                : "Send reset link"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
        {isLogin ? (
          <>
            New to Class Hub?{" "}
            <Link href="/signup" className="font-black text-cyan-700 dark:text-cyan-200">
              Create an account
            </Link>
            <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
            <Link
              href="/resend-verification"
              className="font-black text-cyan-700 dark:text-cyan-200"
            >
              Resend verification
            </Link>
          </>
        ) : isSignup ? (
          <>
            Already learning here?{" "}
            <Link href="/login" className="font-black text-cyan-700 dark:text-cyan-200">
              Sign in
            </Link>
          </>
        ) : (
          <>
            Remembered your password?{" "}
            <Link href="/login" className="font-black text-cyan-700 dark:text-cyan-200">
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function RoleSelector({
  value,
  roles,
  error,
  disabled,
  onChange,
}: Readonly<{
  value: AuthRole;
  roles: Array<{ value: AuthRole; label: string }>;
  error?: string;
  disabled: boolean;
  onChange: (role: AuthRole) => void;
}>) {
  return (
    <fieldset>
      <legend className="text-sm font-black text-slate-700 dark:text-slate-200">
        I am a
      </legend>
      <div
        className={`mt-2 grid rounded-2xl border border-slate-200 bg-white/70 p-1 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/8 ${
          roles.length === 3 ? "grid-cols-3" : "grid-cols-2"
        }`}
      >
        {roles.map((role) => {
          const checked = value === role.value;

          return (
            <label
              key={role.value}
              className={`relative flex h-11 cursor-pointer items-center justify-center rounded-xl text-sm font-black transition ${
                checked
                  ? "bg-slate-950 text-white shadow-lg shadow-cyan-500/15 dark:bg-white dark:text-slate-950"
                  : "text-slate-500 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
              } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
            >
              <input
                checked={checked}
                disabled={disabled}
                name="role"
                onChange={() => onChange(role.value)}
                type="radio"
                value={role.value}
                className="sr-only"
              />
              {role.label}
            </label>
          );
        })}
      </div>
      {error ? (
        <span className="mt-2 block text-sm font-semibold text-rose-500">
          {error}
        </span>
      ) : null}
    </fieldset>
  );
}

function PasswordRequirementList({
  validation,
}: Readonly<{ validation: ReturnType<typeof validatePassword> }>) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/55 px-3 py-2 dark:border-white/10 dark:bg-white/8">
      <ul className="grid gap-1 text-xs font-bold leading-5 text-slate-500 dark:text-slate-400 sm:grid-cols-2">
        {validation.checks.map((check) => (
          <li
            key={check.label}
            className={`flex items-center gap-1.5 ${
              check.passed
                ? "text-emerald-600 dark:text-emerald-300"
                : "text-rose-500/80 dark:text-slate-400"
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                check.passed
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200"
                  : "bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-400"
              }`}
            >
              {check.passed ? "✓" : "•"}
            </span>
            <span>{check.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
