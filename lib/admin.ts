import "server-only";

import connectDB from "@/lib/db";
import Course from "@/lib/models/Course";
import Enrollment from "@/lib/models/Enrollment";
import Notification from "@/lib/models/Notification";
import Payment from "@/lib/models/Payment";
import Review from "@/lib/models/Review";
import User from "@/lib/models/User";
import { formatINR } from "./currency";

export type AdminChartRow = {
  month: string;
  students: number;
  teachers: number;
  courses: number;
  revenue: number;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  accountStatus: "active" | "suspended";
  status: string;
  joined: string;
  courses: string;
  spend: string;
};

export type AdminCourseRow = {
  id: string;
  title: string;
  teacher: string;
  category: string;
  level: string;
  students: string;
  revenue: string;
  status: string;
  created: string;
};

export type AdminPaymentRow = {
  id: string;
  student: string;
  course: string;
  amount: string;
  transactionId: string;
  date: string;
  status: string;
};

export type AdminReviewRow = {
  id: string;
  student: string;
  course: string;
  rating: string;
  review: string;
  status: string;
  created: string;
};

export type AdminNotificationRow = {
  id: string;
  title: string;
  message: string;
  tone: string;
  created: string;
};

type CountRow = {
  _id: string;
  count?: number;
  revenue?: number;
};

function formatDate(value?: Date) {
  return value
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(value)
    : "Unknown";
}

function formatMoney(value: number) {
  return formatINR(value);
}

