"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Trophy,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, type ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";
import { useToast } from "./toast-provider";

const navItems = [
  { label: "Overview", helper: "Home", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Courses", helper: "Learning", icon: BookOpen, href: "/courses" },
  { label: "Assignments", helper: "Tasks", icon: FileText, href: "/dashboard/assignments" },
  { label: "Calendar", helper: "Schedule", icon: CalendarDays, href: "/dashboard/calendar" },
  { label: "Certificates", helper: "Awards", icon: Trophy, href: "/dashboard/certificates" },
  { label: "Messages", helper: "Inbox", icon: Inbox, href: "/dashboard/messages" },
  { label: "Settings", helper: "Account", icon: Settings, href: "/dashboard/settings" },
];

type StudentNotification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
};

export function ProtectedShell({
  children,
  notifications,
}: Readonly<{
  children: ReactNode;
  notifications: StudentNotification[];
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { showToast } = useToast();
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  function handleSignOut() {
    showToast({
      title: "Signed out",
      message: "You have been returned to the homepage.",
      variant: "success",
    });
    signOut({ callbackUrl: "/" });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f8fb] text-slate-950 dark:bg-[#070b12] dark:text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_8%_8%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_92%_18%,rgba(99,102,241,0.14),transparent_30%),linear-gradient(180deg,#f8fafc,#eef3f9)] dark:bg-[radial-gradient(circle_at_8%_8%,rgba(45,212,191,0.14),transparent_30%),radial-gradient(circle_at_92%_18%,rgba(129,140,248,0.14),transparent_30%),linear-gradient(180deg,#070b12,#0f172a)]" />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[18.5rem] border-r border-white/70 bg-white/66 p-4 shadow-2xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/62 lg:block">
        <DashboardSidebar onNavigate={() => setIsSidebarOpen(false)} />
      </aside>

      <AnimatePresence>
        {isSidebarOpen ? (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              aria-label="Close dashboard navigation"
              className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
              type="button"
            />
            <motion.aside
              className="relative h-full w-[min(21rem,88vw)] border-r border-white/70 bg-white/90 p-4 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/92"
              initial={{ x: -340 }}
              animate={{ x: 0 }}
              exit={{ x: -340 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <button
                className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-slate-200 bg-white/80 text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-white"
                onClick={() => setIsSidebarOpen(false)}
                type="button"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
              <DashboardSidebar onNavigate={() => setIsSidebarOpen(false)} />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="lg:pl-[18.5rem]">
        <nav className="sticky top-0 z-30 border-b border-white/70 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/58">
          <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="grid size-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white/80 text-slate-950 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300 dark:border-white/10 dark:bg-white/10 dark:text-white lg:hidden"
                type="button"
                aria-label="Open dashboard navigation"
              >
                <Menu className="size-5" />
              </button>
              <div className="hidden h-11 w-80 items-center gap-3 rounded-full border border-slate-200/80 bg-white/72 px-4 text-sm font-semibold text-slate-500 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:text-slate-400 md:flex">
                <Search className="size-4" />
                Search courses, notes, certificates
              </div>
              <div className="md:hidden">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">
                  Class Hub
                </p>
                <h1 className="truncate text-lg font-black">Dashboard</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen((open) => !open)}
                  className="relative grid size-11 place-items-center rounded-full border border-slate-200 bg-white/78 text-slate-700 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300 dark:border-white/10 dark:bg-white/10 dark:text-white"
                  type="button"
                  aria-label="Open notifications"
                >
                  <Bell className="size-4" />
                  {unreadCount > 0 ? (
                    <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-cyan-400 ring-2 ring-white dark:ring-slate-950" />
                  ) : null}
                </button>
                <AnimatePresence>
                  {isNotificationsOpen ? (
                    <motion.div
                      className="absolute right-0 top-14 w-[min(22rem,calc(100vw-2rem))] rounded-[1.5rem] border border-white/70 bg-white/88 p-3 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/92"
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                    >
                      <div className="flex items-center justify-between px-2 py-2">
                        <p className="font-black">Notifications</p>
                        <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-black text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200">
                          {unreadCount} new
                        </span>
                      </div>
                      <div className="mt-2 space-y-2">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div key={notification.id} className="flex gap-3 rounded-2xl bg-slate-50/80 p-3 dark:bg-white/8">
                              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-cyan-600 shadow-sm dark:bg-white/10 dark:text-cyan-200">
                                <CheckCircle2 className="size-4" />
                              </span>
                              <div>
                                <p className="text-sm font-black">{notification.title}</p>
                                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{notification.message}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="rounded-2xl bg-slate-50/80 p-3 text-sm font-semibold text-slate-500 dark:bg-white/8 dark:text-slate-400">
                            No notifications yet.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
              <button
                onClick={handleSignOut}
                className="hidden h-11 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-cyan-600 dark:bg-white dark:text-slate-950 sm:inline-flex"
                type="button"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          </div>
        </nav>
        {children}
      </div>
    </main>
  );
}

function DashboardSidebar({
  onNavigate,
}: Readonly<{ onNavigate: () => void }>) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-3 px-2 py-2" onClick={onNavigate}>
        <span className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-lg font-black text-white shadow-lg shadow-cyan-500/20 dark:bg-white dark:text-slate-950">
          CH
        </span>
        <span>
          <span className="block text-lg font-black tracking-tight">Class Hub</span>
          <span className="block text-xs font-bold text-slate-500 dark:text-slate-400">
            Premium learner portal
          </span>
        </span>
      </Link>

      <div className="mt-8 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-black transition ${
                active
                  ? "bg-slate-950 text-white shadow-lg shadow-cyan-500/15 dark:bg-white dark:text-slate-950"
                  : "text-slate-600 hover:bg-white/80 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              <span
                className={`grid size-9 place-items-center rounded-xl ${
                  active
                    ? "bg-white/12 dark:bg-slate-950/8"
                    : "bg-slate-100/80 text-slate-500 group-hover:text-cyan-600 dark:bg-white/8 dark:text-slate-400"
                }`}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block">{item.label}</span>
                <span
                  className={`block text-xs font-bold ${
                    active
                      ? "text-cyan-200 dark:text-cyan-700"
                      : "text-slate-400"
                  }`}
                >
                  {item.helper}
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto overflow-hidden rounded-[1.5rem] border border-cyan-200/50 bg-gradient-to-br from-cyan-50/90 to-white/75 p-4 shadow-sm backdrop-blur-xl dark:border-cyan-300/10 dark:from-cyan-300/10 dark:to-white/5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <GraduationCap className="size-5" />
          </span>
          <div>
            <p className="text-sm font-black">Pro track</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              68% weekly target
            </p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/80 dark:bg-white/10">
          <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
        </div>
      </div>
    </div>
  );
}
