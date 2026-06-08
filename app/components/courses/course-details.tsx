import {
  Award,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  Download,
  GraduationCap,
  Layers3,
  Play,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Course } from "./course-data";
import { getFirstLesson } from "./course-data";
import { CourseCard } from "./course-card";
import { LessonAccordion } from "./lesson-accordion";

const difficultyStyles: Record<Course["difficulty"], string> = {
  Beginner: "bg-emerald-50 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200",
  Intermediate: "bg-cyan-50 text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200",
  Advanced: "bg-violet-50 text-violet-700 dark:bg-violet-300/10 dark:text-violet-200",
  "Career track": "bg-amber-50 text-amber-700 dark:bg-amber-300/10 dark:text-amber-200",
};

export function CourseDetails({
  course,
  relatedCourses,
}: Readonly<{
  course: Course;
  relatedCourses: Course[];
}>) {
  const completedLessons = course.curriculum.reduce(
    (total, module) => total + module.lessons.filter((lesson) => lesson.completed).length,
    0,
  );
  const totalLessons = course.curriculum.reduce((total, module) => total + module.lessons.length, 0);
  const firstLesson = getFirstLesson(course);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f8fb] text-slate-950 dark:bg-[#070b12] dark:text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_8%_8%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_92%_18%,rgba(99,102,241,0.14),transparent_30%),linear-gradient(180deg,#f8fafc,#eef3f9)] dark:bg-[radial-gradient(circle_at_8%_8%,rgba(45,212,191,0.14),transparent_30%),radial-gradient(circle_at_92%_18%,rgba(129,140,248,0.14),transparent_30%),linear-gradient(180deg,#070b12,#0f172a)]" />

      <section className="mx-auto w-full max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 text-white shadow-2xl shadow-cyan-500/10 dark:border-white/10">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_470px]">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-cyan-100">
                  {course.category}
                </span>
                <span className={`rounded-full px-3 py-1.5 text-xs font-black ${difficultyStyles[course.difficulty]}`}>
                  {course.difficulty}
                </span>
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {course.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base font-semibold leading-8 text-slate-300">
                {course.longDescription}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <HeroStat icon={Star} label={`${course.rating}`} helper={`${course.reviews.toLocaleString()} reviews`} />
                <HeroStat icon={Users} label={course.students} helper="students enrolled" />
                <HeroStat icon={Clock3} label={course.duration} helper={`${course.lessons} lessons`} />
                <HeroStat icon={BarChart3} label={`${course.progress}%`} helper="course progress" />
              </div>
            </div>

            <div className="relative min-h-[320px] overflow-hidden border-t border-white/10 lg:border-l lg:border-t-0">
              <Image
                src={course.thumbnail}
                alt={`${course.title} preview`}
                fill
                priority
                sizes="(min-width: 1024px) 470px, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/24" />
              <div className="absolute inset-x-5 bottom-5 rounded-[1.5rem] border border-white/20 bg-white/16 p-4 backdrop-blur-2xl">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-full bg-white text-slate-950 shadow-xl shadow-slate-950/20">
                    <Play className="size-5 fill-current" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{course.previewLabel}</p>
                    <p className="mt-1 text-xs font-bold text-slate-200">Course preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-6">
            <GlassSection title="Instructor" eyebrow="Learn from an expert">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <span className="grid size-20 shrink-0 place-items-center rounded-[1.5rem] bg-slate-950 text-2xl font-black text-white shadow-xl shadow-cyan-500/10 dark:bg-white dark:text-slate-950">
                  {course.instructor.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-black">{course.instructor.name}</h2>
                  <p className="mt-1 text-sm font-bold text-cyan-700 dark:text-cyan-200">
                    {course.instructor.role}
                  </p>
                  <p className="mt-3 text-sm font-semibold leading-7 text-slate-500 dark:text-slate-400">
                    Guides learners through practical critique, portfolio-ready projects, and weekly decision points
                    that connect the coursework to real product teams.
                  </p>
                </div>
              </div>
            </GlassSection>

            <GlassSection title="Curriculum" eyebrow={`${completedLessons}/${totalLessons} lessons complete`}>
              <LessonAccordion courseId={course.id} modules={course.curriculum} />
            </GlassSection>

            <GlassSection title="Certificate" eyebrow="Credential included">
              <div className="flex flex-col gap-5 rounded-[1.5rem] bg-gradient-to-br from-cyan-50 to-white p-5 dark:from-cyan-300/10 dark:to-white/8 sm:flex-row sm:items-center">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-cyan-600 text-white shadow-lg shadow-cyan-500/20">
                  <Award className="size-6" />
                </span>
                <div>
                  <h3 className="text-xl font-black">{course.certificate.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-7 text-slate-500 dark:text-slate-400">
                    {course.certificate.description}
                  </p>
                </div>
              </div>
            </GlassSection>

            <GlassSection title="Resources" eyebrow="Downloadable materials">
              <div className="grid gap-3 md:grid-cols-2">
                {course.resources.length > 0 ? (
                  course.resources.map((resource) => (
                    <div
                      key={resource.title}
                      className="flex items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white/74 p-4 dark:border-white/10 dark:bg-white/8"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                        <Download className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black">{resource.title}</span>
                        <span className="mt-1 block text-xs font-bold text-slate-500 dark:text-slate-400">
                          {resource.type} - {resource.size} - Available after enrollment
                        </span>
                      </span>
                    </div>
                  ))
                ) : (
                  <EmptyPanel title="No resources yet" description="Downloads will appear here when the course opens." />
                )}
              </div>
            </GlassSection>
          </div>

          <aside className="sticky top-24 space-y-4 rounded-[1.75rem] border border-white/70 bg-white/76 p-5 shadow-2xl shadow-slate-900/8 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
            <Link
              href={firstLesson ? `/courses/${course.id}/lessons/${firstLesson.id}` : `/courses/${course.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-lg shadow-cyan-500/15 transition hover:-translate-y-0.5 hover:bg-cyan-600 dark:bg-white dark:text-slate-950"
            >
              <Play className="size-4 fill-current" />
              Continue learning
            </Link>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-black">
                <span className="text-slate-500 dark:text-slate-400">Course progress</span>
                <span>{course.progress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>

            <div className="grid gap-3">
              <SidebarMetric icon={BookOpenCheck} label="Lessons" value={`${completedLessons}/${totalLessons} complete`} />
              <SidebarMetric icon={Clock3} label="Duration" value={course.duration} />
              <SidebarMetric icon={Layers3} label="Difficulty" value={course.difficulty} />
              <SidebarMetric icon={GraduationCap} label="Certificate" value="Included" />
              <SidebarMetric icon={Users} label="Community" value={`${course.students} learners`} />
            </div>
          </aside>
        </div>

        <section className="mt-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">
                Keep exploring
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">Related courses</h2>
            </div>
            <Link href="/courses" className="text-sm font-black text-cyan-700 hover:text-cyan-500 dark:text-cyan-200">
              View all courses
            </Link>
          </div>
          {relatedCourses.length > 0 ? (
            <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {relatedCourses.map((relatedCourse) => (
                <CourseCard
                  key={relatedCourse.id}
                  course={{ ...relatedCourse, isPaid: false, price: 0 }}
                />
              ))}
            </div>
          ) : (
            <EmptyPanel title="No related courses" description="More recommendations will appear as the catalog grows." />
          )}
        </section>
      </section>
    </main>
  );
}

function HeroStat({
  icon: Icon,
  label,
  helper,
}: Readonly<{
  icon: typeof Star;
  label: string;
  helper: string;
}>) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-white">
        <Icon className="size-4 text-cyan-200" />
        <span className="text-lg font-black">{label}</span>
      </div>
      <p className="mt-1 text-xs font-bold text-slate-300">{helper}</p>
    </div>
  );
}

function GlassSection({
  title,
  eyebrow,
  children,
}: Readonly<{
  title: string;
  eyebrow: string;
  children: ReactNode;
}>) {
  return (
    <section className="rounded-[1.75rem] border border-white/70 bg-white/76 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SidebarMetric({
  icon: Icon,
  label,
  value,
}: Readonly<{
  icon: typeof Clock3;
  label: string;
  value: string;
}>) {
  return (
    <div className="flex items-center gap-3 rounded-[1.2rem] bg-slate-50/80 p-3 dark:bg-white/8">
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-cyan-700 shadow-sm dark:bg-white/10 dark:text-cyan-200">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-bold text-slate-500 dark:text-slate-400">{label}</span>
        <span className="block truncate text-sm font-black">{value}</span>
      </span>
    </div>
  );
}

function EmptyPanel({
  title,
  description,
}: Readonly<{
  title: string;
  description: string;
}>) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/62 p-6 text-center dark:border-white/10 dark:bg-white/8">
      <CheckCircle2 className="mx-auto size-8 text-slate-300 dark:text-slate-600" />
      <h3 className="mt-3 text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}
