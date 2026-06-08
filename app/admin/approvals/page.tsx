import type { Metadata } from "next";
import { getAdminCourses } from "@/lib/admin";
import { ApprovalsAdminPage } from "../../components/admin/admin-pages";

export const metadata: Metadata = {
  title: "Approvals | Class Hub Admin",
};

export default async function Page() {
  const courses = await getAdminCourses();

  return <ApprovalsAdminPage courses={courses} />;
}
