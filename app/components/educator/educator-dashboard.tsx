"use client";

import {
  BadgeDollarSign,
  BookOpenCheck,
  FilePlus2,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EducatorDashboardSummary } from "@/lib/educator-dashboard";
import type { EducatorRevenueSummary } from "@/lib/payment-analytics";
import { formatINR } from "@/lib/currency";
import { ClientChartFrame, EducatorPanel, EducatorStatCard, EducatorTable } from "./educator-ui";

const statIcons = [Users, BookOpenCheck, BadgeDollarSign, BookOpenCheck];

function formatMoney(value: number) {
  return formatINR(value);
}

export function EducatorDashboard({
  dashboardSummary,
  revenueSummary,
}: Readonly<{
  dashboardSummary: EducatorDashboardSummary;
  revenueSummary: EducatorRevenueSummary;
}>) {
  const stats = [
    {
      label: "Total students",
      value: dashboardSummary.stats.totalStudents.toLocaleString(),
      change: "Unique learners in your courses",
      gradient: "from-cyan-400 to-blue-500",
    },
    {
      label: "Total courses",
      value: dashboardSummary.stats.totalCourses.toLocaleString(),
      change: "Courses owned by you",
      gradient: "from-emerald-400 to-teal-500",
    },
    {
      label: "Total revenue",
      value: formatMoney(revenueSummary.totalRevenue),
      change: "Successful simulated payments",
      gradient: "from-violet-400 to-fuchsia-500",
    },
    {
      label: "Active courses",
      value: dashboardSummary.stats.activeCourses.toLocaleString(),
      change: "Owned courses with enrollments",
      gradient: "from-amber-300 to-orange-500",
    },
  ];

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[102rem] min-w-0 space-y-6 overflow-hidden">
        <EducatorHero />

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <EducatorStatCard key={stat.label} {...stat} icon={statIcons[index]} />
          ))}
        </div>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_25rem]">
          <div className="min-w-0 space-y-6">
            <div className="grid gap-6 xl:grid-cols-2">
              <EnrollmentChart data={dashboardSummary.enrollmentGrowth} />
              <EarningsChart data={dashboardSummary.earningsData} />
            </div>
            <RecentEnrollments rows={dashboardSummary.recentEnrollments} />
            <RevenuePerCourse revenueSummary={revenueSummary} />
          </div>
          <div className="space-y-6">
            <QuickActions />
            <ActivityFeed revenueSummary={revenueSummary} />
          </div>
        </div>
      </div>
    </section>
  );
}

function RevenuePerCourse({
  revenueSummary,
}: Readonly<{ revenueSummary: EducatorRevenueSummary }>) {
  return (
    <EducatorPanel eyebrow="Revenue" title="Revenue per course">
      {revenueSummary.revenuePerCourse.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/62 p-8 text-center dark:border-white/10 dark:bg-white/8">
          <h3 className="text-xl font-black">No paid course sales yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
            Simulated purchases of your paid courses will appear here.
          </p>
        </div>
      ) : (
        <EducatorTable
          headers={["Course", "Revenue", "Sales"]}
          rows={revenueSummary.revenuePerCourse.map((course) => [
            course.title,
            formatMoney(course.totalRevenue),
            course.totalSales.toLocaleString(),
          ])}
        />
      )}
    </EducatorPanel>
  );
}

function EducatorHero() {
  return (
    <EducatorPanel className="overflow-hidden bg-slate-950 p-0 text-white dark:bg-white/8">
      <div className="relative p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-28 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div>
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black text-cyan-100">
              <Sparkles className="size-4" />
              Educator studio is outperforming this month
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              Teach, track, and grow every course from one premium workspace.
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-300 sm:text-base">
              Monitor learner momentum, publish lessons, grade submissions, and keep revenue signals visible without leaving Class Hub.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <HeroButton icon={FilePlus2} label="Create course" primary />
            <HeroButton icon={BookOpenCheck} label="Review courses" />
          </div>
        </div>
      </div>
    </EducatorPanel>
  );
}

