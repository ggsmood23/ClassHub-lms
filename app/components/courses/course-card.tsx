"use client";

import { motion } from "framer-motion";
import { BarChart3, Clock3, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/currency";

export type CatalogCourse = {
  id: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Career track";
  thumbnail: string;
  isPaid: boolean;
  price: number;
  instructor: {
    name: string;
    role: string;
    initials: string;
  };
  rating: number;
  reviews: number;
  students: string;
  duration: string;
  lessons: number;
  progress: number;
  description: string;
};

const difficultyStyles: Record<CatalogCourse["difficulty"], string> = {
  Beginner: "bg-emerald-50 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200",
  Intermediate: "bg-cyan-50 text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200",
  Advanced: "bg-violet-50 text-violet-700 dark:bg-violet-300/10 dark:text-violet-200",
  "Career track": "bg-amber-50 text-amber-700 dark:bg-amber-300/10 dark:text-amber-200",
};

export function CourseCard({ course }: Readonly<{ course: CatalogCourse }>) {
  return (
    <motion.article
      layout
      className="group min-w-0 overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/76 shadow-xl shadow-slate-900/5 backdrop-blur-2xl transition hover:border-cyan-300/70 hover:shadow-2xl hover:shadow-cyan-500/10 dark:border-white/10 dark:bg-white/10"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
    >
      <Link href={`/courses/${course.id}`} className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/60">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={course.thumbnail || "/course-web.svg"}
            alt={`${course.title} thumbnail`}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] flex-wrap gap-2">
            <span className="rounded-full bg-white/82 px-3 py-1 text-xs font-black text-slate-800 shadow-sm backdrop-blur-xl dark:bg-slate-950/70 dark:text-white">
              {course.category}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${difficultyStyles[course.difficulty]}`}>
              {course.difficulty}
            </span>
            <span className="rounded-full bg-slate-950/82 px-3 py-1 text-xs font-black text-white shadow-sm backdrop-blur-xl dark:bg-white/82 dark:text-slate-950">
              {course.isPaid ? formatINR(course.price) : "Free"}
            </span>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-xl font-black tracking-tight">
              {course.title}
            </h2>
            <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
              {course.description}
            </p>
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">
              {course.instructor.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{course.instructor.name}</p>
              <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
                {course.instructor.role}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-black text-slate-500 dark:text-slate-400">
            <CourseMeta icon={Star} label={`${course.rating}`} helper={`${course.reviews.toLocaleString()} reviews`} />
            <CourseMeta icon={Clock3} label={course.duration} helper={`${course.lessons} lessons`} />
            <CourseMeta icon={Users} label={course.students} helper="students" />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-xs font-black">
              <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <BarChart3 className="size-3.5" />
                Enrolled progress
              </span>
              <span>{course.progress}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${course.progress}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

function CourseMeta({
  icon: Icon,
  label,
  helper,
}: Readonly<{
  icon: typeof Star;
  label: string;
  helper: string;
}>) {
  return (
    <div className="min-w-0 rounded-2xl bg-slate-50/80 p-3 dark:bg-white/8">
      <div className="flex items-center gap-1.5 text-slate-900 dark:text-white">
        <Icon className="size-3.5 shrink-0 text-cyan-600 dark:text-cyan-200" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1 truncate text-[11px] font-bold text-slate-400">
        {helper}
      </p>
    </div>
  );
}
