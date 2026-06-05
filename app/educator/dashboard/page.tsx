import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { getEducatorDashboardSummary } from "@/lib/educator-dashboard";
import { getEducatorRevenueSummary } from "@/lib/payment-analytics";
import User from "@/lib/models/User";
import { EducatorDashboard } from "../../components/educator/educator-dashboard";

export const metadata: Metadata = {
  title: "Educator Dashboard | Class Hub",
  description:
    "Premium Class Hub educator dashboard for courses, students, earnings, and lessons.",
};

export default async function EducatorDashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user?.email
    ? await User.findOne({ email: session.user.email }).select("_id")
    : null;
  const revenueSummary = user
    ? await getEducatorRevenueSummary(user._id)
    : { totalRevenue: 0, totalSales: 0, revenuePerCourse: [] };
  const dashboardSummary = user
    ? await getEducatorDashboardSummary(user._id)
    : {
        stats: { totalStudents: 0, totalCourses: 0, activeCourses: 0 },
        enrollmentGrowth: [],
        earningsData: [],
        recentEnrollments: [],
      };

  return (
    <EducatorDashboard
      dashboardSummary={dashboardSummary}
      revenueSummary={revenueSummary}
    />
  );
}
