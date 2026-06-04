import type { Metadata } from "next";
import { RevenueAdminPage } from "../../components/admin/admin-pages";

export const metadata: Metadata = {
  title: "Revenue | Class Hub Admin",
};

export default function Page() {
  return <RevenueAdminPage />;
}
