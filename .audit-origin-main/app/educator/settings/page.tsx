import type { Metadata } from "next";
import { SettingsPage } from "../../components/educator/educator-management";

export const metadata: Metadata = {
  title: "Settings | Class Hub Educator",
};

export default function Page() {
  return <SettingsPage />;
}
