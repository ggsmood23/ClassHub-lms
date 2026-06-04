import type { Metadata } from "next";
import { MessagesPage } from "../../components/educator/educator-management";

export const metadata: Metadata = {
  title: "Messages | Class Hub Educator",
};

export default function Page() {
  return <MessagesPage />;
}
