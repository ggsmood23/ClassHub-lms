import type { Metadata } from "next";
import { getAdminOverview } from "@/lib/admin";
import connectDB from "@/lib/db";
import { AdminDashboard } from "../components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | Class Hub",
  description: "Premium Class Hub admin dashboard for users, courses, analytics, revenue, and moderation.",
};

export default async function AdminDashboardPage() {
  await connectDB();
  const overview = await getAdminOverview();

  return (
    <AdminDashboard
      stats={overview.stats}
      chartRows={overview.chartRows}
      categoryMix={overview.categoryMix}
      recentActivity={overview.recentActivity}
      recentUsers={overview.recentUsers.map((user) => ({ ...user, role: user.role }))}
      recentCourses={overview.recentCourses.map((course) => ({ ...course, enrollments: course.students }))}
      recentPayments={overview.recentPayments}
    />
  );
}
