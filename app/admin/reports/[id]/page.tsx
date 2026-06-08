import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import Review from "@/lib/models/Review";
import { AdminPageFrame, AdminPanel, StatusBadge } from "../../../components/admin/admin-ui";

export const metadata: Metadata = {
  title: "Review Details | Class Hub Admin",
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

  const review = await Review.findById(id)
    .populate("student", "name email")
    .populate("course", "title");

  if (!review) {
    notFound();
  }

  const student = review.student as { name?: string; email?: string } | null;
  const course = review.course as { title?: string } | null;

  return (
    <AdminPageFrame eyebrow="Review record" title="Review details">
      <AdminPanel eyebrow="Moderation" title={course?.title || "Deleted course"}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Detail label="Student" value={student?.name || student?.email || "Unknown student"} />
          <Detail label="Rating" value={`${review.rating ?? 0}/5`} />
          <Detail label="Created" value={formatDate(review.createdAt)} />
          <div className="rounded-[1.25rem] bg-white/58 p-4 dark:bg-white/5">
            <p className="text-sm font-black text-slate-700 dark:text-slate-400">Status</p>
            <div className="mt-3">
              <StatusBadge status={review.moderationStatus === "resolved" ? "Resolved" : "Published"} />
            </div>
          </div>
        </div>
        <p className="mt-5 max-w-3xl rounded-[1.25rem] bg-white/58 p-4 text-sm font-semibold leading-6 text-slate-700 dark:bg-white/5 dark:text-slate-300">
          {review.review}
        </p>
        <Link className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-600 dark:bg-white dark:text-slate-950" href="/admin/reports">
          Back to reports
        </Link>
      </AdminPanel>
    </AdminPageFrame>
  );
}

function Detail({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-[1.25rem] bg-white/58 p-4 dark:bg-white/5">
      <p className="text-sm font-black text-slate-700 dark:text-slate-400">{label}</p>
      <p className="mt-2 break-words text-xl font-black">{value}</p>
    </div>
  );
}
