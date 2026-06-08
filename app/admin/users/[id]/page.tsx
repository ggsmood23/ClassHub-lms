import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import Enrollment from "@/lib/models/Enrollment";
import Payment from "@/lib/models/Payment";
import User from "@/lib/models/User";
import { formatINR } from "@/lib/currency";
import { AdminPageFrame, AdminPanel, StatusBadge } from "../../../components/admin/admin-ui";

export const metadata: Metadata = {
  title: "User Details | Class Hub Admin",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value?: Date) {
  return value
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(value)
    : "Unknown";
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  await connectDB();

  const user = await User.findById(id).select("name email role accountStatus emailVerified createdAt");

  if (!user) {
    notFound();
  }

  const [enrollments, spending] = await Promise.all([
    Enrollment.countDocuments({ student: user._id }),
    Payment.aggregate<{ total?: number }>([
      { $match: { student: user._id, status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);
  const status =
    user.accountStatus === "suspended"
      ? "Suspended"
      : user.role === "admin"
        ? "Verified"
        : user.emailVerified
          ? "Active"
          : "Pending";

  return (
    <AdminPageFrame eyebrow="User record" title={user.name || "User details"}>
      <AdminPanel eyebrow="Account" title="Profile summary">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Detail label="Email" value={user.email || "No email"} />
          <Detail label="Role" value={user.role || "student"} />
          <Detail label="Joined" value={formatDate(user.createdAt)} />
          <div className="rounded-[1.25rem] bg-white/58 p-4 dark:bg-white/5">
            <p className="text-sm font-black text-slate-500 dark:text-slate-400">Status</p>
            <div className="mt-3">
              <StatusBadge status={status} />
            </div>
          </div>
          <Detail label="Enrollments" value={enrollments.toLocaleString()} />
          <Detail label="Successful spend" value={formatINR(spending[0]?.total ?? 0)} />
        </div>
        <Link className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-600 dark:bg-white dark:text-slate-950" href="/admin/students">
          Back to users
        </Link>
      </AdminPanel>
    </AdminPageFrame>
  );
}

function Detail({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-[1.25rem] bg-white/58 p-4 dark:bg-white/5">
      <p className="text-sm font-black text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 break-words text-xl font-black">{value}</p>
    </div>
  );
}
