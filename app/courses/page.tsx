import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import connectDB from "@/lib/db";
import Course from "@/lib/models/Course";
import Enrollment from "@/lib/models/Enrollment";
import Review from "@/lib/models/Review";
import User from "@/lib/models/User";
import { ThemeToggle } from "../components/theme-toggle";
import { RoleAwareLogoLink } from "../components/role-aware-logo-link";
import { CourseCatalog } from "../components/courses/course-catalog";
import type { CatalogCourse } from "../components/courses/course-card";

export const metadata: Metadata = {
  title: "Courses | Class Hub",
  description: "Browse premium Class Hub LMS courses by category, instructor, and progress.",
};

export const dynamic = "force-dynamic";

type TeacherDocument = {
  name?: string;
  email?: string;
  role?: string;
};

type CourseLessonDocument = {
  duration?: string;
};

type CourseDocument = {
  _id: { toString(): string };
  title?: string;
  description?: string;
  category?: string;
  level?: CatalogCourse["difficulty"];
  thumbnail?: string;
  price?: number;
  isPaid?: boolean;
  lessons?: CourseLessonDocument[];
  students?: unknown[];
  teacher?: TeacherDocument;
};

type EnrollmentDocument = {
  course?: { toString(): string };
  progress?: number;
};

type ReviewAggregate = {
  _id: { toString(): string };
  averageRating?: number;
  totalReviews?: number;
};

function getInitials(name?: string) {
  const initials = name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "CH";
}

function getCourseDuration(lessons: CourseLessonDocument[]) {
  return lessons.length > 0 ? `${lessons.length} lessons` : "Self-paced";
}

function formatStudentCount(students: unknown[]) {
  return students.length.toLocaleString();
}

async function getCatalogCourses(): Promise<CatalogCourse[]> {
  await connectDB();

  const session = await getServerSession(authOptions);
  const user = session?.user?.email
    ? await User.findOne({ email: session.user.email }).select("_id").lean()
    : null;

  const enrollments = user
    ? await Enrollment.find({ student: user._id }).select("course progress").lean<EnrollmentDocument[]>()
    : [];
  const progressByCourseId = new Map(
    enrollments.map((enrollment) => [
      enrollment.course?.toString() ?? "",
      enrollment.progress ?? 0,
    ]),
  );

  const courses = await Course.find({ status: "Published" })
    .populate("teacher", "name email role")
    .sort({ createdAt: -1 })
    .lean<CourseDocument[]>();
  const reviewStats = await Review.aggregate<ReviewAggregate>([
    {
      $group: {
        _id: "$course",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);
  const statsByCourseId = new Map(
    reviewStats.map((stat) => [
      stat._id.toString(),
      {
        averageRating: stat.averageRating ?? 0,
        totalReviews: stat.totalReviews ?? 0,
      },
    ]),
  );

  return courses.map((course) => {
    const teacher = course.teacher;
    const instructorName = teacher?.name || teacher?.email || "Class Hub educator";
    const lessons = course.lessons ?? [];
    const stats = statsByCourseId.get(course._id.toString());

    return {
      id: course._id.toString(),
      title: course.title || "Untitled course",
      category: course.category || "Uncategorized",
      difficulty: course.level || "Beginner",
      thumbnail: course.thumbnail || "/course-web.svg",
      isPaid: Boolean(course.isPaid || (course.price ?? 0) > 0),
      price: course.price ?? 0,
      instructor: {
        name: instructorName,
        role: teacher?.role === "admin" ? "Class Hub Admin" : "Educator",
        initials: getInitials(instructorName),
      },
      rating: stats ? Number(stats.averageRating.toFixed(1)) : 0,
      reviews: stats?.totalReviews ?? 0,
      students: formatStudentCount(course.students ?? []),
      duration: getCourseDuration(lessons),
      lessons: lessons.length,
      progress: progressByCourseId.get(course._id.toString()) ?? 0,
      description: course.description || "This course is being prepared by your teaching team.",
    };
  });
}

export default async function CoursesPage() {
  const courses = await getCatalogCourses();

  return (
    <>
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
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="hidden rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-cyan-600 dark:bg-white dark:text-slate-950 sm:inline-flex"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>
      <CourseCatalog courses={courses} />
    </>
  );
}
