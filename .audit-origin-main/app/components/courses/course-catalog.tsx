"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Filter, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CourseCard } from "./course-card";
import type { CatalogCourse } from "./course-card";

export function CourseCatalog({ courses }: Readonly<{ courses: CatalogCourse[] }>) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [priceType, setPriceType] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  const courseCategories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          courses
            .map((course) => course.category)
            .filter((item) => item && item !== "Uncategorized"),
        ),
      ).sort(),
    ],
    [courses],
  );

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesCategory = category === "All" || course.category === category;
      const matchesLevel = level === "All" || course.difficulty === level;
      const matchesPriceType =
        priceType === "All" ||
        (priceType === "Free" && !course.isPaid) ||
        (priceType === "Paid" && course.isPaid);
      const matchesQuery =
        !normalizedQuery ||
        [course.title, course.category]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesLevel && matchesPriceType && matchesQuery;
    });
  }, [category, courses, level, priceType, query]);

  return (
    <section className="min-h-screen overflow-hidden bg-[#f6f8fb] text-slate-950 dark:bg-[#070b12] dark:text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_8%_8%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_92%_18%,rgba(99,102,241,0.14),transparent_30%),linear-gradient(180deg,#f8fafc,#eef3f9)] dark:bg-[radial-gradient(circle_at_8%_8%,rgba(45,212,191,0.14),transparent_30%),radial-gradient(circle_at_92%_18%,rgba(129,140,248,0.14),transparent_30%),linear-gradient(180deg,#070b12,#0f172a)]" />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          className="overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-2xl shadow-cyan-500/10 dark:border-white/10 sm:p-8"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black text-cyan-100">
                <Sparkles className="size-4" />
                Premium course catalog
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                Find the next Class Hub course for your growth path.
              </h1>
              <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-300 sm:text-base">
                Search expert-led courses, compare categories, and continue
                enrolled tracks with progress-aware course cards.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-3xl font-black">{courses.length}</p>
              <p className="mt-1 text-sm font-bold text-slate-300">curated courses</p>
            </div>
          </div>
        </motion.div>

        <div className="sticky top-0 z-20 -mx-4 mt-6 border-y border-white/60 bg-white/72 px-4 py-4 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/62 sm:mx-0 sm:rounded-[1.5rem] sm:border">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <label className="flex h-12 min-w-0 items-center gap-3 rounded-full border border-slate-200 bg-white/78 px-4 text-sm font-semibold shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
              <Search className="size-4 shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search courses, instructors, skills..."
                className="min-w-0 flex-1 bg-transparent text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
              />
            </label>

            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="hidden items-center gap-2 rounded-full px-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400 sm:inline-flex">
                <Filter className="size-4" />
                Filter
              </span>
              <FilterSelect label="Category" value={category} values={courseCategories} onChange={setCategory} />
              <FilterSelect label="Level" value={level} values={["All", "Beginner", "Intermediate", "Advanced"]} onChange={setLevel} />
              <FilterSelect label="Price" value={priceType} values={["All", "Free", "Paid"]} onChange={setPriceType} />
            </div>
          </div>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <CourseSkeletonGrid />
          ) : filteredCourses.length > 0 ? (
            <motion.div
              className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
              layout
            >
              <AnimatePresence mode="popLayout">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <EmptyState hasCourses={courses.length > 0} query={query} category={category} level={level} priceType={priceType} />
          )}
        </div>
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  values,
  onChange,
}: Readonly<{
  label: string;
  value: string;
  values: string[];
  onChange: (value: string) => void;
}>) {
  return (
    <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/72 px-3 py-2 text-sm font-black text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
      <span className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</span>
      <select
        className="bg-transparent outline-none"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {values.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}

function CourseSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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
  );
}

function EmptyState({
  hasCourses,
  query,
  category,
  level,
  priceType,
}: Readonly<{ hasCourses: boolean; query: string; category: string; level: string; priceType: string }>) {
  const title = hasCourses ? "No courses found" : "No courses yet";
  const activeFilters = [category, level, priceType].filter((item) => item !== "All").join(", ");
  const description = hasCourses
    ? `No results for ${query ? `"${query}"` : "your search"}${activeFilters ? ` with filters: ${activeFilters}` : ""}. Try a broader keyword or adjust filters.`
    : "Educator-created courses will appear here automatically after they are added.";

  return (
    <div className="grid min-h-80 place-items-center rounded-[2rem] border border-white/70 bg-white/72 p-8 text-center shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
      <div className="max-w-md">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-cyan-50 text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200">
          <Search className="size-6" />
        </div>
        <h2 className="mt-5 text-2xl font-black">{title}</h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}
