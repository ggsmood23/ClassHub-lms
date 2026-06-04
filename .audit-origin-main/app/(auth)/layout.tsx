import Link from "next/link";
import { ThemeToggle } from "../components/theme-toggle";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#070b12] dark:text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.24),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.22),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.95),rgba(241,245,249,0.96))] dark:bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_34%),linear-gradient(180deg,#070b12,#0f172a)]" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-lg font-black text-white shadow-lg shadow-cyan-500/20 dark:bg-white dark:text-slate-950">
            CH
          </span>
          <span className="text-xl font-black tracking-tight">Class Hub</span>
        </Link>
        <ThemeToggle />
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-84px)] max-w-7xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <aside className="hidden animate-fade-up lg:block">
          <div className="max-w-xl">
            <p className="inline-flex rounded-full border border-cyan-300/40 bg-white/65 px-4 py-2 text-sm font-black text-cyan-700 shadow-sm backdrop-blur-xl dark:border-cyan-300/20 dark:bg-white/10 dark:text-cyan-200">
              Trusted learning workspace
            </p>
            <h2 className="mt-6 text-6xl font-black leading-[1.02] tracking-tight">
              Your premium gateway to Class Hub.
            </h2>
            <p className="mt-6 text-lg font-semibold leading-8 text-slate-600 dark:text-slate-300">
              Manage courses, cohorts, progress, and credentials from a secure
              SaaS-style learning dashboard built for modern education.
            </p>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["99.9%", "Uptime"],
              ["24/7", "Access"],
              ["80k+", "Learners"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-3xl border border-white/70 bg-white/60 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10"
              >
                <p className="text-2xl font-black">{value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex justify-center lg:justify-end">{children}</div>
      </section>
    </main>
  );
}
