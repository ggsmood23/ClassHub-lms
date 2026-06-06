import type { Metadata } from "next";
import { getAdminOverview, getAdminPayments } from "@/lib/admin";
import { formatINR } from "@/lib/currency";
import { RevenueAdminPage } from "../../components/admin/admin-pages";

export const metadata: Metadata = {
  title: "Revenue | Class Hub Admin",
};

export default async function Page() {
  const [overview, payments] = await Promise.all([
    getAdminOverview(),
    getAdminPayments(),
  ]);

  return (
    <RevenueAdminPage
      chartRows={overview.chartRows}
      payments={payments}
      totals={{
        revenue: formatINR(overview.stats.totalRevenue),
        payments: overview.stats.totalPayments.toLocaleString(),
      }}
    />
  );
}
