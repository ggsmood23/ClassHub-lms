import type { Metadata } from "next";
import { getAdminOverview } from "@/lib/admin";
import { AnalyticsAdminPage } from "../../components/admin/admin-pages";

export const metadata: Metadata = {
  title: "Analytics | Class Hub Admin",
};

export default async function Page() {
  const overview = await getAdminOverview();
  const completionRate =
    overview.stats.totalEnrollments > 0
      ? Math.round((overview.stats.totalPayments / overview.stats.totalEnrollments) * 100)
      : 0;

  return (
    <AnalyticsAdminPage
      chartRows={overview.chartRows}
      metrics={[
        ["Payment conversion", `${completionRate}%`, "Payments divided by enrollments"],
        ["Course density", overview.stats.totalCourses.toLocaleString(), "Courses in catalog"],
        ["Admin coverage", overview.stats.totalAdmins.toLocaleString(), "Admin accounts"],
      ]}
    />
  );
}
