"use client";

import Link from "next/link";
import {
  Bell,
  BadgeDollarSign,
  CheckCircle2,
  CreditCard,
  Flag,
  GraduationCap,
  LibraryBig,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminChartRow } from "@/lib/admin";
import { formatINR } from "@/lib/currency";
import { AdminDataTable, AdminPanel, AdminRowActionMenu, AdminStatCard, ClientChartFrame, StatusBadge } from "./admin-ui";

type AdminDashboardStats = {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  totalPayments: number;
};

type RecentUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
};

type RecentCourseRow = {
  id: string;
  title: string;
  teacher: string;
  category: string;
  level: string;
  enrollments: string;
  status: string;
  created: string;
};

type RecentPaymentRow = {
  id: string;
  student: string;
  course: string;
  amount: string;
  transactionId: string;
  date: string;
  status: string;
};

type AdminDashboardProps = {
  stats: AdminDashboardStats;
  chartRows: AdminChartRow[];
  categoryMix: Array<{ name: string; value: number }>;
  recentActivity: Array<[string, string, string]>;
  recentUsers: RecentUserRow[];
  recentCourses: RecentCourseRow[];
  recentPayments: RecentPaymentRow[];
};

const statIcons = [Users, Users, GraduationCap, ShieldCheck, LibraryBig, Flag, CreditCard, BadgeDollarSign];
const pieColors = ["#06b6d4", "#10b981", "#8b5cf6", "#f59e0b", "#f43f5e"];

function formatCount(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

function buildAdminStats(stats: AdminDashboardStats) {
  return [
    {
      label: "Total users",
      value: formatCount(stats.totalUsers),
      change: "All platform accounts",
      gradient: "from-blue-400 to-indigo-500",
    },
    {
      label: "Total students",
      value: formatCount(stats.totalStudents),
      change: "Active learner accounts",
      gradient: "from-cyan-400 to-blue-500",
    },
    {
      label: "Total teachers",
      value: formatCount(stats.totalTeachers),
      change: "Educator accounts",
      gradient: "from-emerald-400 to-teal-500",
    },
    {
      label: "Total admins",
      value: formatCount(stats.totalAdmins),
      change: "Privileged platform operators",
      gradient: "from-slate-500 to-slate-800",
    },
    {
      label: "Total courses",
      value: formatCount(stats.totalCourses),
      change: "Catalog records",
      gradient: "from-violet-400 to-fuchsia-500",
    },
    {
      label: "Total enrollments",
      value: formatCount(stats.totalEnrollments),
      change: "Enrollment records",
      gradient: "from-amber-300 to-orange-500",
    },
    {
      label: "Total revenue",
      value: formatINR(stats.totalRevenue),
      change: "Successful simulated payments",
      gradient: "from-cyan-400 to-teal-500",
    },
    {
      label: "Payments",
      value: formatCount(stats.totalPayments),
      change: "Successful payment records",
      gradient: "from-blue-400 to-indigo-500",
    },
  ];
}

export function AdminDashboard({
  stats,
  chartRows,
  categoryMix,
  recentActivity,
  recentUsers,
  recentCourses,
  recentPayments,
}: AdminDashboardProps) {
  const adminStats = buildAdminStats(stats);

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[104rem] min-w-0 space-y-6 overflow-hidden">
        <AdminHero />

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {adminStats.map((stat, index) => (
            <AdminStatCard key={stat.label} {...stat} icon={statIcons[index]} />
          ))}
        </div>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_25rem]">
          <div className="min-w-0 space-y-6">
            <div className="grid gap-6 xl:grid-cols-2">
              <PlatformChart data={chartRows} />
              <RevenueChart data={chartRows} />
            </div>
            <AdminPanel eyebrow="Users" title="Recent users">
              <AdminDataTable
                headers={["User", "Email", "Role", "Status", "Joined"]}
                rows={recentUsers}
                filterKeys={["name", "email", "role", "status"]}
                placeholder="Search users..."
                renderRow={(row) => [
                  <span key={row.name} className="font-black text-slate-950 dark:text-white">{row.name}</span>,
                  row.email,
                  row.role,
                  <StatusBadge key={row.status} status={row.status} />,
                  row.joined,
                ]}
                renderActions={(row) => (
                  <AdminRowActionMenu
                    label={`Open actions for ${row.name}`}
                    actions={[{ label: "View", href: `/admin/users/${row.id}` }]}
                  />
                )}
              />
            </AdminPanel>
            <AdminPanel eyebrow="Courses" title="Recent courses">
              <AdminDataTable
                headers={["Course", "Teacher", "Category", "Level", "Enrollments", "Status", "Created"]}
                rows={recentCourses}
                filterKeys={["title", "teacher", "category", "level", "status"]}
                placeholder="Search courses..."
                renderRow={(row) => [
                  <span key={row.title} className="font-black text-slate-950 dark:text-white">{row.title}</span>,
                  row.teacher,
                  row.category,
                  row.level,
                  row.enrollments,
                  <StatusBadge key={row.status} status={row.status} />,
                  row.created,
                ]}
                renderActions={(row) => (
                  <AdminRowActionMenu
                    label={`Open actions for ${row.title}`}
                    actions={[
                      { label: "View", href: `/courses/${row.id}` },
                      { label: "Edit", href: `/admin/courses/${row.id}` },
                    ]}
                  />
                )}
              />
            </AdminPanel>
            <AdminPanel eyebrow="Payments" title="Recent payments">
              <AdminDataTable
                headers={["Student", "Course", "Amount", "Transaction ID", "Date", "Status"]}
                rows={recentPayments}
                filterKeys={["student", "course", "transactionId", "status"]}
                placeholder="Search payments..."
                renderRow={(row) => [
                  <span key={row.student} className="font-black text-slate-950 dark:text-white">{row.student}</span>,
                  row.course,
                  row.amount,
                  row.transactionId,
                  row.date,
                  <StatusBadge key={row.status} status={row.status} />,
                ]}
                renderActions={(row) => (
                  <AdminRowActionMenu
                    label={`Open actions for payment ${row.transactionId}`}
                    actions={[{ label: "View", href: `/admin/payments/${row.id}` }]}
                  />
                )}
              />
            </AdminPanel>
          </div>

          <div className="space-y-6">
            <QuickActions />
            <CategoryMix data={categoryMix} />
            <ActivityFeed items={recentActivity} />
          </div>
        </div>
      </div>
    </section>
  );
}

