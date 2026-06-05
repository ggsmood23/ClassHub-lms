import {
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Inbox,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type CertificateData = {
  _id: string;
  studentName: string;
  courseName: string;
  completionDate: string;
};

const assignments = [
  ["Design critique", "UI Design Fundamentals", "Due Jun 8", "In progress"],
  ["Data dashboard brief", "Data Analytics Essentials", "Due Jun 12", "Not started"],
  ["API integration exercise", "Full-Stack Web Apps", "Due Jun 15", "Not started"],
];

const calendarItems = [
  ["Jun 5", "Live mentor session", "UI Design Fundamentals", "6:00 PM"],
  ["Jun 8", "Design critique due", "UI Design Fundamentals", "11:59 PM"],
  ["Jun 12", "Dashboard brief due", "Data Analytics Essentials", "11:59 PM"],
];

const messages = [
  ["Course educator", "Your feedback is ready for the latest lesson.", "Today"],
  ["Class Hub Support", "Welcome to your learner workspace.", "Yesterday"],
  ["Arjun Mehta", "The next live session agenda is available.", "May 30"],
];

const settingsItems: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: Settings,
    title: "Learning preferences",
    description: "Course reminders and weekly progress summaries",
  },
  {
    icon: CheckCircle2,
    title: "Completion alerts",
    description: "Certificate and assignment completion notifications",
  },
  {
    icon: CalendarDays,
    title: "Calendar updates",
    description: "Live class and deadline schedule changes",
  },
  {
    icon: FileText,
    title: "Assignment updates",
    description: "New coursework and educator feedback",
  },
];

export function StudentAssignmentsPage() {
  return (
    <StudentPageFrame
      eyebrow="Coursework"
      title="Assignments"
      description="Track upcoming work across your enrolled courses."
    >
      <StudentPanel>
        <div className="divide-y divide-slate-200/80 dark:divide-white/10">
          {assignments.map(([title, course, due, status]) => (
            <div
              key={title}
              className="flex min-w-0 flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-black text-slate-950 dark:text-white">{title}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{course}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-sm">
                <span className="font-bold text-slate-500 dark:text-slate-400">{due}</span>
                <span className="rounded-full bg-cyan-50 px-3 py-1.5 font-black text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200">
                  {status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </StudentPanel>
    </StudentPageFrame>
  );
}

export function StudentCalendarPage() {
  return (
    <StudentPageFrame
      eyebrow="Learning schedule"
      title="Calendar"
      description="Keep course deadlines and live sessions in one place."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {calendarItems.map(([date, title, course, time]) => (
          <StudentPanel key={`${date}-${title}`}>
            <p className="text-sm font-black text-cyan-700 dark:text-cyan-200">{date}</p>
            <h2 className="mt-4 text-lg font-black text-slate-950 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{course}</p>
            <p className="mt-5 inline-flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-300">
              <Clock3 className="size-4" />
              {time}
            </p>
          </StudentPanel>
        ))}
      </div>
    </StudentPageFrame>
  );
}

export function StudentCertificatesPage({
  certificates,
}: {
  certificates: CertificateData[];
}) {
  return (
    <StudentPageFrame
      eyebrow="Achievements"
      title="Certificates"
      description="Download certificates earned from completed courses."
    >
      {certificates.length === 0 ? (
        <StudentPanel>
          <EmptyState
            icon={<Award className="size-10" />}
            title="No certificates yet"
            description="Complete every lesson in a course to earn your first certificate."
          />
        </StudentPanel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {certificates.map((certificate) => (
            <StudentPanel key={certificate._id}>
              <div className="flex min-w-0 items-start justify-between gap-4">
                <div className="min-w-0">
                  <Award className="size-7 text-amber-500" />
                  <h2 className="mt-4 truncate text-lg font-black text-slate-950 dark:text-white">
                    {certificate.courseName}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Awarded to {certificate.studentName}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-600 dark:text-slate-300">
                    {formatDate(certificate.completionDate)}
                  </p>
                </div>
                <a
                  href={`/api/certificates/${certificate._id}/download`}
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-950 text-white transition hover:bg-cyan-600 dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-300"
                  title={`Download ${certificate.courseName} certificate`}
                >
                  <Download className="size-4" />
                </a>
              </div>
            </StudentPanel>
          ))}
        </div>
      )}
    </StudentPageFrame>
  );
}

export function StudentMessagesPage() {
  return (
    <StudentPageFrame
      eyebrow="Conversations"
      title="Messages"
      description="Review updates from educators and the Class Hub team."
    >
      <StudentPanel>
        <div className="divide-y divide-slate-200/80 dark:divide-white/10">
          {messages.map(([sender, message, date]) => (
            <div key={`${sender}-${date}`} className="flex min-w-0 gap-4 py-4 first:pt-0 last:pb-0">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200">
                <Inbox className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <p className="truncate font-black text-slate-950 dark:text-white">{sender}</p>
                  <span className="shrink-0 text-xs font-bold text-slate-400">{date}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>
              </div>
            </div>
          ))}
        </div>
      </StudentPanel>
    </StudentPageFrame>
  );
}

export function StudentSettingsPage() {
  return (
    <StudentPageFrame
      eyebrow="Account"
      title="Settings"
      description="Manage your learner preferences and notifications."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {settingsItems.map(({ icon: Icon, title, description }) => (
          <StudentPanel key={title}>
            <div className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200">
                <Icon className="size-4" />
              </span>
              <div>
                <h2 className="font-black text-slate-950 dark:text-white">{title}</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
              </div>
            </div>
          </StudentPanel>
        ))}
      </div>
    </StudentPageFrame>
  );
}

function StudentPageFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6">
        <header>
          <p className="text-xs font-black uppercase text-cyan-700 dark:text-cyan-200">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">{description}</p>
        </header>
        {children}
      </div>
    </section>
  );
}

function StudentPanel({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-white/70 bg-white/74 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
      {children}
    </section>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="py-8 text-center text-slate-400">
      <div className="mx-auto w-fit">{icon}</div>
      <h2 className="mt-4 text-lg font-black text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
