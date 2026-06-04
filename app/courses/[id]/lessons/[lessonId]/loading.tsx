export default function LoadingLessonPlayer() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f8fb] px-4 py-5 text-slate-950 dark:bg-[#070b12] dark:text-white sm:px-6 lg:px-8">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_8%_8%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_92%_18%,rgba(99,102,241,0.14),transparent_30%),linear-gradient(180deg,#f8fafc,#eef3f9)] dark:bg-[radial-gradient(circle_at_8%_8%,rgba(45,212,191,0.14),transparent_30%),radial-gradient(circle_at_92%_18%,rgba(129,140,248,0.14),transparent_30%),linear-gradient(180deg,#070b12,#0f172a)]" />
      <div className="mx-auto grid max-w-[1560px] gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-5">
          <div className="h-5 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
          <div className="aspect-video animate-pulse rounded-[1.75rem] bg-slate-200 shadow-2xl shadow-slate-900/5 dark:bg-white/10" />
          <div className="h-44 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/72 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10" />
          <div className="grid gap-5 xl:grid-cols-2">
            <div className="h-64 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/72 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10" />
            <div className="h-64 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/72 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10" />
          </div>
        </div>
        <div className="h-[720px] animate-pulse rounded-[1.75rem] border border-white/70 bg-white/72 shadow-2xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10" />
      </div>
    </main>
  );
}
