import type { Metadata } from "next";
import { CoursesAdminPage } from "../../components/admin/admin-pages";

export const metadata: Metadata = {
  title: "Courses | Class Hub Admin",
};

export default function Page() {
  return <CoursesAdminPage />;
}
