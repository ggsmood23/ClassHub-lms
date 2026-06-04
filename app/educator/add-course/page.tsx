import type { Metadata } from "next";
import { AddCoursePage } from "../../components/educator/educator-management";

export const metadata: Metadata = {
  title: "Add Course | Class Hub Educator",
};

export default function Page() {
  return <AddCoursePage />;
}
