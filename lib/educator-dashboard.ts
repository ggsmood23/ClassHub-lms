import "server-only";

import connectDB from "@/lib/db";
import Enrollment from "@/lib/models/Enrollment";
import Course from "@/lib/models/Course";
import Payment from "@/lib/models/Payment";

export type EducatorDashboardSummary = {
  stats: {
    totalStudents: number;
    totalCourses: number;
    activeCourses: number;
  };
  enrollmentGrowth: Array<{
    month: string;
    students: number;
    completion: number;
  }>;
  earningsData: Array<{
    month: string;
    revenue: number;
  }>;
  recentEnrollments: string[][];
};

type CourseRow = {
  _id: unknown;
  title?: string;
  students?: unknown[];
};

type EnrollmentRow = {
  createdAt?: Date;
  student?: {
    name?: string;
    email?: string;
  } | null;
  course?: {
    _id?: unknown;
    title?: string;
  } | null;
  progress?: number;
  completed?: boolean;
};

type MonthlyRow = {
  _id: string;
  count?: number;
  completed?: number;
  revenue?: number;
};

function monthLabels() {
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short" });
  const months: Array<{ key: string; label: string }> = [];
  const cursor = new Date();
  cursor.setUTCDate(1);
  cursor.setUTCHours(0, 0, 0, 0);

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(cursor);
    date.setUTCMonth(cursor.getUTCMonth() - index);
    months.push({
      key: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`,
      label: formatter.format(date),
    });
  }

  return months;
}

function formatDate(value?: Date) {
  return value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(value)
    : "Recent";
}

export async function getEducatorDashboardSummary(
  teacherId: unknown,
): Promise<EducatorDashboardSummary> {
  await connectDB();

  const courses = await Course.find({ teacher: teacherId })
    .select("_id title students")
    .lean<CourseRow[]>();
  const courseIds = courses.map((course) => course._id);
  const courseIdSet = new Set(courseIds.map((id) => String(id)));
  const uniqueStudentIds = new Set(
    courses.flatMap((course) => (course.students || []).map((student) => String(student))),
  );

  const months = monthLabels();
  const monthKeys = new Set(months.map((month) => month.key));

  const [enrollmentRows, revenueRows, recentEnrollments] = await Promise.all([
    Enrollment.aggregate<MonthlyRow>([
      { $match: { course: { $in: courseIds } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
          completed: { $sum: { $cond: ["$completed", 1, 0] } },
        },
      },
      { $match: { _id: { $in: Array.from(monthKeys) } } },
    ]),
    Payment.aggregate<MonthlyRow>([
      { $match: { status: "success", course: { $in: courseIds } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$amount" },
        },
      },
      { $match: { _id: { $in: Array.from(monthKeys) } } },
    ]),
    Enrollment.find({ course: { $in: courseIds } })
      .populate("student", "name email")
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean<EnrollmentRow[]>(),
  ]);

  const enrollmentByMonth = new Map(enrollmentRows.map((row) => [row._id, row]));
  const revenueByMonth = new Map(revenueRows.map((row) => [row._id, row]));

  return {
    stats: {
      totalStudents: uniqueStudentIds.size,
      totalCourses: courses.length,
      activeCourses: courses.filter((course) => (course.students?.length ?? 0) > 0).length,
    },
    enrollmentGrowth: months.map((month) => {
      const row = enrollmentByMonth.get(month.key);
      const count = row?.count ?? 0;
      const completed = row?.completed ?? 0;

      return {
        month: month.label,
        students: count,
        completion: count > 0 ? Math.round((completed / count) * 100) : 0,
      };
    }),
    earningsData: months.map((month) => ({
      month: month.label,
      revenue: revenueByMonth.get(month.key)?.revenue ?? 0,
    })),
    recentEnrollments: recentEnrollments
      .filter((enrollment) => courseIdSet.has(String(enrollment.course?._id ?? "")))
      .map((enrollment) => [
        enrollment.student?.name || enrollment.student?.email || "Unknown learner",
        enrollment.course?.title || "Deleted course",
        enrollment.completed ? "Completed" : `${enrollment.progress ?? 0}%`,
        formatDate(enrollment.createdAt),
      ]),
  };
}
