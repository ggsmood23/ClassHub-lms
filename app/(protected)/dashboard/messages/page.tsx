import type { Metadata } from "next";
import { StudentMessagesPage } from "../../../components/dashboard/student-pages";

export const metadata: Metadata = {
  title: "Messages | Class Hub",
};

export default function MessagesPage() {
  return <StudentMessagesPage />;
}
