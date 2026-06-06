import type { Metadata } from "next";
import { getAdminNotifications } from "@/lib/admin";
import { NotificationsAdminPage } from "../../components/admin/admin-pages";

export const metadata: Metadata = {
  title: "Notifications | Class Hub Admin",
};

export default async function Page() {
  const notifications = await getAdminNotifications();

  return <NotificationsAdminPage notifications={notifications} />;
}
