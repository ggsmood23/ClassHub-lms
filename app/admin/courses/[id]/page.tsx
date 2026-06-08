import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import Course from "@/lib/models/Course";
import Payment from "@/lib/models/Payment";
import { formatINR } from "@/lib/currency";
import { AdminPageFrame, AdminPanel, StatusBadge } from "../../../components/admin/admin-ui";

export const metadata: Metadata = {
  title: "Course Details | Class Hub Admin",
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

  const course = await Course.findById(id)
    .select("title description category level status price isPaid students lessons teacher createdAt")
    .populate("teacher", "name email");

  if (!course) {
    notFound();
  }

  const revenue = await Payment.aggregate<{ total?: number }>([
    { $match: { course: course._id, status: "success" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const teacher = course.teacher as { name?: string; email?: string } | null;

  return (
    <AdminPageFrame eyebrow="Course record" title={course.title || "Course details"}>
      <AdminPanel eyebrow="Catalog" title="Course summary">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Detail label="Teacher" value={teacher?.name || teacher?.email || "Unassigned"} />
          <Detail label="Category" value={course.category || "Uncategorized"} />
          <Detail label="Level" value={course.level || "Beginner"} />
          <div className="rounded-[1.25rem] bg-white/58 p-4 dark:bg-white/5">
            <p className="text-sm font-black text-slate-700 dark:text-slate-400">Status</p>
            <div className="mt-3">
              <StatusBadge status={course.status || "Published"} />
            </div>
          </div>
          <Detail label="Price" value={formatINR(course.price ?? 0)} />
          <Detail label="Students" value={(course.students?.length ?? 0).toLocaleString()} />
          <Detail label="Lessons" value={(course.lessons?.length ?? 0).toLocaleString()} />
          <Detail label="Created" value={formatDate(course.createdAt)} />
          <Detail label="Successful revenue" value={formatINR(revenue[0]?.total ?? 0)} />
        </div>
        <p className="mt-5 max-w-3xl text-sm font-semibold leading-6 text-slate-700 dark:text-slate-400">
          {course.description || "No course description has been added."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-600 dark:bg-white dark:text-slate-950" href={`/courses/${course._id}`}>
            View public course
          </Link>
          <Link className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:border-cyan-300 dark:border-white/10 dark:text-slate-300" href="/admin/courses">
            Back to courses
          </Link>
        </div>
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
