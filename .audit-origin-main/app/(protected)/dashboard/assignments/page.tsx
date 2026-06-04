import type { Metadata } from "next";
import { StudentAssignmentsPage } from "../../../components/dashboard/student-pages";

export const metadata: Metadata = {
  title: "Assignments | Class Hub",
};

export default function AssignmentsPage() {
  return <StudentAssignmentsPage />;
}
