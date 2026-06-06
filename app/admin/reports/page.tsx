import type { Metadata } from "next";
import { getAdminReviews } from "@/lib/admin";
import { ReportsAdminPage } from "../../components/admin/admin-pages";

export const metadata: Metadata = {
  title: "Reports | Class Hub Admin",
};

export default async function Page() {
  const reviews = await getAdminReviews();

  return <ReportsAdminPage reviews={reviews} />;
}
