import type { Metadata } from "next";
import { StudentsPage } from "../../components/educator/educator-management";

export const metadata: Metadata = {
  title: "Students | Class Hub Educator",
};

export default function Page() {
  return <StudentsPage />;
}
