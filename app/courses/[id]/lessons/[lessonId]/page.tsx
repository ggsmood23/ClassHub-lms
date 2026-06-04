import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import connectDB from "@/lib/db";
import Course from "@/lib/models/Course";
import Enrollment from "@/lib/models/Enrollment";
import User from "@/lib/models/User";
import { ThemeToggle } from "../../../../components/theme-toggle";
import { MongoLessonPlayer } from "../../../../components/courses/lesson-player-mongo";

type LessonPageProps = {
  params: Promise<{ id: string; lessonId: string }>;
};

type CourseLessonDocument = {
  _id?: { toString(): string };
  title?: string;
  duration?: string;
  videoUrl?: string;
};

export const metadata: Metadata = {
  title: "Lesson | Class Hub",
  description: "Watch and learn",
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { id, lessonId } = await params;

  await connectDB();
  const course = await Course.findById(id);

  if (!course) {
    notFound();
  }

  const courseLessons = (course.lessons || []) as CourseLessonDocument[];
  const lesson = courseLessons.find((l) => l._id?.toString() === lessonId);

  if (!lesson) {
    notFound();
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await User.findOne({ email: session.user.email }).select("role");

  if (!user) {
    redirect("/login");
  }

  const canManageCourse =
    user.role === "admin" ||
    (user.role === "teacher" &&
      course.teacher?.toString() === user._id.toString());

  if (!canManageCourse) {
    const enrollment = await Enrollment.findOne({
      student: user._id,
      course: course._id,
    }).select("_id");

    if (!enrollment) {
      redirect(`/courses/${course._id.toString()}`);
    }
  }

  const lessons = courseLessons.map((l) => ({
    _id: l._id?.toString() || "",
    title: l.title || "",
    duration: l.duration || "",
    videoUrl: l.videoUrl || "",
  }));

  const courseData = {
    _id: course._id.toString(),
    title: course.title || "",
    lessons,
  };

  const lessonData = {
    _id: lesson._id?.toString() || "",
    title: lesson.title || "",
    duration: lesson.duration || "",
    videoUrl: lesson.videoUrl || "",
  };

  const courseId = course._id.toString();

  const nav: ReactNode = (
    <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/72 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/62">
      <div className="mx-auto flex max-w-[1560px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-lg font-black text-white shadow-lg shadow-cyan-500/20 dark:bg-white dark:text-slate-950">
            CH
          </span>
          <span className="truncate text-xl font-black tracking-tight">
            Class Hub
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/courses/${courseId}`}
            className="hidden rounded-full border border-slate-200 bg-white/72 px-5 py-3 text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:border-cyan-300 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 sm:inline-flex"
          >
            Course detail
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {nav}
      <MongoLessonPlayer course={courseData} lesson={lessonData} lessons={lessons} />
    </>
  );
}