function EnrollmentChart({
  data,
}: Readonly<{ data: EducatorDashboardSummary["enrollmentGrowth"] }>) {
  return (
    <EducatorPanel eyebrow="Analytics" title="Enrollment growth">
      <ClientChartFrame>
        <ResponsiveContainer width="100%" height="100%" minWidth={240} minHeight={288} debounce={80}>
          <AreaChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="educatorEnrollment" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.34} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }} />
            <Tooltip contentStyle={{ borderRadius: 18, border: "1px solid rgba(148,163,184,0.25)", fontWeight: 700 }} />
            <Area type="monotone" dataKey="students" stroke="#06b6d4" strokeWidth={3} fill="url(#educatorEnrollment)" />
          </AreaChart>
        </ResponsiveContainer>
      </ClientChartFrame>
    </EducatorPanel>
  );
}

function EarningsChart({
  data,
}: Readonly<{ data: EducatorDashboardSummary["earningsData"] }>) {
  return (
    <EducatorPanel eyebrow="Revenue" title="Monthly earnings">
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
            <Bar dataKey="revenue" radius={[14, 14, 0, 0]} fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      </ClientChartFrame>
    </EducatorPanel>
  );
}

function RecentEnrollments({
  rows,
}: Readonly<{ rows: EducatorDashboardSummary["recentEnrollments"] }>) {
  return (
    <EducatorPanel eyebrow="Students" title="Recent enrollments">
      {rows.length === 0 ? (
        <p className="rounded-[1.5rem] border border-dashed border-slate-300 p-5 text-sm font-semibold text-slate-500 dark:border-white/10 dark:text-slate-400">
          No enrollments yet.
        </p>
      ) : (
        <EducatorTable
          headers={["Student", "Course", "Progress", "Joined"]}
          rows={rows.map((row) => row.map((cell) => cell))}
        />
      )}
    </EducatorPanel>
  );
}

function QuickActions() {
  const actions = [
    [FilePlus2, "Add course"],
    [BookOpenCheck, "Review lessons"],
    [MessageSquare, "Message cohort"],
    [BadgeDollarSign, "View payouts"],
  ] as const;

  return (
    <EducatorPanel eyebrow="Quick actions" title="Move faster">
      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
        {actions.map(([Icon, label]) => (
          <button
            key={label}
            className="rounded-[1.25rem] border border-slate-200/70 bg-white/65 px-4 py-4 text-left text-sm font-black shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 dark:border-white/10 dark:bg-white/5"
            type="button"
          >
            <Icon className="mb-3 size-5 text-cyan-600 dark:text-cyan-200" />
            {label}
          </button>
        ))}
      </div>
    </EducatorPanel>
  );
}

function ActivityFeed({
  revenueSummary,
}: Readonly<{ revenueSummary: EducatorRevenueSummary }>) {
  const activityFeed = [
    [
      "Revenue",
      `${formatMoney(revenueSummary.totalRevenue)} total successful payments.`,
      "Live",
    ],
    [
      "Sales",
      `${revenueSummary.totalSales.toLocaleString()} paid course transaction${revenueSummary.totalSales === 1 ? "" : "s"}.`,
      "Live",
    ],
    [
      "Courses",
      `${revenueSummary.revenuePerCourse.length.toLocaleString()} course${revenueSummary.revenuePerCourse.length === 1 ? "" : "s"} with revenue.`,
      "Live",
    ],
  ];

  return (
    <EducatorPanel eyebrow="Activity" title="Studio feed">
      <div className="space-y-5">
        {activityFeed.map(([title, helper, time]) => (
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
    </EducatorPanel>
  );
}

function HeroButton({
  icon: Icon,
  label,
  primary = false,
}: Readonly<{
  icon: typeof FilePlus2;
  label: string;
  primary?: boolean;
}>) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black transition hover:-translate-y-0.5 ${
        primary ? "bg-white text-slate-950 hover:bg-cyan-100" : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
      }`}
      type="button"
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
