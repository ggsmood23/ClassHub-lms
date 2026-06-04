import type { Metadata } from "next";
import connectDB from "@/lib/db";
import Course from "@/lib/models/Course";
import Enrollment from "@/lib/models/Enrollment";
import User from "@/lib/models/User";
import { getAdminPaymentSummary } from "@/lib/payment-analytics";
import { AdminDashboard } from "../components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | Class Hub",
  description: "Premium Class Hub admin dashboard for users, courses, analytics, revenue, and moderation.",
};

type RecentUserRecord = {
  _id: { toString(): string };
  name?: string;
  email?: string;
  role?: string;
  createdAt?: Date;
};

type RecentCourseRecord = {
  _id: { toString(): string };
  title?: string;
  category?: string;
  level?: string;
  createdAt?: Date;
  teacher?: {
    name?: string;
    email?: string;
  } | null;
  students?: unknown[];
};

function formatDate(value?: Date) {
  return value
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
      }).format(value)
    : "Unknown";
}

function roleLabel(role?: string) {
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : "Unknown";
}

export default async function AdminDashboardPage() {
  await connectDB();

  const [
    totalStudents,
    totalTeachers,
    totalCourses,
    totalEnrollments,
    recentUsers,
    recentCourses,
    paymentSummary,
  ] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "teacher" }),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    User.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .select("name email role createdAt")
      .lean<RecentUserRecord[]>(),
    Course.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .select("title category level teacher students createdAt")
      .populate("teacher", "name email")
      .lean<RecentCourseRecord[]>(),
    getAdminPaymentSummary(),
  ]);

  return (
    <AdminDashboard
      stats={{
        totalStudents,
        totalTeachers,
        totalCourses,
        totalEnrollments,
        totalRevenue: paymentSummary.totalRevenue,
        totalTransactions: paymentSummary.totalTransactions,
      }}
      recentUsers={recentUsers.map((user) => ({
        id: user._id.toString(),
        name: user.name || "Unnamed user",
        email: user.email || "No email",
        role: roleLabel(user.role),
        status: user.role === "admin" ? "Verified" : "Active",
        joined: formatDate(user.createdAt),
      }))}
      recentCourses={recentCourses.map((course) => ({
        id: course._id.toString(),
        title: course.title || "Untitled course",
        teacher: course.teacher?.name || course.teacher?.email || "Unassigned",
        category: course.category || "Uncategorized",
        level: course.level || "Unassigned",
        enrollments: String(course.students?.length || 0),
        status: "Published",
        created: formatDate(course.createdAt),
      }))}
      recentPayments={paymentSummary.recentPayments.map((payment) => ({
        id: payment.id,
        student: payment.student,
        course: payment.course,
        amount: `$${payment.amount.toLocaleString()}`,
        transactionId: payment.transactionId,
        date: payment.date ? formatDate(new Date(payment.date)) : "Unknown",
        status: payment.status,
      }))}
    />
  );
}
