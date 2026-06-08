import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import Payment from "@/lib/models/Payment";
import { formatINR } from "@/lib/currency";
import { AdminPageFrame, AdminPanel, StatusBadge } from "../../../components/admin/admin-ui";

export const metadata: Metadata = {
  title: "Payment Details | Class Hub Admin",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value?: Date) {
  return value
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value)
    : "Unknown";
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  await connectDB();

  const payment = await Payment.findById(id)
    .populate("student", "name email")
    .populate("course", "title");

  if (!payment) {
    notFound();
  }

  const student = payment.student as { name?: string; email?: string } | null;
  const course = payment.course as { title?: string } | null;

  return (
    <AdminPageFrame eyebrow="Payment record" title={payment.transactionId || "Payment details"}>
      <AdminPanel eyebrow="Transaction" title="Payment summary">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Detail label="Student" value={student?.name || student?.email || "Unknown student"} />
          <Detail label="Course" value={course?.title || "Deleted course"} />
          <Detail label="Amount" value={formatINR(payment.amount ?? 0)} />
          <div className="rounded-[1.25rem] bg-white/58 p-4 dark:bg-white/5">
            <p className="text-sm font-black text-slate-500 dark:text-slate-400">Status</p>
            <div className="mt-3">
              <StatusBadge status={payment.status || "pending"} />
            </div>
          </div>
          <Detail label="Method" value={payment.paymentMethod || "simulation"} />
          <Detail label="Created" value={formatDate(payment.createdAt)} />
        </div>
        <Link className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-600 dark:bg-white dark:text-slate-950" href="/admin/revenue">
          Back to revenue
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
