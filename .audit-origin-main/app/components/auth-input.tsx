"use client";

import { useState, type InputHTMLAttributes } from "react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function AuthInput({
  label,
  error,
  type = "text",
  className = "",
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <span className="relative mt-2 block">
        <input
          {...props}
          type={isPassword && showPassword ? "text" : type}
          className={`h-13 w-full rounded-2xl border bg-white/75 px-4 text-sm font-semibold text-slate-950 outline-none backdrop-blur-xl transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/15 dark:bg-white/10 dark:text-white dark:placeholder:text-slate-500 ${
            error
              ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400/15"
              : "border-slate-200 dark:border-white/10"
          } ${isPassword ? "pr-20" : ""} ${className}`}
        />
        {isPassword ? (
          <button
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-xs font-black text-cyan-700 transition hover:bg-cyan-50 dark:text-cyan-200 dark:hover:bg-white/10"
            type="button"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        ) : null}
      </span>
      {error ? (
        <span className="mt-2 block text-sm font-semibold text-rose-500">
          {error}
        </span>
      ) : null}
    </label>
  );
}
