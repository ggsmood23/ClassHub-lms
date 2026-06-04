import type { Metadata } from "next";
import { TeachersAdminPage } from "../../components/admin/admin-pages";

export const metadata: Metadata = {
  title: "Teachers | Class Hub Admin",
};

export default function Page() {
  return <TeachersAdminPage />;
}
