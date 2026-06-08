"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Circle,
  Clock3,
  Download,
  FileText,
  MessageCircle,
  Pause,
  Play,
  Send,
  StickyNote,
  Volume2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { Course, LessonWithModule } from "./course-data";

type LessonPlayerProps = {
  course: Course;
  lesson: LessonWithModule;
  lessons: LessonWithModule[];
  previousLesson?: LessonWithModule;
  nextLesson?: LessonWithModule;
};

const discussions = [
  {
    author: "Ava Patel",
    initials: "AP",
    time: "12 min ago",
    text: "The workflow framing finally made the prototype review feel measurable. I added the scorecard to my team review.",
  },
  {
    author: "Marcus Chen",
    initials: "MC",
    time: "34 min ago",
    text: "Would love a deeper example for edge cases, but the checklist is already useful.",
  },
];

export function LessonPlayer({
  course,
  lesson,
  lessons,
  previousLesson,
  nextLesson,
}: Readonly<LessonPlayerProps>) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [note, setNote] = useState("Capture your lesson notes, questions, or implementation ideas here.");
  const completedCount = lessons.filter((item) => item.completed).length;
  const progress = Math.round((completedCount / Math.max(lessons.length, 1)) * 100);

  const upcomingLessons = useMemo(
    () => lessons.filter((item) => item.lessonNumber >= lesson.lessonNumber).slice(0, 4),
    [lesson.lessonNumber, lessons],
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f8fb] text-slate-950 dark:bg-[#070b12] dark:text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_8%_8%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_92%_18%,rgba(99,102,241,0.14),transparent_30%),linear-gradient(180deg,#f8fafc,#eef3f9)] dark:bg-[radial-gradient(circle_at_8%_8%,rgba(45,212,191,0.14),transparent_30%),radial-gradient(circle_at_92%_18%,rgba(129,140,248,0.14),transparent_30%),linear-gradient(180deg,#070b12,#0f172a)]" />

      <section className="mx-auto grid w-full max-w-[1560px] gap-5 px-4 pb-8 pt-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:px-8">
        <div className="min-w-0 space-y-5">
          <Link
            href={`/courses/${course.id}`}
            className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-200"
          >
            <ChevronLeft className="size-4" />
            Back to course
          </Link>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-slate-950 shadow-2xl shadow-cyan-500/10 dark:border-white/10"
          >
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={course.thumbnail}
                alt={`${lesson.title} video preview`}
                fill
                priority
                sizes="(min-width: 1024px) calc(100vw - 470px), 100vw"
                className="object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <button
                type="button"
                onClick={() => setIsPlaying((value) => !value)}
                className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-950 shadow-2xl shadow-slate-950/40 transition hover:scale-105"
                aria-label={isPlaying ? "Pause lesson" : "Play lesson"}
              >
                {isPlaying ? <Pause className="size-8 fill-current" /> : <Play className="size-8 fill-current" />}
              </button>
              <div className="absolute inset-x-4 bottom-4 rounded-[1.25rem] border border-white/10 bg-slate-950/72 p-3 text-white backdrop-blur-2xl">
                <div className="flex items-center justify-between gap-3 text-xs font-black">
                  <span>08:42</span>
                  <span>{lesson.duration}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/12">
                  <div className="h-full w-[46%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button className="grid size-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20" type="button">
                      {isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
                    </button>
                    <Volume2 className="size-4 text-slate-300" />
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-cyan-100">
                    {lesson.type}
                  </span>
                </div>
              </div>
            </div>
          </motion.section>

          <section className="rounded-[1.75rem] border border-white/70 bg-white/76 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">
                  Lesson {lesson.lessonNumber} - {lesson.moduleTitle}
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{lesson.title}</h1>
                <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-500 dark:text-slate-400">
                  Continue through {course.title} with focused playback, downloadable materials, notes, and community context in one learning workspace.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <LessonNavLink courseId={course.id} lesson={previousLesson} direction="previous" />
                <LessonNavLink courseId={course.id} lesson={nextLesson} direction="next" />
              </div>
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <GlassPanel icon={Download} eyebrow="Downloads" title="Resources">
              <div className="space-y-3">
                {course.resources.map((resource) => (
                  <div
                    key={resource.title}
                    className="flex items-center gap-3 rounded-[1.15rem] border border-slate-200 bg-white/74 p-3 dark:border-white/10 dark:bg-white/8"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                      <FileText className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-black">{resource.title}</span>
                      <span className="mt-1 block text-xs font-bold text-slate-500 dark:text-slate-400">
                        {resource.type} - {resource.size} - Course file
                      </span>
                    </span>
                    <Download className="size-4 shrink-0 text-slate-300" />
                  </div>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel icon={StickyNote} eyebrow="Private workspace" title="Notes">
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="min-h-44 w-full resize-none rounded-[1.25rem] border border-slate-200 bg-white/74 p-4 text-sm font-semibold leading-7 text-slate-700 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/20 dark:border-white/10 dark:bg-white/8 dark:text-slate-200"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-cyan-600 dark:bg-white dark:text-slate-950"
                >
                  Save note
                </button>
              </div>
            </GlassPanel>
          </div>

          <GlassPanel icon={MessageCircle} eyebrow="Discussion" title="Comments">
            <div className="space-y-4">
              {discussions.map((comment) => (
                <div key={comment.author} className="flex gap-3 rounded-[1.25rem] bg-slate-50/80 p-4 dark:bg-white/8">
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-slate-950 text-xs font-black text-white dark:bg-white dark:text-slate-950">
                    {comment.initials}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black">{comment.author}</p>
                      <span className="text-xs font-bold text-slate-400">{comment.time}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-7 text-slate-500 dark:text-slate-400">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
              <label className="flex min-h-14 items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white/76 px-4 dark:border-white/10 dark:bg-white/8">
                <input
                  placeholder="Add a comment or question..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
                />
                <button type="button" className="grid size-10 shrink-0 place-items-center rounded-full bg-cyan-600 text-white transition hover:scale-105">
                  <Send className="size-4" />
                </button>
              </label>
            </div>
          </GlassPanel>
        </div>

        <aside className="min-w-0 space-y-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
          <section className="rounded-[1.75rem] border border-white/70 bg-white/76 p-5 shadow-2xl shadow-slate-900/8 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">
                  Playlist
                </p>
                <h2 className="mt-1 text-2xl font-black">Course lessons</h2>
              </div>
              <span className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white dark:bg-white dark:text-slate-950">
                {progress}%
              </span>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-5 space-y-2">
              {lessons.map((item) => {
                const isActive = item.id === lesson.id;

                return (
                  <Link
                    key={`${item.moduleId}-${item.id}`}
                    href={`/courses/${course.id}/lessons/${item.id}`}
                    className={`flex gap-3 rounded-[1.2rem] p-3 transition hover:-translate-y-0.5 ${
                      isActive
                        ? "bg-slate-950 text-white shadow-xl shadow-cyan-500/15 dark:bg-white dark:text-slate-950"
                        : "bg-slate-50/80 hover:bg-white dark:bg-white/8 dark:hover:bg-white/12"
                    }`}
                  >
                    <span className={`grid size-9 shrink-0 place-items-center rounded-2xl ${isActive ? "bg-white/14" : "bg-white dark:bg-white/10"}`}>
                      {item.completed ? (
                        <CheckCircle2 className={`size-4 ${isActive ? "text-cyan-200 dark:text-cyan-700" : "text-emerald-500"}`} />
                      ) : (
                        <Circle className={`size-4 ${isActive ? "text-white/70 dark:text-slate-500" : "text-slate-300 dark:text-slate-600"}`} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-black">{item.title}</span>
                      <span className={`mt-1 flex items-center gap-1 text-xs font-bold ${isActive ? "text-white/70 dark:text-slate-500" : "text-slate-500 dark:text-slate-400"}`}>
                        <Clock3 className="size-3" />
                        {item.duration}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/70 bg-white/76 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">Up next</p>
            <div className="mt-4 space-y-3">
              {upcomingLessons.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-[1.15rem] bg-slate-50/80 p-3 dark:bg-white/8">
                  <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-white text-xs font-black text-slate-500 dark:bg-white/10 dark:text-slate-300">
                    {item.lessonNumber}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{item.title}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">{item.moduleTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function LessonNavLink({
  courseId,
  lesson,
  direction,
}: Readonly<{
  courseId: string;
  lesson?: LessonWithModule;
  direction: "previous" | "next";
}>) {
  const isPrevious = direction === "previous";
  const Icon = isPrevious ? ArrowLeft : ArrowRight;

  if (!lesson) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-300 dark:border-white/10 dark:text-slate-600">
        {isPrevious ? <Icon className="size-4" /> : null}
        {isPrevious ? "Previous" : "Next"}
        {!isPrevious ? <Icon className="size-4" /> : null}
      </span>
    );
  }

  return (
    <Link
      href={`/courses/${courseId}/lessons/${lesson.id}`}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/72 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:border-cyan-300 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
    >
      {isPrevious ? <Icon className="size-4" /> : null}
      {isPrevious ? "Previous" : "Next"}
      {!isPrevious ? <Icon className="size-4" /> : null}
    </Link>
  );
}

function GlassPanel({
  icon: Icon,
  eyebrow,
  title,
  children,
}: Readonly<{
  icon: typeof Download;
  eyebrow: string;
  title: string;
  children: ReactNode;
}>) {
  return (
    <section className="rounded-[1.75rem] border border-white/70 bg-white/76 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-cyan-50 text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-black">{title}</h2>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
