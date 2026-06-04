import type { Metadata } from "next";
import { ReviewsPage } from "../../components/educator/educator-management";

export const metadata: Metadata = {
  title: "Reviews | Class Hub Educator",
};

export default function Page() {
  return <ReviewsPage />;
}
