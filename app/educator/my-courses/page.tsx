import type { Metadata } from "next";
import { MyCoursesPage } from "../../components/educator/educator-management";

export const metadata: Metadata = {
  title: "My Courses | Class Hub Educator",
};

export default function Page() {
  return <MyCoursesPage />;
}
