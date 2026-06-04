import type { Metadata } from "next";
import { StudentSettingsPage } from "../../../components/dashboard/student-pages";

export const metadata: Metadata = {
  title: "Settings | Class Hub",
};

export default function SettingsPage() {
  return <StudentSettingsPage />;
}
