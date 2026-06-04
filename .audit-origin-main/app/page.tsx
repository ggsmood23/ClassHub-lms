"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./components/theme-toggle";

const navItems = ["Courses", "Categories", "Testimonials", "Pricing"];

const courses = [
  {
    title: "AI Product Design",
    level: "Advanced",
    duration: "8 weeks",
    students: "18.4k",
    gradient: "from-cyan-400 via-blue-500 to-indigo-500",
  },
  {
    title: "Full-Stack Web Apps",
    level: "Beginner",
    duration: "12 weeks",
    students: "27.9k",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
  },
  {
    title: "Data Analytics Mastery",
    level: "Career track",
    duration: "10 weeks",
    students: "14.2k",
    gradient: "from-amber-300 via-orange-500 to-rose-500",
  },
];

const categories = [
  ["Development", "124 courses"],
  ["Business", "86 courses"],
  ["Design", "72 courses"],
  ["Marketing", "64 courses"],
  ["Data Science", "58 courses"],
  ["Leadership", "41 courses"],
];

const testimonials = [
  {
    name: "Aarav Mehta",
    role: "Frontend Developer",
    quote:
      "Class Hub gave me the structure, mentors, and real projects I needed to switch careers with confidence.",
  },
  {
    name: "Nisha Rao",
    role: "Product Manager",
    quote:
      "The learning paths feel polished and practical. I could track progress, join live sessions, and keep momentum every week.",
  },
  {
    name: "Kabir Sen",
    role: "Data Analyst",
    quote:
      "The course quality is excellent, but the best part is how easy it is to find exactly what to learn next.",
  },
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950 transition-colors duration-500 dark:bg-[#070b12] dark:text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(241,245,249,0.96))] dark:bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(129,140,248,0.18),transparent_30%),linear-gradient(180deg,#070b12,#0f172a)]" />

      <nav className="sticky top-0 z-50 border-b border-white/50 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-3" aria-label="Class Hub home">
            <span className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-lg font-black text-white shadow-lg shadow-cyan-500/20 dark:bg-white dark:text-slate-950">
              CH
            </span>
            <span className="text-xl font-black tracking-tight">Class Hub</span>
          </a>

          <div className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item}
                href={item === "Courses" ? "/courses" : `#${item.toLowerCase()}`}
                className="text-sm font-semibold text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-full border border-slate-200 bg-white/75 px-5 py-3 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300 dark:border-white/10 dark:bg-white/10 dark:text-white"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:bg-cyan-600 dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-200"
            >
              Sign up
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen((open) => !open)}
            className="grid size-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-950 shadow-sm lg:hidden dark:border-white/10 dark:bg-white/10 dark:text-white"
            type="button"
            aria-label="Toggle navigation"
          >
            <span className="text-xl leading-none">{isMenuOpen ? "x" : "="}</span>
          </button>
        </div>

        {isMenuOpen ? (
          <div className="border-t border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-2xl lg:hidden dark:border-white/10 dark:bg-slate-950/90">
            <div className="mx-auto flex max-w-7xl flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item}
                  href={item === "Courses" ? "/courses" : `#${item.toLowerCase()}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  {item}
                </Link>
              ))}
              <div className="flex items-center justify-between rounded-2xl px-4 py-2.5">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Appearance
                </span>
                <ThemeToggle showLabel />
              </div>
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950"
              >
                Create account
              </Link>
            </div>
          </div>
        ) : null}
      </nav>

      <section className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div className="animate-fade-up">
          <p className="mb-5 inline-flex rounded-full border border-cyan-300/40 bg-white/65 px-4 py-2 text-sm font-bold text-cyan-700 shadow-sm backdrop-blur-xl dark:border-cyan-300/20 dark:bg-white/10 dark:text-cyan-200">
            Learn faster with curated paths, live cohorts, and expert mentors
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
            Build career-ready skills with{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 bg-clip-text text-transparent">
              Class Hub
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">
            A premium learning platform for modern teams and ambitious students,
            combining structured courses, real projects, analytics, and a
            polished classroom experience.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/courses"
              className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-4 text-center text-sm font-black text-white shadow-2xl shadow-cyan-500/25 transition hover:-translate-y-1 hover:shadow-cyan-500/35"
            >
              Explore courses
            </Link>
            <a
              href="#testimonials"
              className="rounded-full border border-slate-200 bg-white/70 px-7 py-4 text-center text-sm font-black text-slate-800 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300 dark:border-white/10 dark:bg-white/10 dark:text-white"
            >
              See outcomes
            </a>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["80k+", "Learners"],
              ["420+", "Lessons"],
              ["4.9/5", "Rating"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-3xl border border-white/70 bg-white/60 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10"
              >
                <p className="text-2xl font-black">{value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative animate-float">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-cyan-400/30 via-blue-500/20 to-violet-500/30 blur-3xl" />
          <div className="relative rounded-[2rem] border border-white/60 bg-white/62 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 dark:shadow-black/30">
            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cyan-200">Today&apos;s classroom</p>
                  <h2 className="mt-1 text-2xl font-black">UX Research Sprint</h2>
                </div>
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-200">
                  Live
                </span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-slate-300">Progress</p>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-300 to-blue-400" />
                  </div>
                  <p className="mt-3 text-3xl font-black">74%</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-slate-300">Mentor notes</p>
                  <p className="mt-4 text-lg font-bold">3 new reviews</p>
                  <p className="mt-2 text-sm text-slate-300">Portfolio project due Friday</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {["Research brief", "Interview synthesis", "Prototype review"].map(
                  (task, index) => (
                    <div
                      key={task}
                      className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"
                    >
                      <span className="font-semibold">{task}</span>
                      <span className="text-sm text-cyan-200">
                        {index === 0 ? "Done" : index === 1 ? "In review" : "Next"}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section id="courses" eyebrow="Featured courses" title="Career paths built for real momentum">
        <div className="grid gap-6 md:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course.title}
              className="group overflow-hidden rounded-3xl border border-white/70 bg-white/72 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition duration-300 hover:-translate-y-2 dark:border-white/10 dark:bg-white/10"
            >
              <div className={`h-36 bg-gradient-to-br ${course.gradient} p-5`}>
                <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white backdrop-blur">
                  {course.level}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-black">{course.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Project-led lessons, mentor feedback, assessments, and a
                  shareable certificate built into one focused track.
                </p>
                <div className="mt-6 flex items-center justify-between text-sm font-bold text-slate-500 dark:text-slate-400">
                  <span>{course.duration}</span>
                  <span>{course.students} students</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section id="categories" eyebrow="Categories" title="Find the skill lane that fits your next move">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(([name, count]) => (
            <Link
              key={name}
              href="/courses"
              className="group rounded-3xl border border-white/70 bg-white/64 p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-500/10 dark:border-white/10 dark:bg-white/10"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black">{name}</h3>
                  <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {count}
                  </p>
                </div>
                <span className="grid size-11 place-items-center rounded-full bg-slate-950 text-white transition group-hover:bg-cyan-500 dark:bg-white dark:text-slate-950">
                  +
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        id="testimonials"
        eyebrow="Student stories"
        title="Learners use Class Hub to turn effort into visible progress"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/10"
            >
              <blockquote className="text-lg font-semibold leading-8 text-slate-700 dark:text-slate-200">
                &quot;{testimonial.quote}&quot;
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 font-black text-white">
                  {testimonial.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-black">{testimonial.name}</p>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {testimonial.role}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/60 bg-slate-950 p-8 text-white shadow-2xl shadow-cyan-500/10 sm:p-12 dark:border-white/10">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-200">
                Start today
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
                Give every learner a smarter place to grow.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Launch polished courses, manage cohorts, and keep students
                engaged with a homepage that feels ready for a modern LMS.
              </p>
            </div>
            <a
              href="#courses"
              className="rounded-full bg-white px-7 py-4 text-center text-sm font-black text-slate-950 shadow-xl transition hover:-translate-y-1 hover:bg-cyan-100"
            >
              Browse catalog
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200/70 px-4 py-10 dark:border-white/10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xl font-black">Class Hub</p>
            <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Modern learning experiences for students, creators, and teams.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-500 dark:text-slate-400">
            <a href="#courses" className="hover:text-cyan-600 dark:hover:text-cyan-200">
              Courses
            </a>
            <a href="#categories" className="hover:text-cyan-600 dark:hover:text-cyan-200">
              Categories
            </a>
            <a href="#testimonials" className="hover:text-cyan-600 dark:hover:text-cyan-200">
              Stories
            </a>
            <a href="#pricing" className="hover:text-cyan-600 dark:hover:text-cyan-200">
              Get started
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: Readonly<{
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <section id={id} className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">
            {eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}
