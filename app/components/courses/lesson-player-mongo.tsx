import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronLeft, Play } from "lucide-react";
import MarkCompleteButton from "./mark-complete-button";

type MongoLesson = {
  _id: string;
  title: string;
  duration?: string;
  videoUrl?: string;
};

type MongoCourse = {
  _id: string;
  title: string;
  lessons?: MongoLesson[];
};

export function MongoLessonPlayer({
  course,
  lesson,
  lessons,
}: {
  course: MongoCourse;
  lesson: MongoLesson;
  lessons: MongoLesson[];
}) {
  const currentIndex = lessons.findIndex((item) => item._id === lesson._id);
  const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : undefined;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : undefined;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3 text-sm font-black text-slate-600 dark:text-slate-300">
          <ChevronLeft className="size-4" />
          <Link href={`/courses/${course._id}`} className="underline-offset-4 transition hover:text-cyan-600 dark:hover:text-cyan-300">
            Back to course overview
          </Link>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_320px]">
          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900/70">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">Recorded lesson</p>
                  <h1 className="mt-3 text-3xl font-black tracking-tight">{lesson.title}</h1>
                  <p className="mt-2 text-sm font-semibold leading-7 text-slate-500 dark:text-slate-400">{course.title}</p>
                </div>
                <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700 dark:bg-slate-950/80 dark:text-white">
                  {lesson.duration ?? "Unknown"}
                </div>
              </div>

              {lesson.videoUrl ? (
                <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-900 text-white dark:border-white/10">
                  <video
                    controls
                    className="w-full bg-black"
                    src={lesson.videoUrl}
                    preload="metadata"
                  >
                    Your browser does not support the video element.
                  </video>
                  <div className="p-4">
                    <MarkCompleteButton courseId={course._id} lessonId={lesson._id} />
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm font-black text-slate-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300">
                  No video URL was provided for this lesson.
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-black text-white">
                  <Play className="size-4" />
                  Playing lesson
                </span>
                {previousLesson ? (
                  <Link href={`/courses/${course._id}/lessons/${previousLesson._id}`} className="text-sm font-black text-slate-600 underline-offset-4 transition hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-300">
                    <ArrowLeft className="size-4 inline" /> Previous lesson
                  </Link>
                ) : null}
                {nextLesson ? (
                  <Link href={`/courses/${course._id}/lessons/${nextLesson._id}`} className="text-sm font-black text-slate-600 underline-offset-4 transition hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-300">
                    Next lesson <ArrowRight className="size-4 inline" />
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900/70">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Playlist</p>
              <div className="mt-5 space-y-3">
                {lessons.map((item, index) => {
                  const isActive = item._id === lesson._id;
                  return (
                    <Link
                      key={item._id}
                      href={`/courses/${course._id}/lessons/${item._id}`}
                      className={`flex items-center justify-between gap-4 rounded-[1.25rem] border px-4 py-3 transition ${
                        isActive
                          ? "border-cyan-300 bg-cyan-50 text-slate-950 dark:bg-cyan-500/10 dark:text-white"
                          : "border-slate-200 bg-slate-50 hover:border-cyan-300 hover:bg-white dark:border-white/10 dark:bg-slate-950/70 dark:hover:bg-slate-900/80"
                      }`}
                    >
                      <div>
                        <p className="font-black">{index + 1}. {item.title}</p>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.duration ?? "Unknown duration"}</p>
                      </div>
                      <span className="font-black text-slate-700 dark:text-slate-200">{isActive ? "Playing" : "Play"}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="space-y-5 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900/70">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">About this lesson</p>
              <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                <p>Watch the lesson video, take notes, and then continue with the next chapter from the playlist.</p>
                <p>This lesson is stored directly on the course record in MongoDB and renders a native HTML5 player.</p>
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900/70">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Course</p>
              <p className="mt-3 text-xl font-black">{course.title}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{lessons.length} lesson{lessons.length === 1 ? "" : "s"} available</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