function AdminHero() {
  return (
    <AdminPanel className="overflow-hidden bg-slate-950 p-0 text-white dark:bg-white/8">
      <div className="relative p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-28 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div>
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black text-cyan-100">
              <Sparkles className="size-4" />
              Platform operations are healthy today
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              Govern Class Hub with clear signals, fast approvals, and premium control.
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-300 sm:text-base">
              Manage learners, educators, courses, moderation, revenue, and platform health from one admin workspace.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <HeroButton href="/admin/approvals" icon={CheckCircle2} label="Review queue" primary />
            <HeroButton href="/admin/reports" icon={Flag} label="Moderation" />
          </div>
        </div>
      </div>
    </AdminPanel>
  );
}

export function PlatformChart({ data }: Readonly<{ data: AdminChartRow[] }>) {
  return (
    <AdminPanel eyebrow="Analytics" title="Platform growth">
      <ClientChartFrame>
        <ResponsiveContainer width="100%" height="100%" minWidth={240} minHeight={288} debounce={80}>
          <AreaChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="adminGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.34} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }} />
            <Tooltip contentStyle={{ borderRadius: 18, border: "1px solid rgba(148,163,184,0.25)", fontWeight: 700 }} />
            <Area type="monotone" dataKey="students" stroke="#06b6d4" strokeWidth={3} fill="url(#adminGrowth)" />
            <Area type="monotone" dataKey="teachers" stroke="#10b981" strokeWidth={2} fill="transparent" />
          </AreaChart>
        </ResponsiveContainer>
      </ClientChartFrame>
    </AdminPanel>
  );
}

export function RevenueChart({ data }: Readonly<{ data: AdminChartRow[] }>) {
  return (
    <AdminPanel eyebrow="Revenue" title="Revenue analytics">
      <ClientChartFrame>
        <ResponsiveContainer width="100%" height="100%" minWidth={240} minHeight={288} debounce={80}>
          <BarChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }} />
            <Tooltip
              contentStyle={{ borderRadius: 18, border: "1px solid rgba(148,163,184,0.25)", fontWeight: 700 }}
              formatter={(value) => (typeof value === "number" ? formatINR(value) : value)}
            />
            <Bar dataKey="revenue" radius={[14, 14, 0, 0]} fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </ClientChartFrame>
    </AdminPanel>
  );
}

function QuickActions() {
  const actions = [
    [CheckCircle2, "Approve courses", "/admin/approvals"],
    [Users, "Audit students", "/admin/students"],
    [Flag, "Review reports", "/admin/reports"],
    [Bell, "Send notice", "/admin/notifications"],
  ] as const;

  return (
    <AdminPanel eyebrow="Quick actions" title="Operate faster">
      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
        {actions.map(([Icon, label, href]) => (
          <Link
            key={label}
            href={href}
            className="rounded-[1.25rem] border border-slate-200/70 bg-white/65 px-4 py-4 text-left text-sm font-black shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 dark:border-white/10 dark:bg-white/5"
          >
            <Icon className="mb-3 size-5 text-cyan-600 dark:text-cyan-200" />
            {label}
          </Link>
        ))}
      </div>
    </AdminPanel>
  );
}

function CategoryMix({ data }: Readonly<{ data: Array<{ name: string; value: number }> }>) {
  return (
    <AdminPanel eyebrow="Catalog" title="Category mix">
      <ClientChartFrame className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={54} outerRadius={88} dataKey="value" paddingAngle={3}>
              {data.map((entry, index) => <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 18, border: "1px solid rgba(148,163,184,0.25)", fontWeight: 700 }} />
          </PieChart>
        </ResponsiveContainer>
      </ClientChartFrame>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-black text-slate-500 dark:text-slate-400">
        {data.map((item, index) => (
          <span key={item.name} className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: pieColors[index % pieColors.length] }} />
            {item.name}
          </span>
        ))}
      </div>
    </AdminPanel>
  );
}

function ActivityFeed({ items }: Readonly<{ items: Array<[string, string, string]> }>) {
  return (
    <AdminPanel eyebrow="Activity" title="Admin feed">
      <div className="space-y-5">
        {items.map(([title, helper, time]) => (
          <div key={title} className="flex gap-4">
            <span className="mt-1 size-2.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_0_6px_rgba(34,211,238,0.12)]" />
            <div className="min-w-0">
              <p className="font-black">{title}</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">{helper}</p>
              <p className="mt-1 text-xs font-black text-cyan-700 dark:text-cyan-200">{time}</p>
            </div>
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}

function HeroButton({
  href,
  icon: Icon,
  label,
  primary = false,
}: Readonly<{
  href: string;
  icon: typeof CheckCircle2;
  label: string;
  primary?: boolean;
}>) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black transition hover:-translate-y-0.5 ${
        primary ? "bg-white text-slate-950 hover:bg-cyan-100" : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}
