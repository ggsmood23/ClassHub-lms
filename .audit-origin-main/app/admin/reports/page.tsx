import type { Metadata } from "next";
import { ReportsAdminPage } from "../../components/admin/admin-pages";

export const metadata: Metadata = {
  title: "Reports | Class Hub Admin",
};

export default function Page() {
  return <ReportsAdminPage />;
}
