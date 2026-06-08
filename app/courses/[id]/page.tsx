import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import connectDB from "@/lib/db";
import Course from "@/lib/models/Course";
import Enrollment from "@/lib/models/Enrollment";
import Review from "@/lib/models/Review";
import User from "@/lib/models/User";
import { ThemeToggle } from "../../components/theme-toggle";
import { RoleAwareLogoLink } from "../../components/role-aware-logo-link";
import { toJsonSafe } from "@/lib/serialization";
import {
  MongoCourseDetails,
  type MongoCourse,
} from "../../components/courses/course-details-mongo";

type CourseDetailsPageProps = {
  params: Promise<{ id: string }>;
};

type CourseLessonDocument = {
  _id?: { toString(): string };
  title?: string;
  duration?: string;
  videoUrl?: string;
};

type ReviewAggregate = {
  _id: null;
  averageRating?: number;
  totalReviews?: number;
};

type ReviewDocument = {
  _id: { toString(): string };
  rating?: number;
  review?: string;
  createdAt?: Date;
  updatedAt?: Date;
  student?: {
    _id?: { toString(): string };
    name?: string;
    email?: string;
    image?: string;
  };
};

export const metadata: Metadata = {
  title: "Course | Class Hub",
  description: "Learn from expert instructors",
};

export default async function CourseDetailsPage({ params }: CourseDetailsPageProps) {
  const { id } = await params;

  await connectDB();
  const course = await Course.findById(id);
  const session = await getServerSession(authOptions);
  const user = session?.user?.email
    ? await User.findOne({ email: session.user.email })
    : null;
  const existingEnrollment = user
    ? await Enrollment.findOne({ student: user._id, course: id })
    : null;

  if (!course) {
    notFound();
  }

  const canManageCourse =
    user?.role === "admin" ||
    (user?.role === "teacher" && course.teacher?.toString() === user._id.toString());

  if ((course.status || "Published") !== "Published" && !canManageCourse) {
    notFound();
  }

  const [reviewStats] = await Review.aggregate<ReviewAggregate>([
    { $match: { course: course._id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);
  const reviews = await Review.find({ course: course._id })
    .populate("student", "name email image")
    .sort({ createdAt: -1 })
    .lean<ReviewDocument[]>();
  const currentUserId = user?._id.toString() ?? "";
  const existingReview = currentUserId
    ? reviews.find((review) => review.student?._id?.toString() === currentUserId)
    : undefined;

  const courseData = toJsonSafe<MongoCourse>({
    _id: course._id.toString(),
    title: course.title || "",
    description: course.description || "",
    category: course.category || "",
    level: course.level || "",
    price: course.price || 0,
    isPaid: Boolean(course.isPaid || course.price > 0),
    thumbnail: course.thumbnail || "",
    lessons: ((course.lessons || []) as CourseLessonDocument[]).map((lesson) => ({
      _id: lesson._id?.toString() || "",
      title: lesson.title || "",
      duration: lesson.duration || "",
      videoUrl: lesson.videoUrl || "",
    })),
    students: ((course.students || []) as Array<{ toString(): string }>).map((student) =>
      student.toString(),
    ),
    createdAt: course.createdAt?.toISOString(),
    alreadyEnrolled: Boolean(existingEnrollment),
    canReview: Boolean(existingEnrollment && user?.role === "student"),
    currentUserId,
    averageRating: reviewStats?.averageRating
      ? Number(reviewStats.averageRating.toFixed(1))
      : 0,
    totalReviews: reviewStats?.totalReviews ?? 0,
    existingReviewId: existingReview?._id.toString() ?? "",
    reviews: reviews.map((review) => ({
      _id: review._id.toString(),
      rating: review.rating ?? 0,
      review: review.review ?? "",
      createdAt: review.createdAt?.toISOString() ?? "",
      updatedAt: review.updatedAt?.toISOString() ?? "",
      student: {
        _id: review.student?._id?.toString() ?? "",
        name: review.student?.name || review.student?.email || "Student",
        email: review.student?.email || "",
        image: review.student?.image || "",
      },
    })),
  });

  const nav: ReactNode = (
    <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/72 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/62">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <RoleAwareLogoLink className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-lg font-black text-white shadow-lg shadow-cyan-500/20 dark:bg-white dark:text-slate-950">
            CH
          </span>
          <span className="truncate text-xl font-black tracking-tight">
            Class Hub
          </span>
        </RoleAwareLogoLink>
        <div className="flex items-center gap-3">
          <Link
            href="/courses"
            className="hidden rounded-full border border-slate-200 bg-white/72 px-5 py-3 text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:border-cyan-300 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 sm:inline-flex"
          >
            Courses
          </Link>
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="hidden rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-cyan-600 dark:bg-white dark:text-slate-950 md:inline-flex"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {nav}
      <MongoCourseDetails course={courseData} />
    </>
  );
}
