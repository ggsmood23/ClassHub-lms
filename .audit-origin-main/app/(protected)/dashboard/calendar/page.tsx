import type { Metadata } from "next";
import { StudentCalendarPage } from "../../../components/dashboard/student-pages";

export const metadata: Metadata = {
  title: "Calendar | Class Hub",
};

export default function CalendarPage() {
  return <StudentCalendarPage />;
}
