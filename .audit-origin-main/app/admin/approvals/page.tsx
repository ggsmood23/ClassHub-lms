import type { Metadata } from "next";
import { ApprovalsAdminPage } from "../../components/admin/admin-pages";

export const metadata: Metadata = {
  title: "Approvals | Class Hub Admin",
};

export default function Page() {
  return <ApprovalsAdminPage />;
}
