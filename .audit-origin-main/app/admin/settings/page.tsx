import type { Metadata } from "next";
import { SettingsAdminPage } from "../../components/admin/admin-pages";

export const metadata: Metadata = {
  title: "Settings | Class Hub Admin",
};

export default function Page() {
  return <SettingsAdminPage />;
}
