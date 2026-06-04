"use client";

import { useEffect, useState } from "react";

type ThemeToggleProps = {
  showLabel?: boolean;
  className?: string;
};

export function ThemeToggle({
  showLabel = false,
  className = "",
}: Readonly<ThemeToggleProps>) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = storedTheme ? storedTheme === "dark" : prefersDark;

    document.documentElement.classList.toggle("dark", shouldUseDark);
    requestAnimationFrame(() => setIsDark(shouldUseDark));
  }, []);

  function toggleTheme() {
    const nextTheme = !isDark;

    setIsDark(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme);
    localStorage.setItem("theme", nextTheme ? "dark" : "light");
  }

  return (
    <button
      onClick={toggleTheme}
      className={`group inline-flex h-12 items-center gap-3 rounded-full border border-white/70 bg-white/70 p-1.5 text-slate-700 shadow-lg shadow-slate-900/5 backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/70 hover:bg-white/90 hover:shadow-cyan-500/15 active:translate-y-0 dark:border-white/10 dark:bg-white/10 dark:text-white dark:shadow-black/20 dark:hover:border-cyan-300/40 dark:hover:bg-white/15 ${className}`}
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span className="relative h-9 w-[4.25rem] rounded-full bg-slate-100/90 p-1 shadow-inner shadow-slate-900/5 transition-colors duration-300 dark:bg-slate-950/75 dark:shadow-black/30">
        <span
          className={`absolute top-1 grid size-7 place-items-center rounded-full shadow-lg transition-all duration-300 ease-out ${
            isDark
              ? "left-[2.25rem] bg-slate-900 text-cyan-200 shadow-cyan-950/30"
              : "left-1 bg-white text-amber-500 shadow-amber-500/20"
          }`}
        >
          <span
            className={`absolute transition duration-300 ${
              isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
            }`}
          >
            <SunIcon />
          </span>
          <span
            className={`absolute transition duration-300 ${
              isDark
                ? "scale-100 rotate-0 opacity-100"
                : "scale-0 -rotate-90 opacity-0"
            }`}
          >
            <MoonIcon />
          </span>
        </span>
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-amber-500/55 transition group-hover:text-amber-500 dark:text-slate-500">
          <SunIcon />
        </span>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 transition group-hover:text-cyan-300 dark:text-cyan-200/70">
          <MoonIcon />
        </span>
      </span>
      {showLabel ? (
        <span className="pr-2 text-sm font-black text-slate-700 transition-colors dark:text-slate-100">
          {isDark ? "Dark" : "Light"}
        </span>
      ) : null}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M20.99 12.85A8.5 8.5 0 1 1 11.15 3a6.5 6.5 0 0 0 9.84 9.85Z" />
    </svg>
  );
}
