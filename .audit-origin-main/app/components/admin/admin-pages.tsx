"use client";

import { Bell, LockKeyhole, Mail, ShieldCheck, SlidersHorizontal, Users } from "lucide-react";
import {
  courses,
  notifications,
  revenueTrend,
  students,
  teachers,
} from "./admin-data";
import { ApprovalQueuePanel, PlatformChart, ReportsPanel, RevenueChart } from "./admin-dashboard";
import { AdminDataTable, AdminPageFrame, AdminPanel, StatusBadge, inputClass } from "./admin-ui";

const securityControls = [
  [ShieldCheck, "Require two-factor login"],
  [LockKeyhole, "Lock high-risk reports"],
  [SlidersHorizontal, "Enable strict course review"],
  [Users, "Notify admin team on spikes"],
] as const;

export function StudentsAdminPage() {
  return (
    <AdminPageFrame eyebrow="Students" title="Manage students">
      <AdminPanel title="Learner accounts" eyebrow="Search and filter">
        <AdminDataTable
          headers={["Student", "Email", "Course", "Spend", "Status", "Joined"]}
          rows={students}
          filterKeys={["name", "email", "course", "status"]}
          placeholder="Search students..."
          renderRow={(row) => [
            <span key={row.name} className="font-black text-slate-950 dark:text-white">{row.name}</span>,
            row.email,
            row.course,
            row.spend,
            <StatusBadge key={row.status} status={row.status} />,
            row.joined,
          ]}
        />
      </AdminPanel>
    </AdminPageFrame>
  );
}

export function TeachersAdminPage() {
  return (
    <AdminPageFrame eyebrow="Teachers" title="Manage teachers">
      <AdminPanel title="Educator partners" eyebrow="Verification and quality">
        <AdminDataTable
          headers={["Teacher", "Specialty", "Courses", "Rating", "Status", "Earnings"]}
          rows={teachers}
          filterKeys={["name", "specialty", "status"]}
          placeholder="Search teachers..."
          renderRow={(row) => [
            <span key={row.name} className="font-black text-slate-950 dark:text-white">{row.name}</span>,
            row.specialty,
            row.courses,
            row.rating,
            <StatusBadge key={row.status} status={row.status} />,
            row.earnings,
          ]}
        />
      </AdminPanel>
    </AdminPageFrame>
  );
}

export function CoursesAdminPage() {
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
        />
      </AdminPanel>
    </AdminPageFrame>
  );
}

export function AnalyticsAdminPage() {
  return (
    <AdminPageFrame eyebrow="Platform analytics" title="Analytics overview">
      <div className="grid gap-6 xl:grid-cols-2">
        <PlatformChart />
        <RevenueChart />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Completion rate", "78.4%", "+4.2%"],
          ["Course NPS", "62", "+8 pts"],
          ["Support SLA", "94.8%", "within target"],
        ].map(([label, value, helper]) => (
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

export function RevenueAdminPage() {
  return (
    <AdminPageFrame eyebrow="Revenue analytics" title="Revenue operations">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <RevenueChart />
        <AdminPanel eyebrow="Finance" title="Revenue split">
          <div className="space-y-4">
            {[
              ["Subscriptions", "$198.9k", "70%"],
              ["Marketplace", "$85.7k", "30%"],
              ["Creator payouts", "$84.2k", "approved"],
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
      <AdminPanel eyebrow="Monthly ledger" title="Revenue by source">
        <AdminDataTable
          headers={["Month", "Total", "Subscriptions", "Marketplace"]}
          rows={revenueTrend.map((row) => ({
            month: row.month,
            status: "Active",
            total: `$${row.revenue.toLocaleString()}`,
            subscriptions: `$${row.subscriptions.toLocaleString()}`,
            marketplace: `$${row.marketplace.toLocaleString()}`,
          }))}
          filterKeys={["month", "total", "subscriptions", "marketplace"]}
          placeholder="Search revenue..."
          renderRow={(row) => [row.month, row.total, row.subscriptions, row.marketplace]}
        />
      </AdminPanel>
    </AdminPageFrame>
  );
}

export function ApprovalsAdminPage() {
  return (
    <AdminPageFrame eyebrow="Course approval system" title="Approve course submissions">
      <ApprovalQueuePanel />
    </AdminPageFrame>
  );
}

export function ReportsAdminPage() {
  return (
    <AdminPageFrame eyebrow="Reported content" title="Manage reported content">
      <ReportsPanel />
    </AdminPageFrame>
  );
}

export function NotificationsAdminPage() {
  return (
    <AdminPageFrame eyebrow="Notifications" title="Admin notification center">
      <div className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <AdminPanel eyebrow="Broadcast" title="Send update">
          <div className="space-y-4">
            <select className={inputClass} defaultValue="All users">
              <option>All users</option>
              <option>Students</option>
              <option>Teachers</option>
              <option>Admins</option>
            </select>
            <input className={inputClass} placeholder="Notification title" />
            <textarea className={`${inputClass} min-h-32 resize-none`} placeholder="Write the update..." />
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-cyan-600 dark:bg-white dark:text-slate-950" type="button">
              <Mail className="size-4" />
              Send notification
            </button>
          </div>
        </AdminPanel>
        <AdminPanel eyebrow="Inbox" title="Platform alerts">
          <div className="grid gap-3 md:grid-cols-2">
            {notifications.map((item) => (
              <article key={item.title} className="rounded-[1.5rem] border border-slate-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
                <Bell className="size-5 text-cyan-600 dark:text-cyan-200" />
                <h3 className="mt-4 font-black">{item.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">{item.helper}</p>
                <div className="mt-4"><StatusBadge status={item.tone} /></div>
              </article>
            ))}
          </div>
        </AdminPanel>
      </div>
    </AdminPageFrame>
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
              <input className={`${inputClass} mt-2`} defaultValue="Admin Kavya" />
            </label>
            <label className="block">
              <span className="text-sm font-black text-slate-600 dark:text-slate-300">Email</span>
              <input className={`${inputClass} mt-2`} defaultValue="admin@classhub.test" />
            </label>
            <label className="block">
              <span className="text-sm font-black text-slate-600 dark:text-slate-300">Role</span>
              <select className={`${inputClass} mt-2`} defaultValue="Super admin">
                <option>Super admin</option>
                <option>Operations admin</option>
                <option>Support admin</option>
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
