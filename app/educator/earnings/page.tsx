import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { EarningsPage } from "../../components/educator/educator-management";
import { authOptions } from "@/lib/auth/options";
import { getEducatorDashboardSummary } from "@/lib/educator-dashboard";
import connectDB from "@/lib/db";
import Course from "@/lib/models/Course";
import Payment from "@/lib/models/Payment";
import User from "@/lib/models/User";

export const metadata: Metadata = {
  title: "Earnings | Class Hub Educator",
};

type PaymentDocument = {
  _id: { toString(): string };
  amount?: number;
  status?: string;
  transactionId?: string;
  createdAt?: Date;
  course?: {
    title?: string;
  } | null;
};

function formatDate(value?: Date) {
  return value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(value)
    : "Recent";
}

export default async function Page() {
  const session = await getServerSession(authOptions);

  await connectDB();

  const user = session?.user?.email
    ? await User.findOne({ email: session.user.email }).select("_id role")
    : null;
  const dashboardSummary = user
    ? await getEducatorDashboardSummary(user._id)
    : { earningsData: [] };
  const courses = user
    ? await Course.find(user.role === "admin" ? {} : { teacher: user._id })
        .select("_id")
        .lean()
    : [];
  const payments = courses.length
    ? await Payment.find({ course: { $in: courses.map((course) => course._id) } })
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean<PaymentDocument[]>()
    : [];

  return (
    <EarningsPage
      earningsData={dashboardSummary.earningsData}
      transactions={payments.map((payment) => ({
        id: payment.transactionId || payment._id.toString(),
        course: payment.course?.title || "Deleted course",
        amount: `$${(payment.amount ?? 0).toLocaleString()}`,
        status: payment.status || "pending",
        date: formatDate(payment.createdAt),
      }))}
    />
  );
}
