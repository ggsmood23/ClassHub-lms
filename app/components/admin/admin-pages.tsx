"use client";

import { Bell, LockKeyhole, Mail, ShieldCheck, SlidersHorizontal, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type {
  AdminChartRow,
  AdminCourseRow,
  AdminNotificationRow,
  AdminPaymentRow,
  AdminReviewRow,
  AdminUserRow,
} from "@/lib/admin";
import { PlatformChart, ReportsPanel, RevenueChart } from "./admin-dashboard";
import { AdminDataTable, AdminPageFrame, AdminPanel, StatusBadge, inputClass } from "./admin-ui";

const securityControls = [
  [ShieldCheck, "Require two-factor login"],
  [LockKeyhole, "Lock high-risk reports"],
  [SlidersHorizontal, "Enable strict course review"],
  [Users, "Notify admin team on spikes"],
] as const;

export function UsersAdminPage({
  currentAdminId,
  title,
  users,
}: Readonly<{
  currentAdminId: string;
  title: string;
  users: AdminUserRow[];
}>) {
  return (
    <AdminPageFrame eyebrow="Users" title={title}>
      <AdminPanel title="Platform accounts" eyebrow="Search, filter, and change roles">
        <AdminDataTable
          headers={["User", "Email", "Role", "Courses", "Spend", "Status", "Joined"]}
          rows={users}
          filterKeys={["name", "email", "role", "status"]}
          placeholder="Search users..."
          renderRow={(row) => [
            <span key={row.name} className="font-black text-slate-950 dark:text-white">{row.name}</span>,
            row.email,
            row.role,
            row.courses,
            row.spend,
            <StatusBadge key={row.status} status={row.status} />,
            row.joined,
          ]}
          renderActions={(row) => (
            <UserRoleControl currentAdminId={currentAdminId} user={row} />
          )}
        />
      </AdminPanel>
    </AdminPageFrame>
  );
}

export function CoursesAdminPage({
  courses,
}: Readonly<{ courses: AdminCourseRow[] }>) {
  return (
    <AdminPageFrame eyebrow="Courses" title="Manage courses">
      <AdminPanel title="Course catalog" eyebrow="Quality, revenue, and status">
        <AdminDataTable
          headers={["Course", "Teacher", "Category", "Students", "Revenue", "Status"]}
          rows={courses}
          filterKeys={["title", "teacher", "category", "status"]}
          placeholder="Search courses..."
          renderRow={(row) => [
            <span key={row.title} className="font-black text-slate-950 dark:text-white">{row.title}</span>,
            row.teacher,
            row.category,
            row.students,
            row.revenue,
            <StatusBadge key={row.status} status={row.status} />,
          ]}
          renderActions={(row) => <CourseActions course={row} />}
        />
      </AdminPanel>
    </AdminPageFrame>
  );
}

export function AnalyticsAdminPage({
  chartRows,
  metrics,
}: Readonly<{
  chartRows: AdminChartRow[];
  metrics: Array<[string, string, string]>;
}>) {
  return (
    <AdminPageFrame eyebrow="Platform analytics" title="Analytics overview">
      <div className="grid gap-6 xl:grid-cols-2">
        <PlatformChart data={chartRows} />
        <RevenueChart data={chartRows} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map(([label, value, helper]) => (
          <AdminPanel key={label}>
            <p className="text-sm font-black text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-3 text-4xl font-black tracking-tight">{value}</p>
            <p className="mt-4 text-sm font-black text-cyan-700 dark:text-cyan-200">{helper}</p>
          </AdminPanel>
        ))}
      </div>
    </AdminPageFrame>
  );
}

