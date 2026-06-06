import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import {
  Award,
  BookOpenCheck,
  CreditCard,
  LayoutDashboard,
  Mail,
  ShieldCheck,
  Target,
  UserCircle,
} from "lucide-react";
import { authOptions } from "@/lib/auth/options";
import { formatINR } from "@/lib/currency";
import connectDB from "@/lib/db";
import Certificate from "@/lib/models/Certificate";
import Enrollment from "@/lib/models/Enrollment";
import Payment from "@/lib/models/Payment";
import User from "@/lib/models/User";
import { ThemeToggle } from "../components/theme-toggle";

export const metadata: Metadata = {
  title: "Profile | Class Hub",
  description: "Protected Class Hub learner profile and account summary.",
};

export const dynamic = "force-dynamic";

type PopulatedEnrollment = {
  _id: { toString(): string };
  progress?: number;
  completed?: boolean;
  createdAt?: Date;
  course?: {
    _id?: { toString(): string };
    title?: string;
    category?: string;
    level?: string;
  };
};

type PopulatedPayment = {
  _id: { toString(): string };
  amount?: number;
  transactionId?: string;
  status?: "success" | "failed" | "pending";
  createdAt?: Date;
  course?: {
    title?: string;
  };
};

function formatDate(value?: Date) {
  return value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(value)
    : "Recent";
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email }).select(
    "name email role image",
  );

  if (!user) {
    notFound();
  }

  const [enrollments, certificates, payments] = await Promise.all([
    Enrollment.find({ student: user._id })
      .populate("course", "title category level")
      .sort({ createdAt: -1 })
      .lean<PopulatedEnrollment[]>(),
    Certificate.find({ student: user._id })
      .select("courseName completionDate")
      .sort({ completionDate: -1 }),
    Payment.find({ student: user._id })
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .lean<PopulatedPayment[]>(),
  ]);

  const completedCourses = enrollments.filter((enrollment) => enrollment.completed).length;
  const averageProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((sum, enrollment) => sum + (enrollment.progress ?? 0), 0) /
            enrollments.length,
        )
      : 0;
  const successfulPayments = payments.filter((payment) => payment.status === "success");
  const totalPaid = successfulPayments.reduce(
    (sum, payment) => sum + (payment.amount ?? 0),
    0,
  );

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950 dark:bg-[#070b12] dark:text-white">
      <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/72 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/62">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-lg font-black text-white shadow-lg shadow-cyan-500/20 dark:bg-white dark:text-slate-950">
              CH
            </span>
            <span className="truncate text-xl font-black tracking-tight">Class Hub</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-600 dark:bg-white dark:text-slate-950"
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/78 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="grid size-16 shrink-0 place-items-center rounded-[1.5rem] bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <UserCircle className="size-8" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">
                  Protected profile
                </p>
                <h1 className="mt-2 truncate text-3xl font-black">{user.name}</h1>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <Mail className="size-4" />
                  {user.email}
                </p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-black capitalize text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200">
              <ShieldCheck className="size-4" />
              {user.role}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ProfileStat label="Enrolled courses" value={enrollments.length.toString()} icon={BookOpenCheck} />
          <ProfileStat label="Certificates earned" value={certificates.length.toString()} icon={Award} />
          <ProfileStat label="Completion" value={`${averageProgress}%`} icon={Target} />
          <ProfileStat label="Paid history" value={formatINR(totalPaid)} icon={CreditCard} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <section className="rounded-[1.75rem] border border-white/70 bg-white/78 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
            <h2 className="text-2xl font-black">Enrolled courses</h2>
            <div className="mt-5 space-y-3">
              {enrollments.length > 0 ? (
                enrollments.map((enrollment) => (
                  <div key={enrollment._id.toString()} className="rounded-[1.25rem] bg-slate-50 p-4 dark:bg-white/8">
                    <div className="flex min-w-0 items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-black">{enrollment.course?.title || "Deleted course"}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                          {enrollment.course?.category || "Course"} · {enrollment.course?.level || "Level pending"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200">
                        {enrollment.progress ?? 0}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyProfileState text="No enrolled courses yet." />
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[1.75rem] border border-white/70 bg-white/78 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
              <h2 className="text-xl font-black">Completion statistics</h2>
              <div className="mt-5 space-y-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                <p>{completedCourses} completed course{completedCourses === 1 ? "" : "s"}.</p>
                <p>{enrollments.length - completedCourses} active course{enrollments.length - completedCourses === 1 ? "" : "s"} in progress.</p>
                <p>{averageProgress}% average progress across enrollments.</p>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-white/70 bg-white/78 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
              <h2 className="text-xl font-black">Certificates</h2>
              <div className="mt-5 space-y-3">
                {certificates.length > 0 ? (
                  certificates.map((certificate) => (
                    <div key={certificate._id.toString()} className="rounded-[1.25rem] bg-amber-50 p-4 text-sm font-semibold text-amber-800 dark:bg-amber-300/10 dark:text-amber-100">
                      <p className="font-black">{certificate.courseName}</p>
                      <p className="mt-1">{formatDate(certificate.completionDate)}</p>
                    </div>
                  ))
                ) : (
                  <EmptyProfileState text="No certificates earned yet." />
                )}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-white/70 bg-white/78 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
              <h2 className="text-xl font-black">Payment history</h2>
              <div className="mt-5 space-y-3">
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <div key={payment._id.toString()} className="rounded-[1.25rem] bg-slate-50 p-4 text-sm font-semibold dark:bg-white/8">
                      <p className="font-black">{payment.course?.title || "Deleted course"}</p>
                      <p className="mt-1 text-slate-500 dark:text-slate-400">
                        {formatINR(payment.amount ?? 0)} · {payment.status} · {formatDate(payment.createdAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <EmptyProfileState text="No payment records yet." />
                )}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function ProfileStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof BookOpenCheck;
}) {
  return (
    <article className="rounded-[1.5rem] border border-white/70 bg-white/78 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-black">{value}</p>
        </div>
        <span className="grid size-11 place-items-center rounded-2xl bg-cyan-50 text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200">
          <Icon className="size-5" />
        </span>
      </div>
    </article>
  );
}

function EmptyProfileState({ text }: { text: string }) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-slate-300 p-4 text-sm font-semibold text-slate-500 dark:border-white/10 dark:text-slate-400">
      {text}
    </div>
  );
}
