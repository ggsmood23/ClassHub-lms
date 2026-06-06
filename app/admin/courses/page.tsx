import type { Metadata } from "next";
import { getAdminCourses } from "@/lib/admin";
import { CoursesAdminPage } from "../../components/admin/admin-pages";

export const metadata: Metadata = {
  title: "Courses | Class Hub Admin",
};

export default async function Page() {
  const courses = await getAdminCourses();

  return <CoursesAdminPage courses={courses} />;
}
