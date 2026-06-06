"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BookOpenCheck,
  Clock3,
  Play,
  Target,
  Award,
  Download,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { formatINR } from "@/lib/currency";

type EnrollmentData = {
  _id: string;
  course: {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    level: string;
    thumbnail: string;
    lessonsCount: number;
    averageRating: number;
    totalReviews: number;
    teacher: {
      name: string;
      email: string;
    };
  };
  progress: number;
  completedLessons: string[];
  completed: boolean;
  createdAt: string;
};

type CertificateData = {
  _id: string;
  studentName: string;
  courseName: string;
  completionDate: string;
};

type PaymentData = {
  _id: string;
  courseTitle: string;
  amount: number;
  transactionId: string;
  status: "success" | "failed" | "pending";
  createdAt: string;
};

type StudentDashboardProps = {
  user?: {
    name: string;
    email: string;
    image: string;
  };
  enrollments?: EnrollmentData[];
  certificates?: CertificateData[];
  payments?: PaymentData[];
};

export function StudentDashboard({
  user = {
    name: "Student",
    email: "student@example.com",
    image: "",
  },
  enrollments = [],
  certificates = [],
  payments = [],
}: StudentDashboardProps) {
  const activeCoursesCount = enrollments.length;
  const avgProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) /
            enrollments.length
        )
      : 0;
  const completedCoursesCount = enrollments.filter((e) => e.completed).length;
  const totalLessons = enrollments.reduce(
    (sum, e) => sum + e.course.lessonsCount,
    0
  );

  return (
    <motion.section
      className="px-4 py-6 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6">
        <WelcomeBanner userName={user.name} />

        <motion.div
          className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
        >
          <StatCard
            label="Active courses"
            value={activeCoursesCount.toString()}
            change={`${activeCoursesCount} enrolled`}
            icon={BookOpenCheck}
            gradient="from-cyan-400 to-blue-500"
          />
          <StatCard
            label="Course progress"
            value={`${avgProgress}%`}
            change={`Average progress`}
            icon={Target}
            gradient="from-emerald-400 to-teal-500"
          />
          <StatCard
            label="Completed"
            value={completedCoursesCount.toString()}
            change={`${completedCoursesCount} course(s)`}
            icon={Award}
            gradient="from-amber-300 to-orange-500"
          />
          <StatCard
            label="Total lessons"
            value={totalLessons.toString()}
            change={`Across all courses`}
            icon={Clock3}
            gradient="from-violet-400 to-fuchsia-500"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <EnrolledCourses enrollments={enrollments} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12 }}
        >
          <Payments payments={payments} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.16 }}
        >
          <Certificates certificates={certificates} />
        </motion.div>
      </div>
    </motion.section>
  );
}

function formatPaymentDate(value: string) {
  return value
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(value))
    : "Unknown";
}