export function RevenueAdminPage({
  chartRows,
  payments,
  totals,
}: Readonly<{
  chartRows: AdminChartRow[];
  payments: AdminPaymentRow[];
  totals: { revenue: string; payments: string };
}>) {
  return (
    <AdminPageFrame eyebrow="Revenue analytics" title="Revenue operations">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <RevenueChart data={chartRows} />
        <AdminPanel eyebrow="Finance" title="Revenue split">
          <div className="space-y-4">
            {[
              ["Successful revenue", totals.revenue, "Paid course payments"],
              ["Payment records", totals.payments, "All transaction statuses"],
            ].map(([label, value, helper]) => (
              <div key={label} className="rounded-[1.25rem] bg-white/58 p-4 dark:bg-white/5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black">{label}</p>
                  <p className="text-lg font-black">{value}</p>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{helper}</p>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>
      <AdminPanel eyebrow="Transactions" title="Payment ledger">
        <AdminDataTable
          headers={["Student", "Course", "Amount", "Transaction ID", "Date", "Status"]}
          rows={payments}
          filterKeys={["student", "course", "transactionId", "status"]}
          placeholder="Search payments..."
          renderRow={(row) => [
            row.student,
            row.course,
            row.amount,
            row.transactionId,
            row.date,
            <StatusBadge key={row.status} status={row.status} />,
          ]}
        />
      </AdminPanel>
    </AdminPageFrame>
  );
}

export function ApprovalsAdminPage() {
  return (
    <AdminPageFrame eyebrow="Course approval system" title="Approve course submissions">
      <AdminPanel eyebrow="Course approval" title="Pending course submissions">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Course approval workflow is not modeled in the current database schema. Published course moderation is available from Courses.
        </p>
      </AdminPanel>
    </AdminPageFrame>
  );
}

export function ReportsAdminPage({
  reviews,
}: Readonly<{ reviews: AdminReviewRow[] }>) {
  return (
    <AdminPageFrame eyebrow="Reviews and ratings" title="Moderate course reviews">
      <AdminPanel eyebrow="Reviews" title="Published reviews">
        <AdminDataTable
          headers={["Student", "Course", "Rating", "Review", "Status", "Created"]}
          rows={reviews}
          filterKeys={["student", "course", "review", "status"]}
          placeholder="Search reviews..."
          renderRow={(row) => [
            row.student,
            row.course,
            row.rating,
            <span key={row.id} className="line-clamp-2 max-w-md">{row.review}</span>,
            <StatusBadge key={row.status} status={row.status} />,
            row.created,
          ]}
          renderActions={(row) => <ReviewActions review={row} />}
        />
      </AdminPanel>
      <ReportsPanel />
    </AdminPageFrame>
  );
}

export function NotificationsAdminPage({
  notifications,
}: Readonly<{ notifications: AdminNotificationRow[] }>) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSending(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        body: JSON.stringify({
          audience: formData.get("audience"),
          title: formData.get("title"),
          message: formData.get("message"),
        }),
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send notification");
      }

      setMessage(`Sent ${result.count} notification${result.count === 1 ? "" : "s"}.`);
      event.currentTarget.reset();
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to send notification");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <AdminPageFrame eyebrow="Notifications" title="Admin notification center">
      <div className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <AdminPanel eyebrow="Broadcast" title="Send update">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <select className={inputClass} defaultValue="all" name="audience">
              <option value="all">All users</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Admins</option>
            </select>
            <input className={inputClass} name="title" placeholder="Notification title" required />
            <textarea className={`${inputClass} min-h-32 resize-none`} name="message" placeholder="Write the update..." required />
            {message ? <p className="text-sm font-black text-emerald-700 dark:text-emerald-200">{message}</p> : null}
            {error ? <p className="text-sm font-black text-rose-700 dark:text-rose-200">{error}</p> : null}
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950" disabled={isSending} type="submit">
              <Mail className="size-4" />
              {isSending ? "Sending..." : "Send notification"}
            </button>
          </form>
        </AdminPanel>
        <AdminPanel eyebrow="Inbox" title="Platform alerts">
          <div className="grid gap-3 md:grid-cols-2">
            {notifications.map((item) => (
              <article key={item.title} className="rounded-[1.5rem] border border-slate-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
                <Bell className="size-5 text-cyan-600 dark:text-cyan-200" />
                <h3 className="mt-4 font-black">{item.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">{item.message}</p>
                <div className="mt-4"><StatusBadge status={item.tone} /></div>
              </article>
            ))}
          </div>
        </AdminPanel>
      </div>
    </AdminPageFrame>
  );
}

function UserRoleControl({
  currentAdminId,
  user,
}: Readonly<{ currentAdminId: string; user: AdminUserRow }>) {
  const router = useRouter();
  const [role, setRole] = useState(user.role);
  const [isSaving, setIsSaving] = useState(false);

  async function handleChange(nextRole: "student" | "teacher" | "admin") {
    setRole(nextRole);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to update role");
      }

      router.refresh();
    } catch {
      setRole(user.role);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <select
      aria-label={`Change role for ${user.name}`}
      className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
      disabled={isSaving || user.id === currentAdminId}
      onChange={(event) => handleChange(event.target.value as "student" | "teacher" | "admin")}
      value={role}
    >
      <option value="student">Student</option>
      <option value="teacher">Teacher</option>
      <option value="admin">Admin</option>
    </select>
  );
}

function CourseActions({ course }: Readonly<{ course: AdminCourseRow }>) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteCourse() {
    if (!window.confirm(`Delete ${course.title}? This removes enrollments, payments, reviews, assignments, and certificates for this course.`)) {
      return;
    }

    setIsDeleting(true);
    const response = await fetch(`/api/courses/${course.id}`, { method: "DELETE" });

    if (response.ok) {
      router.refresh();
    }

    setIsDeleting(false);
  }

  return (
    <button
      aria-label={`Delete ${course.title}`}
      className="grid size-9 place-items-center rounded-full border border-rose-200 bg-white/80 text-rose-600 transition hover:border-rose-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-300/20 dark:bg-white/10 dark:text-rose-200"
      disabled={isDeleting}
      onClick={deleteCourse}
      type="button"
    >
      <Trash2 className="size-4" />
    </button>
  );
}

