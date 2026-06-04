import type { Metadata } from "next";
import { EarningsPage } from "../../components/educator/educator-management";

export const metadata: Metadata = {
  title: "Earnings | Class Hub Educator",
};

export default function Page() {
  return <EarningsPage />;
}
