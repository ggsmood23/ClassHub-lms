import type { Metadata } from "next";
import { StudentsAdminPage } from "../../components/admin/admin-pages";

export const metadata: Metadata = {
  title: "Students | Class Hub Admin",
};

export default function Page() {
  return <StudentsAdminPage />;
}
