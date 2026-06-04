import type { Metadata } from "next";
import { NotificationsAdminPage } from "../../components/admin/admin-pages";

export const metadata: Metadata = {
  title: "Notifications | Class Hub Admin",
};

export default function Page() {
  return <NotificationsAdminPage />;
}
