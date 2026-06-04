"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export function EducatorPanel({
  eyebrow,
  title,
  action,
  children,
  className = "",
}: Readonly<{
  eyebrow?: string;
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}>) {
  return (
    <motion.section
      className={`min-w-0 rounded-[2rem] border border-white/70 bg-white/72 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 sm:p-6 ${className}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {eyebrow || title || action ? (
        <div className="mb-5 flex min-w-0 flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="break-words text-xs font-black uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">
                {eyebrow}
              </p>
            ) : null}
            {title ? <h2 className="mt-2 break-words text-2xl font-black tracking-tight">{title}</h2> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </motion.section>
  );
}

export function EducatorStatCard({
  label,
  value,
  change,
  icon: Icon,
  gradient,
}: Readonly<{
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  gradient: string;
}>) {
  return (
    <motion.article
      className="group relative min-w-0 overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/74 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-2xl transition hover:shadow-cyan-500/10 dark:border-white/10 dark:bg-white/10"
      whileHover={{ y: -4 }}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-3 text-4xl font-black tracking-tight">{value}</p>
        </div>
        <span className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-cyan-500/15`}>
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-5 inline-flex max-w-full flex-wrap items-center gap-1 text-sm font-black text-cyan-700 dark:text-cyan-200">
        {change}
        <ArrowUpRight className="size-4" />
      </p>
    </motion.article>
  );
}

export function StatusBadge({ status }: Readonly<{ status: string }>) {
  const tone =
    status === "Published" || status === "Paid" || status === "Active" || status === "Open"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200"
      : status === "Draft" || status === "Pending" || status === "Grading"
        ? "bg-amber-50 text-amber-700 dark:bg-amber-300/10 dark:text-amber-200"
        : "bg-rose-50 text-rose-700 dark:bg-rose-300/10 dark:text-rose-200";

  return <span className={`rounded-full px-3 py-1 text-xs font-black ${tone}`}>{status}</span>;
}

export function ProgressBar({ value }: Readonly<{ value: number }>) {
  return (
    <div className="h-2.5 min-w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

export function EducatorTable({
  headers,
  rows,
  renderActions = false,
}: Readonly<{
  headers: string[];
  rows: ReactNode[][];
  renderActions?: boolean;
}>) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/70 bg-white/58 dark:border-white/10 dark:bg-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] text-left">
          <thead className="bg-slate-50/90 text-xs font-black uppercase tracking-[0.16em] text-slate-400 dark:bg-white/8">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-4">
                  {header}
                </th>
              ))}
              {renderActions ? <th className="px-4 py-4">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
            {rows.map((row, index) => (
              <tr key={index} className="transition hover:bg-cyan-50/55 dark:hover:bg-white/8">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                    {cell}
                  </td>
                ))}
                {renderActions ? (
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white/80 transition hover:border-cyan-300 dark:border-white/10 dark:bg-white/10"
                      aria-label="Open row actions"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FormField({
  label,
  children,
}: Readonly<{
  label: string;
  children: ReactNode;
}>) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-black text-slate-600 dark:text-slate-300">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const inputClass =
  "w-full rounded-[1.1rem] border border-slate-200 bg-white/76 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/20 dark:border-white/10 dark:bg-white/8 dark:text-slate-200";

export function EmptyEducatorState({
  title,
  description,
}: Readonly<{
  title: string;
  description: string;
}>) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/62 p-8 text-center dark:border-white/10 dark:bg-white/8">
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

export function ClientChartFrame({
  children,
  className = "h-80",
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={`min-w-0 overflow-hidden rounded-[1.5rem] ${className}`} style={{ contain: "layout size" }}>
      {isMounted ? children : <div className="h-full w-full animate-pulse rounded-[1.5rem] bg-slate-100 dark:bg-white/10" />}
    </div>
  );
}
