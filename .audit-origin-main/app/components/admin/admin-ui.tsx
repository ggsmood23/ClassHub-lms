"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, MoreHorizontal, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export function AdminPanel({
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
      className={`min-w-0 rounded-[2rem] border border-white/70 bg-white/76 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 sm:p-6 ${className}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {eyebrow || title || action ? (
        <div className="mb-5 flex min-w-0 flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">{eyebrow}</p> : null}
            {title ? <h2 className="mt-2 break-words text-2xl font-black tracking-tight">{title}</h2> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </motion.section>
  );
}

export function AdminStatCard({
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
      className="group relative min-w-0 overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/78 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-2xl transition hover:shadow-cyan-500/10 dark:border-white/10 dark:bg-white/10"
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
    status === "Published" || status === "Active" || status === "Verified" || status === "Resolved"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200"
      : status === "Pending" || status === "Review" || status === "Changes requested"
        ? "bg-amber-50 text-amber-700 dark:bg-amber-300/10 dark:text-amber-200"
        : status === "High" || status === "Open" || status === "At risk"
          ? "bg-rose-50 text-rose-700 dark:bg-rose-300/10 dark:text-rose-200"
          : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300";

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${tone}`}>{status}</span>;
}

export function AdminDataTable<T extends Record<string, string>>({
  headers,
  rows,
  filterKeys,
  renderRow,
  placeholder = "Search records...",
}: Readonly<{
  headers: string[];
  rows: T[];
  filterKeys: Array<keyof T>;
  renderRow: (row: T) => ReactNode[];
  placeholder?: string;
}>) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  const statuses = useMemo(() => ["All", ...Array.from(new Set(rows.map((row) => row.status).filter(Boolean)))], [rows]);
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery = normalizedQuery
        ? filterKeys.some((key) => row[key].toLowerCase().includes(normalizedQuery))
        : true;
      const matchesStatus = status === "All" || row.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [filterKeys, query, rows, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="flex h-11 w-full items-center gap-3 rounded-full border border-slate-200 bg-white/72 px-4 text-sm font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10 md:max-w-md">
          <Search className="size-4" />
          <input
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            value={query}
          />
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          {statuses.map((item) => (
            <button
              key={item}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${
                status === item
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "border border-slate-200 bg-white/64 text-slate-600 hover:border-cyan-300 dark:border-white/10 dark:bg-white/8 dark:text-slate-300"
              }`}
              onClick={() => setStatus(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/70 bg-white/58 dark:border-white/10 dark:bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left">
            <thead className="bg-slate-50/90 text-xs font-black uppercase tracking-[0.16em] text-slate-400 dark:bg-white/8">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-4 py-4">{header}</th>
                ))}
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
              {filteredRows.map((row, index) => (
                <tr key={`${row.name ?? row.title ?? row.item}-${index}`} className="transition hover:bg-cyan-50/55 dark:hover:bg-white/8">
                  {renderRow(row).map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-4 text-sm font-bold text-slate-600 dark:text-slate-300">{cell}</td>
                  ))}
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white/80 transition hover:border-cyan-300 dark:border-white/10 dark:bg-white/10"
                      aria-label="Open row actions"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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

export function AdminPageFrame({
  eyebrow,
  title,
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  children: ReactNode;
}>) {
  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[104rem] space-y-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">{eyebrow}</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">{title}</h1>
        </div>
        {children}
      </div>
    </section>
  );
}

export const inputClass =
  "w-full rounded-[1.1rem] border border-slate-200 bg-white/76 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/20 dark:border-white/10 dark:bg-white/8 dark:text-slate-200";
