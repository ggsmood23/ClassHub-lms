export default function LoadingCourses() {
  return (
    <section className="min-h-screen overflow-hidden bg-[#f6f8fb] text-slate-950 dark:bg-[#070b12] dark:text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-2xl shadow-cyan-500/10 dark:border-white/10 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <div className="h-8 w-48 animate-pulse rounded-full bg-white/10" />
              <div className="mt-6 h-12 max-w-2xl animate-pulse rounded-full bg-white/10" />
              <div className="mt-4 h-5 max-w-xl animate-pulse rounded-full bg-white/10" />
            </div>
            <div className="h-24 w-36 animate-pulse rounded-[1.5rem] bg-white/10" />
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-white/60 bg-white/72 p-4 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/62">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="h-12 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-10 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-white/10"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/72 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10"
            >
              <div className="aspect-[16/9] animate-pulse bg-slate-200 dark:bg-white/10" />
              <div className="space-y-4 p-5">
                <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
                <div className="h-4 w-full animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
                <div className="h-12 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
