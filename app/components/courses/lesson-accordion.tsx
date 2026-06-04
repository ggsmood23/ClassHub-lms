"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronDown, Circle, FileText, PlayCircle, Trophy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { CourseModule, Lesson } from "./course-data";

const lessonIcons: Record<Lesson["type"], typeof PlayCircle> = {
  Video: PlayCircle,
  Reading: FileText,
  Quiz: Trophy,
  Project: FileText,
};

export function LessonAccordion({
  courseId,
  modules,
}: Readonly<{
  courseId?: string;
  modules: CourseModule[];
}>) {
  const [openModule, setOpenModule] = useState(modules[0]?.id ?? "");

  if (modules.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/62 p-8 text-center shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/8">
        <h3 className="text-xl font-black">Curriculum coming soon</h3>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
          Lessons are being organized for this course.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {modules.map((module) => {
        const isOpen = openModule === module.id;
        const completedLessons = module.lessons.filter((lesson) => lesson.completed).length;

        return (
          <motion.div
            key={module.id}
            layout
            className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/72 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10"
          >
            <button
              type="button"
              onClick={() => setOpenModule(isOpen ? "" : module.id)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-cyan-50/70 dark:hover:bg-white/8"
            >
              <span className="min-w-0">
                <span className="block truncate text-lg font-black">{module.title}</span>
                <span className="mt-1 block text-xs font-bold text-slate-500 dark:text-slate-400">
                  {completedLessons}/{module.lessons.length} lessons complete - {module.duration}
                </span>
              </span>
              <ChevronDown
                className={`size-5 shrink-0 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <div className="border-t border-slate-200/70 p-3 dark:border-white/10">
                    {module.lessons.map((lesson) => {
                      const Icon = lessonIcons[lesson.type];

                      return (
                        <LessonRow
                          key={lesson.id}
                          courseId={courseId}
                          icon={Icon}
                          lesson={lesson}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

function LessonRow({
  courseId,
  icon: Icon,
  lesson,
}: Readonly<{
  courseId?: string;
  icon: typeof PlayCircle;
  lesson: Lesson;
}>) {
  const content = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black">{lesson.title}</p>
        <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
          {lesson.type} - {lesson.duration}
        </p>
      </div>
      {lesson.completed ? (
        <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
      ) : (
        <Circle className="size-5 shrink-0 text-slate-300 dark:text-slate-600" />
      )}
    </>
  );

  const className = "flex items-center gap-3 rounded-[1.1rem] p-3 transition hover:bg-slate-50 dark:hover:bg-white/8";

  if (!courseId) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={`/courses/${courseId}/lessons/${lesson.id}`} className={className}>
      {content}
    </Link>
  );
}