function Payments({ payments }: { payments: PaymentData[] }) {
  return (
    <section className="space-y-4">
      <div className="flex min-w-0 items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            My payments
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Simulated payment receipts for paid courses.
          </p>
        </div>
        <CreditCard className="size-7 shrink-0 text-cyan-600 dark:text-cyan-300" />
      </div>

      {payments.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/70 bg-white/74 p-8 text-center shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
          <CreditCard className="mx-auto size-12 text-slate-400 dark:text-slate-500" />
          <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
            No payments yet
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Buy a paid course to see simulated payment history here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/74 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left">
              <thead className="bg-slate-50/90 text-xs font-black uppercase tracking-[0.16em] text-slate-400 dark:bg-white/8">
                <tr>
                  <th className="px-4 py-4">Course</th>
                  <th className="px-4 py-4">Amount</th>
                  <th className="px-4 py-4">Transaction ID</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
                {payments.map((payment) => (
                  <tr key={payment._id} className="transition hover:bg-cyan-50/55 dark:hover:bg-white/8">
                    <td className="px-4 py-4 text-sm font-black text-slate-900 dark:text-white">
                      {payment.courseTitle}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                      {formatINR(payment.amount)}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                      {payment.transactionId}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                      {formatPaymentDate(payment.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200">
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function Certificates({ certificates }: { certificates: CertificateData[] }) {
  return (
    <section className="space-y-4">
      <div className="flex min-w-0 items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Your certificates
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Download certificates earned from completed courses.
          </p>
        </div>
        <Award className="size-7 shrink-0 text-amber-500" />
      </div>

      {certificates.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/70 bg-white/74 p-8 text-center shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
          <Award className="mx-auto size-12 text-slate-400 dark:text-slate-500" />
          <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
            No certificates yet
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Complete every lesson in a course to earn your certificate.
          </p>
        </div>
      ) : (
        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          {certificates.map((certificate) => (
            <article
              key={certificate._id}
              className="flex min-w-0 items-center justify-between gap-4 rounded-[1.5rem] border border-white/70 bg-white/74 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10"
            >
              <div className="min-w-0">
                <p className="text-xs font-black uppercase text-amber-600 dark:text-amber-300">
                  Certificate of completion
                </p>
                <h3 className="mt-2 truncate text-lg font-black text-slate-900 dark:text-white">
                  {certificate.courseName}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Awarded to {certificate.studentName} on{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  }).format(new Date(certificate.completionDate))}
                </p>
              </div>
              <a
                href={`/api/certificates/${certificate._id}/download`}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white transition hover:bg-cyan-600 dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-300"
                title={`Download ${certificate.courseName} certificate`}
              >
                <Download className="size-4" />
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function WelcomeBanner({ userName }: { userName: string }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-gradient-to-br from-slate-950 to-slate-900 p-0 text-white shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:from-white/8 dark:to-white/5">
      <div className="relative min-w-0 p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-28 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative">
          <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black text-cyan-100 backdrop-blur-xl">
            <Sparkles className="size-4" />
            Welcome back to your learning
          </div>
          <h1 className="mt-5 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            Hello, {userName}. Ready to learn?
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-300 sm:text-base">
            Continue learning from where you left off or explore new courses.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  gradient,
}: {
  label: string;
  value: string;
  change: string;
  icon: typeof BookOpenCheck;
  gradient: string;
}) {
  return (
    <motion.article
      className="group relative min-w-0 overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/74 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-2xl transition hover:-translate-y-1 hover:shadow-cyan-500/10 dark:border-white/10 dark:bg-white/10"
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -4 }}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-4xl font-black tracking-tight">{value}</p>
        </div>
        <span
          className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-cyan-500/15`}
        >
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-5 inline-flex max-w-full flex-wrap items-center gap-1 text-sm font-black text-cyan-700 dark:text-cyan-200">
        {change}
      </p>
    </motion.article>
  );
}

function EnrolledCourses({ enrollments }: { enrollments: EnrollmentData[] }) {
  if (enrollments.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-white/70 bg-white/74 p-8 text-center shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
        <BookOpenCheck className="mx-auto size-12 text-slate-400 dark:text-slate-500" />
        <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
          No courses yet
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Explore available courses and enroll to get started.
        </p>
        <Link
          href="/courses"
          className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-cyan-600 dark:bg-white dark:text-slate-950"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white">
        Your enrolled courses
      </h2>
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        {enrollments.map((enrollment, index) => (
          <motion.div
            key={enrollment._id}
            className="group relative min-w-0 overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/74 shadow-xl shadow-slate-900/5 backdrop-blur-2xl transition hover:-translate-y-1 dark:border-white/10 dark:bg-white/10"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            whileHover={{ y: -4 }}
          >
            <div className="relative aspect-video bg-slate-100 dark:bg-white/5">
              <Image
                src={enrollment.course.thumbnail || "/course-web.svg"}
                alt={`${enrollment.course.title} thumbnail`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-black text-slate-900 dark:text-white">
                    {enrollment.course.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    by {enrollment.course.teacher.name}
                  </p>
                </div>
                <Link
                  href={`/courses/${enrollment.course._id}`}
                  className="shrink-0 inline-flex rounded-full bg-cyan-600 p-2 text-white transition hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600"
                >
                  <Play className="size-5" />
                </Link>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                {enrollment.course.description}
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex min-w-0 items-center justify-between gap-2 text-sm">
                  <span className="font-black text-slate-700 dark:text-slate-300">
                    Progress
                  </span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {enrollment.progress}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                    style={{ width: `${enrollment.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1.5 font-black text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-200">
                  {enrollment.course.lessonsCount} lessons
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1.5 font-black text-slate-700 dark:bg-white/10 dark:text-slate-300">
                  {enrollment.course.level}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 font-black text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                  {enrollment.course.averageRating
                    ? `${enrollment.course.averageRating.toFixed(1)} rating`
                    : "No ratings"}{" "}
                  ({enrollment.course.totalReviews})
                </span>
                {enrollment.completed && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 font-black text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                    ✓ Completed
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