function ReviewActions({ review }: Readonly<{ review: AdminReviewRow }>) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteReview() {
    if (!window.confirm("Remove this review?")) {
      return;
    }

    setIsDeleting(true);
    const response = await fetch(`/api/reviews/${review.id}`, { method: "DELETE" });

    if (response.ok) {
      router.refresh();
    }

    setIsDeleting(false);
  }

  return (
    <button
      aria-label="Remove review"
      className="grid size-9 place-items-center rounded-full border border-rose-200 bg-white/80 text-rose-600 transition hover:border-rose-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-300/20 dark:bg-white/10 dark:text-rose-200"
      disabled={isDeleting}
      onClick={deleteReview}
      type="button"
    >
      <Trash2 className="size-4" />
    </button>
  );
}

export function SettingsAdminPage() {
  return (
    <AdminPageFrame eyebrow="Settings" title="Admin settings">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <AdminPanel eyebrow="Admin profile" title="Profile and permissions">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-black text-slate-600 dark:text-slate-300">Display name</span>
              <input className={`${inputClass} mt-2`} placeholder="Managed from your account profile" disabled />
            </label>
            <label className="block">
              <span className="text-sm font-black text-slate-600 dark:text-slate-300">Email</span>
              <input className={`${inputClass} mt-2`} placeholder="Managed from your account profile" disabled />
            </label>
            <label className="block">
              <span className="text-sm font-black text-slate-600 dark:text-slate-300">Role</span>
              <select className={`${inputClass} mt-2`} defaultValue="Admin" disabled>
                <option>Admin</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-black text-slate-600 dark:text-slate-300">Approval threshold</span>
              <select className={`${inputClass} mt-2`} defaultValue="Manual for all paid courses">
                <option>Manual for all paid courses</option>
                <option>Manual for flagged courses</option>
              </select>
            </label>
          </div>
        </AdminPanel>
        <AdminPanel eyebrow="Security" title="Controls">
          <div className="space-y-3">
            {securityControls.map(([Icon, label]) => (
              <div key={label} className="flex items-center justify-between gap-4 rounded-[1.25rem] bg-white/58 p-4 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <Icon className="size-5 text-cyan-600 dark:text-cyan-200" />
                  <p className="text-sm font-black">{label}</p>
                </div>
                <button className="h-8 w-14 rounded-full bg-cyan-500 p-1 shadow-inner" type="button" aria-label={label}>
                  <span className="block size-6 translate-x-6 rounded-full bg-white shadow" />
                </button>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>
    </AdminPageFrame>
  );
}