function monthLabels() {
  const formatter = new Intl.DateTimeFormat("en", { month: "short" });
  const cursor = new Date();
  cursor.setUTCDate(1);
  cursor.setUTCHours(0, 0, 0, 0);

  return Array.from({ length: 6 }, (_, offset) => {
    const date = new Date(cursor);
    date.setUTCMonth(cursor.getUTCMonth() - (5 - offset));

    return {
      key: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`,
      label: formatter.format(date),
    };
  });
}

export async function getAdminOverview() {
  await connectDB();

  const months = monthLabels();
  const monthKeys = new Set(months.map((month) => month.key));

  const [
    totalUsers,
    totalStudents,
    totalTeachers,
    totalAdmins,
    totalCourses,
    totalEnrollments,
    totalPayments,
    totalRevenueRows,
    revenueRows,
    studentRows,
    teacherRows,
    courseRows,
    recentUsers,
    recentCourses,
    recentPayments,
    recentNotifications,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "teacher" }),
    User.countDocuments({ role: "admin" }),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Payment.countDocuments({ status: "success" }),
    Payment.aggregate<{ total?: number }>([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate<CountRow>([
      { $match: { status: "success" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $match: { _id: { $in: Array.from(monthKeys) } } },
    ]),
    User.aggregate<CountRow>([
      { $match: { role: "student" } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $match: { _id: { $in: Array.from(monthKeys) } } },
    ]),
    User.aggregate<CountRow>([
      { $match: { role: "teacher" } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $match: { _id: { $in: Array.from(monthKeys) } } },
    ]),
    Course.aggregate<CountRow>([
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $match: { _id: { $in: Array.from(monthKeys) } } },
    ]),
    getAdminUsers(undefined, 8),
    getAdminCourses(8),
    getAdminPayments(8),
    getAdminNotifications(6),
  ]);

  const revenueByMonth = new Map(revenueRows.map((row) => [row._id, row]));
  const studentsByMonth = new Map(studentRows.map((row) => [row._id, row]));
  const teachersByMonth = new Map(teacherRows.map((row) => [row._id, row]));
  const coursesByMonth = new Map(courseRows.map((row) => [row._id, row]));
  const totalRevenue = totalRevenueRows[0]?.total ?? 0;

  return {
    stats: {
      totalUsers,
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalCourses,
      totalEnrollments,
      totalPayments,
      totalRevenue,
    },
    chartRows: months.map((month) => ({
      month: month.label,
      students: studentsByMonth.get(month.key)?.count ?? 0,
      teachers: teachersByMonth.get(month.key)?.count ?? 0,
      courses: coursesByMonth.get(month.key)?.count ?? 0,
      revenue: revenueByMonth.get(month.key)?.revenue ?? 0,
    })),
    recentActivity: [
      ...recentNotifications.map((item) => [item.title, item.message, item.created] as [string, string, string]),
      ...recentPayments.slice(0, 2).map((payment) => ["Payment recorded", `${payment.amount} for ${payment.course}`, payment.date] as [string, string, string]),
    ].slice(0, 6),
    recentUsers,
    recentCourses,
    recentPayments,
    categoryMix: await getCategoryMix(),
  };
}

export async function getAdminUsers(role?: "student" | "teacher" | "admin", limit = 100): Promise<AdminUserRow[]> {
  await connectDB();

  const users = await User.find(role ? { role } : {})
    .select("_id name email role accountStatus emailVerified createdAt")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<Array<{
      _id: { toString(): string };
      name?: string;
      email?: string;
      role?: "student" | "teacher" | "admin";
      accountStatus?: "active" | "suspended";
      emailVerified?: boolean;
      createdAt?: Date;
    }>>();

  const rows = await Promise.all(
    users.map(async (user) => {
      const [courseCount, paymentTotal] = await Promise.all([
        user.role === "teacher"
          ? Course.countDocuments({ teacher: user._id })
          : Enrollment.countDocuments({ student: user._id }),
        Payment.aggregate<{ total?: number }>([
          { $match: { student: user._id, status: "success" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

      return {
        id: user._id.toString(),
        name: user.name || "Unnamed user",
        email: user.email || "No email",
        role: user.role || "student",
        accountStatus: user.accountStatus || "active",
        status:
          user.accountStatus === "suspended"
            ? "Suspended"
            : user.role === "admin"
              ? "Verified"
              : user.emailVerified
                ? "Active"
                : "Pending",
        joined: formatDate(user.createdAt),
        courses: String(courseCount),
        spend: formatMoney(paymentTotal[0]?.total ?? 0),
      };
    }),
  );

  return rows;
}

export async function getAdminCourses(limit = 100): Promise<AdminCourseRow[]> {
  await connectDB();

  const courses = await Course.find()
    .select("_id title category level status teacher students createdAt")
    .populate("teacher", "name email")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<Array<{
      _id: { toString(): string };
      title?: string;
      category?: string;
      level?: string;
      status?: string;
      teacher?: { name?: string; email?: string } | null;
      students?: unknown[];
      createdAt?: Date;
    }>>();

  const revenueRows = await Payment.aggregate<{ _id: { toString(): string }; total?: number }>([
    { $match: { status: "success" } },
    { $group: { _id: "$course", total: { $sum: "$amount" } } },
  ]);
  const revenueByCourse = new Map(revenueRows.map((row) => [String(row._id), row.total ?? 0]));

  return courses.map((course) => ({
    id: course._id.toString(),
    title: course.title || "Untitled course",
    teacher: course.teacher?.name || course.teacher?.email || "Unassigned",
    category: course.category || "Uncategorized",
    level: course.level || "Unassigned",
    students: String(course.students?.length ?? 0),
    revenue: formatMoney(revenueByCourse.get(course._id.toString()) ?? 0),
    status: course.status || "Published",
    created: formatDate(course.createdAt),
  }));
}

export async function getAdminPayments(limit = 100): Promise<AdminPaymentRow[]> {
  await connectDB();

  const payments = await Payment.find()
    .populate("student", "name email")
    .populate("course", "title")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<Array<{
      _id: { toString(): string };
      student?: { name?: string; email?: string } | null;
      course?: { title?: string } | null;
      amount?: number;
      transactionId?: string;
      createdAt?: Date;
      status?: string;
    }>>();

  return payments.map((payment) => ({
    id: payment._id.toString(),
    student: payment.student?.name || payment.student?.email || "Unknown student",
    course: payment.course?.title || "Deleted course",
    amount: formatMoney(payment.amount ?? 0),
    transactionId: payment.transactionId || "Unknown",
    date: formatDate(payment.createdAt),
    status: payment.status || "pending",
  }));
}

export async function getAdminReviews(limit = 100): Promise<AdminReviewRow[]> {
  await connectDB();

  const reviews = await Review.find()
    .populate("student", "name email")
    .populate("course", "title")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<Array<{
      _id: { toString(): string };
      student?: { name?: string; email?: string } | null;
      course?: { title?: string } | null;
      rating?: number;
      review?: string;
      createdAt?: Date;
    }>>();

  return reviews.map((review) => ({
    id: review._id.toString(),
    student: review.student?.name || review.student?.email || "Unknown student",
    course: review.course?.title || "Deleted course",
    rating: String(review.rating ?? 0),
    review: review.review || "",
    status: "Published",
    created: formatDate(review.createdAt),
  }));
}

export async function getAdminNotifications(limit = 100): Promise<AdminNotificationRow[]> {
  await connectDB();

  const notifications = await Notification.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<Array<{
      _id: { toString(): string };
      title?: string;
      message?: string;
      read?: boolean;
      createdAt?: Date;
    }>>();

  return notifications.map((notification) => ({
    id: notification._id.toString(),
    title: notification.title || "Platform activity",
    message: notification.message || "",
    tone: notification.read ? "Resolved" : "Open",
    created: formatDate(notification.createdAt),
  }));
}

export async function getCategoryMix() {
  await connectDB();

  const rows = await Course.aggregate<{ _id?: string; value?: number }>([
    { $group: { _id: "$category", value: { $sum: 1 } } },
    { $sort: { value: -1 } },
    { $limit: 5 },
  ]);

  return rows.map((row) => ({
    name: row._id || "Uncategorized",
    value: row.value ?? 0,
  }));
}
