import type { Metadata } from "next";
import { AssignmentsPage } from "../../components/educator/educator-management";

export const metadata: Metadata = {
  title: "Assignments | Class Hub Educator",
};

export default function Page() {
  return <AssignmentsPage />;
}
