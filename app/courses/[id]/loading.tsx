export default function LoadingCourseDetails() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f8fb] px-4 py-8 text-slate-950 dark:bg-[#070b12] dark:text-white sm:px-6 lg:px-8">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_8%_8%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_92%_18%,rgba(99,102,241,0.14),transparent_30%),linear-gradient(180deg,#f8fafc,#eef3f9)] dark:bg-[radial-gradient(circle_at_8%_8%,rgba(45,212,191,0.14),transparent_30%),radial-gradient(circle_at_92%_18%,rgba(129,140,248,0.14),transparent_30%),linear-gradient(180deg,#070b12,#0f172a)]" />
      <div className="mx-auto max-w-7xl">
        <div className="grid overflow-hidden rounded-[2rem] border border-white/70 bg-white/72 shadow-2xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 lg:grid-cols-[minmax(0,1fr)_470px]">
          <div className="space-y-5 p-6 sm:p-8 lg:p-10">
            <div className="h-7 w-44 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
            <div className="h-14 w-full max-w-2xl animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />
            <div className="h-5 w-full max-w-3xl animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
            <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-[1.25rem] bg-slate-200 dark:bg-white/10"
                />
              ))}
            </div>
          </div>
          <div className="min-h-[320px] animate-pulse bg-slate-200 dark:bg-white/10" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/72 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10"
              />
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/72 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10" />
        </div>
      </div>
    </main>
  );
}
