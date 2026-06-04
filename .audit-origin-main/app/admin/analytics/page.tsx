import type { Metadata } from "next";
import { AnalyticsAdminPage } from "../../components/admin/admin-pages";

export const metadata: Metadata = {
  title: "Analytics | Class Hub Admin",
};

export default function Page() {
  return <AnalyticsAdminPage />;
}
