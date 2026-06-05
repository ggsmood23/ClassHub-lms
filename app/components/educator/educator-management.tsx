"use client";

import {
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  assignments,
  earningsData,
  messages,
  reviews,
  students,
  transactions,
} from "./educator-data";
import {
  ClientChartFrame,
  EducatorPanel,
  EducatorTable,
  EmptyEducatorState,
  FormField,
  ProgressBar,
  StatusBadge,
  inputClass,
} from "./educator-ui";

type CourseFormState = {
  title: string;
  description: string;
  price: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  thumbnail: string;
  thumbnailPublicId: string;
};

type EditCourseFormState = CourseFormState & {
  isPaid: boolean;
};

type LessonFormState = {
  title: string;
  videoUrl: string;
  duration: string;
};

type MongoCourse = {
  _id: string;
  title: string;
  description?: string;
  price?: number;
  isPaid?: boolean;
  category?: string;
  level?: "Beginner" | "Intermediate" | "Advanced";
  thumbnail?: string;
  thumbnailPublicId?: string;
  createdAt?: string;
  lessons?: Array<{
    title?: string;
    videoUrl?: string;
    duration?: string;
  }>;
  students?: unknown[];
};

type EducatorProfile = {
  name: string;
  email: string;
  image?: string | null;
};

export function AddCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState<CourseFormState>({
    title: "",
    description: "",
    price: "",
    category: "Development",
    level: "Beginner",
    thumbnail: "",
    thumbnailPublicId: "",
  });
  const [lessons, setLessons] = useState<LessonFormState[]>([
    { title: "", videoUrl: "", duration: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [thumbnailMessage, setThumbnailMessage] = useState("");
  const [thumbnailError, setThumbnailError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(field: keyof CourseFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateLesson(index: number, field: keyof LessonFormState, value: string) {
    setLessons((current) =>
      current.map((lesson, lessonIndex) =>
        lessonIndex === index ? { ...lesson, [field]: value } : lesson,
      ),
    );
  }

  function addLesson() {
    setLessons((current) => [
      ...current,
      { title: "", videoUrl: "", duration: "" },
    ]);
  }

  function removeLesson(index: number) {
    setLessons((current) => current.filter((_, lessonIndex) => lessonIndex !== index));
  }

  async function handleThumbnailSelection(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setThumbnailError("");
    setThumbnailMessage("");

    const allowedTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);

    if (!allowedTypes.has(file.type)) {
      setThumbnailError("Only JPG, JPEG, PNG, and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setThumbnailError("Image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setIsUploadingThumbnail(true);

    try {
      const uploadData = new FormData();
      uploadData.append("image", file);

      const response = await fetch("/api/upload/course-thumbnail", {
        method: "POST",
        body: uploadData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload thumbnail");
      }

      updateField("thumbnail", result.url);
      updateField("thumbnailPublicId", result.publicId);
      setThumbnailMessage("Thumbnail uploaded successfully.");
    } catch (uploadError) {
      setThumbnailError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload thumbnail",
      );
    } finally {
      setIsUploadingThumbnail(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      if (!form.title.trim()) {
        throw new Error("Course title is required");
      }

      if (
        lessons.some(
          (lesson) =>
            !lesson.title.trim() || !lesson.videoUrl.trim() || !lesson.duration.trim(),
        )
      ) {
        throw new Error("Each lesson requires a title, video URL, and duration");
      }

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: Number(form.price || 0),
          isPaid: Number(form.price || 0) > 0,
          category: form.category,
          level: form.level,
          thumbnail: form.thumbnail,
          thumbnailPublicId: form.thumbnailPublicId,
          lessons,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create course");
      }

      setMessage("Course created successfully. Redirecting to My Courses...");
      setForm({
        title: "",
        description: "",
        price: "",
        category: "Development",
        level: "Beginner",
        thumbnail: "",
        thumbnailPublicId: "",
      });
      setLessons([{ title: "", videoUrl: "", duration: "" }]);
      setThumbnailMessage("");

      window.setTimeout(() => {
        router.push("/educator/my-courses");
        router.refresh();
      }, 900);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageFrame eyebrow="Course builder" title="Add a new premium course">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <EducatorPanel title="Course information" eyebrow="Draft setup">
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <FormField label="Course title">
              <input
                className={inputClass}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="AI Product Design Masterclass"
                required
                value={form.title}
              />
            </FormField>
            <FormField label="Description editor">
              <textarea
                className={`${inputClass} min-h-40 resize-none leading-7`}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="Write a crisp course promise, outcomes, and learner profile..."
                value={form.description}
              />
            </FormField>
            <FormField label="Course thumbnail">
              <div className="space-y-3">
                <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-[1.25rem] border border-dashed border-slate-300 bg-white/70 px-4 py-5 text-center transition hover:border-cyan-400 hover:bg-cyan-50/50 dark:border-white/15 dark:bg-white/5 dark:hover:bg-cyan-300/10">
                  {isUploadingThumbnail ? (
                    <LoaderCircle className="size-6 animate-spin text-cyan-600 dark:text-cyan-300" />
                  ) : (
                    <ImagePlus className="size-6 text-cyan-600 dark:text-cyan-300" />
                  )}
                  <span className="text-sm font-black text-slate-950 dark:text-white">
                    {isUploadingThumbnail
                      ? "Uploading thumbnail..."
                      : "Choose thumbnail image"}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    JPG, JPEG, PNG, or WEBP up to 5 MB
                  </span>
                  <input
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={isUploadingThumbnail}
                    onChange={handleThumbnailSelection}
                    type="file"
                  />
                </label>

                {form.thumbnail ? (
                  <div className="relative aspect-video overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5">
                    <Image
                      src={form.thumbnail}
                      alt="Uploaded course thumbnail preview"
                      fill
                      sizes="(min-width: 1280px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}

                {thumbnailMessage ? (
                  <p className="inline-flex items-center gap-2 text-sm font-black text-emerald-700 dark:text-emerald-200">
                    <CheckCircle2 className="size-4" />
                    {thumbnailMessage}
                  </p>
                ) : null}
                {thumbnailError ? (
                  <p className="text-sm font-black text-rose-700 dark:text-rose-200">
                    {thumbnailError}
                  </p>
                ) : null}
              </div>
            </FormField>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Category">
                <select
                  className={inputClass}
                  onChange={(event) => updateField("category", event.target.value)}
                  value={form.category}
                >
                  {["Design", "Development", "Data", "Business", "Marketing"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Level">
                <select
                  className={inputClass}
                  onChange={(event) => updateField("level", event.target.value)}
                  value={form.level}
                >
                  {["Beginner", "Intermediate", "Advanced"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </FormField>
            </div>
            <FormField label="Price">
              <input
                className={inputClass}
                min="0"
                onChange={(event) => updateField("price", event.target.value)}
                placeholder="149"
                step="1"
                type="number"
                value={form.price}
              />
            </FormField>

            <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-slate-950 dark:text-white">Course lessons</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addLesson}
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-cyan-600 dark:bg-white dark:text-slate-950"
                >
                  Add lesson
                </button>
              </div>

              <div className="space-y-4">
                {lessons.map((lesson, index) => (
                  <div
                    key={index}
                    className="rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/70"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="font-black">Lesson {index + 1}</p>
                      {lessons.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeLesson(index)}
                          className="text-xs font-black uppercase tracking-[0.18em] text-rose-600 transition hover:text-rose-500"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        className={inputClass}
                        onChange={(event) => updateLesson(index, "title", event.target.value)}
                        placeholder="Lesson title"
                        required
                        value={lesson.title}
                      />
                      <input
                        className={inputClass}
                        onChange={(event) => updateLesson(index, "videoUrl", event.target.value)}
                        placeholder="Video URL"
                        required
                        value={lesson.videoUrl}
                      />
                      <input
                        className={inputClass}
                        onChange={(event) => updateLesson(index, "duration", event.target.value)}
                        placeholder="Duration (e.g. 12 min)"
                        required
                        value={lesson.duration}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {message ? (
              <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-200">
                {message}
              </div>
            ) : null}
            {error ? (
              <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700 dark:border-rose-300/20 dark:bg-rose-300/10 dark:text-rose-200">
                {error}
              </div>
            ) : null}

            <button
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
              disabled={isSubmitting || isUploadingThumbnail}
              type="submit"
            >
              {isSubmitting ? "Creating course..." : "Create course"}
            </button>
          </form>
        </EducatorPanel>

        <div className="space-y-6">
          <EducatorPanel eyebrow="Publishing" title="MongoDB ready">
            <div className="space-y-3 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
              <p className="font-black text-slate-950 dark:text-white">This form saves directly to the Class Hub courses collection.</p>
              <p>After creation, you will be sent to My Courses where the latest records are fetched from the API.</p>
            </div>
          </EducatorPanel>
          <EducatorPanel eyebrow="Fields" title="Included">
            <div className="grid grid-cols-2 gap-3 text-sm font-black">
              {["Title", "Description", "Thumbnail", "Price", "Category", "Level"].map((item) => (
                <span key={item} className="rounded-full bg-white/58 px-4 py-2 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  {item}
                </span>
              ))}
            </div>
          </EducatorPanel>
        </div>
      </div>
    </PageFrame>
  );
}

export function MyCoursesPage() {
  const [courses, setCourses] = useState<MongoCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replacingThumbnailId, setReplacingThumbnailId] = useState("");
  const [thumbnailStatus, setThumbnailStatus] = useState<
    Record<string, { message?: string; error?: string }>
  >({});
  const [error, setError] = useState("");
  const [editingCourse, setEditingCourse] = useState<MongoCourse | null>(null);
  const [editForm, setEditForm] = useState<EditCourseFormState>({
    title: "",
    description: "",
    price: "",
    category: "Development",
    level: "Beginner",
    thumbnail: "",
    thumbnailPublicId: "",
    isPaid: false,
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MongoCourse | null>(null);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);
  const totalRevenue = useMemo(
    () => courses.reduce((sum, course) => sum + (course.price ?? 0), 0),
    [courses],
  );

  function openEditModal(course: MongoCourse) {
    setEditingCourse(course);
    setEditError("");
    setEditForm({
      title: course.title || "",
      description: course.description || "",
      price: String(course.price ?? 0),
      category: course.category || "Development",
      level: course.level || "Beginner",
      thumbnail: course.thumbnail || "",
      thumbnailPublicId: course.thumbnailPublicId || "",
      isPaid: Boolean(course.isPaid || (course.price ?? 0) > 0),
    });
  }

  function updateEditField(field: keyof EditCourseFormState, value: string | boolean) {
    setEditForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  useEffect(() => {
    let isActive = true;

    async function loadCourses() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/courses", {
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load courses");
        }

        if (isActive) {
          setCourses(result.courses ?? []);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load courses");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleThumbnailReplacement(
    courseId: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setThumbnailStatus((current) => ({
      ...current,
      [courseId]: {},
    }));

    const allowedTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);

    if (!allowedTypes.has(file.type)) {
      setThumbnailStatus((current) => ({
        ...current,
        [courseId]: {
          error: "Only JPG, JPEG, PNG, and WEBP images are allowed.",
        },
      }));
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setThumbnailStatus((current) => ({
        ...current,
        [courseId]: { error: "Image must be 5 MB or smaller." },
      }));
      event.target.value = "";
      return;
    }

    setReplacingThumbnailId(courseId);

    try {
      const uploadData = new FormData();
      uploadData.append("image", file);

      const response = await fetch(`/api/courses/${courseId}/thumbnail`, {
        method: "POST",
        body: uploadData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to replace thumbnail");
      }

      setCourses((current) =>
        current.map((course) =>
          course._id === courseId
            ? {
                ...course,
                thumbnail: result.thumbnail,
                thumbnailPublicId: result.thumbnailPublicId,
              }
            : course,
        ),
      );
      setThumbnailStatus((current) => ({
        ...current,
        [courseId]: { message: "Thumbnail replaced successfully." },
      }));
    } catch (replacementError) {
      setThumbnailStatus((current) => ({
        ...current,
        [courseId]: {
          error:
            replacementError instanceof Error
              ? replacementError.message
              : "Failed to replace thumbnail",
        },
      }));
    } finally {
      setReplacingThumbnailId("");
      event.target.value = "";
    }
  }

  async function handleEditThumbnailSelection(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    if (!editingCourse) {
      return;
    }

    await handleThumbnailReplacement(editingCourse._id, event);
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingCourse) {
      return;
    }

    setIsSavingEdit(true);
    setEditError("");

    try {
      if (!editForm.title.trim()) {
        throw new Error("Course title is required");
      }

      const price = Number(editForm.price || 0);

      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Price must be zero or greater");
      }

      const response = await fetch(`/api/courses/${editingCourse._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          category: editForm.category,
          level: editForm.level,
          price,
          isPaid: editForm.isPaid && price > 0,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update course");
      }

      setCourses((current) =>
        current.map((course) =>
          course._id === editingCourse._id
            ? {
                ...course,
                title: result.course.title,
                description: result.course.description,
                category: result.course.category,
                level: result.course.level,
                price: result.course.price,
                isPaid: result.course.isPaid,
              }
            : course,
        ),
      );
      setEditingCourse(null);
    } catch (saveError) {
      setEditError(saveError instanceof Error ? saveError.message : "Failed to update course");
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDeleteCourse() {
    if (!deleteTarget) {
      return;
    }

    setIsDeletingCourse(true);

    try {
      const response = await fetch(`/api/courses/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete course");
      }

      setCourses((current) => current.filter((course) => course._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete course");
    } finally {
      setIsDeletingCourse(false);
    }
  }

  return (
    <PageFrame eyebrow="Course library" title="My courses">
      <EducatorPanel title="MongoDB courses" eyebrow="Fetched from GET /api/courses">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-48 animate-pulse rounded-[1.5rem] bg-slate-100 dark:bg-white/10" />
            ))}
          </div>
        ) : error ? (
          <EmptyEducatorState title="Courses could not load" description={error} />
        ) : courses.length === 0 ? (
          <EmptyEducatorState title="No courses yet" description="Create your first course from the Add Course page and it will appear here." />
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.25rem] bg-white/58 p-4 dark:bg-white/5">
                <p className="text-sm font-black text-slate-500 dark:text-slate-400">Total courses</p>
                <p className="mt-2 text-3xl font-black">{courses.length}</p>
              </div>
              <div className="rounded-[1.25rem] bg-white/58 p-4 dark:bg-white/5">
                <p className="text-sm font-black text-slate-500 dark:text-slate-400">Listed value</p>
                <p className="mt-2 text-3xl font-black">${totalRevenue.toLocaleString()}</p>
              </div>
              <div className="rounded-[1.25rem] bg-white/58 p-4 dark:bg-white/5">
                <p className="text-sm font-black text-slate-500 dark:text-slate-400">Source</p>
                <p className="mt-2 text-3xl font-black">API</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {courses.map((course) => (
                <article key={course._id} className="overflow-hidden rounded-[1.5rem] border border-slate-200/70 bg-white/60 shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 dark:border-white/10 dark:bg-white/5">
                  <div className="relative aspect-video bg-slate-100 dark:bg-white/5">
                    <Image
                      src={course.thumbnail || "/course-web.svg"}
                      alt={`${course.title} thumbnail`}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                    <label className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-950/90 px-3 py-2 text-xs font-black text-white shadow-lg backdrop-blur-xl transition hover:bg-cyan-600">
                      {replacingThumbnailId === course._id ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <ImagePlus className="size-3.5" />
                      )}
                      {replacingThumbnailId === course._id
                        ? "Uploading..."
                        : "Replace"}
                      <input
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={Boolean(replacingThumbnailId)}
                        onChange={(event) =>
                          handleThumbnailReplacement(course._id, event)
                        }
                        type="file"
                      />
                    </label>
                  </div>
                  <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-black">{course.title}</h3>
                      <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{course.category || "Uncategorized"}</p>
                    </div>
                    <StatusBadge status={course.level || "Beginner"} />
                  </div>
                  <p className="mt-4 line-clamp-3 min-h-16 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
                    {course.description || "No description added yet."}
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm font-black">
                    <span>${(course.price ?? 0).toLocaleString()}</span>
                    <span className="text-right">{course.students?.length ?? 0} students</span>
                  </div>
                  <div className="mt-4"><ProgressBar value={course.lessons?.length ? 70 : 20} /></div>
                  <div className="mt-4 flex items-center justify-between gap-3 text-sm font-black text-slate-500 dark:text-slate-400">
                    <span>{course.lessons?.length ?? 0} lessons</span>
                    <Link href={`/courses/${course._id}`} className="text-cyan-700 transition hover:text-cyan-500 dark:text-cyan-300">
                      View course
                    </Link>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm font-black text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-white/10 dark:bg-white/10 dark:text-white"
                      onClick={() => openEditModal(course)}
                      type="button"
                    >
                      <Pencil className="size-4" />
                      Edit
                    </button>
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-black text-rose-700 transition hover:bg-rose-100 dark:border-rose-300/20 dark:bg-rose-300/10 dark:text-rose-200"
                      onClick={() => setDeleteTarget(course)}
                      type="button"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </button>
                  </div>
                  <p className="mt-4 text-xs font-bold text-slate-400">
                    Created {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "recently"}
                  </p>
                  {thumbnailStatus[course._id]?.message ? (
                    <p className="mt-3 text-xs font-black text-emerald-700 dark:text-emerald-200">
                      {thumbnailStatus[course._id].message}
                    </p>
                  ) : null}
                  {thumbnailStatus[course._id]?.error ? (
                    <p className="mt-3 text-xs font-black text-rose-700 dark:text-rose-200">
                      {thumbnailStatus[course._id].error}
                    </p>
                  ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </EducatorPanel>
      {editingCourse ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[1.75rem] border border-white/70 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-slate-950">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">Edit course</p>
                <h2 className="mt-2 text-2xl font-black">{editingCourse.title}</h2>
              </div>
              <button
                className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-300 dark:border-white/10 dark:bg-white/10 dark:text-white"
                onClick={() => setEditingCourse(null)}
                type="button"
                aria-label="Close edit course"
              >
                <X className="size-4" />
              </button>
            </div>
            <form className="grid gap-5" onSubmit={handleEditSubmit}>
              <FormField label="Course title">
                <input className={inputClass} onChange={(event) => updateEditField("title", event.target.value)} required value={editForm.title} />
              </FormField>
              <FormField label="Description">
                <textarea className={`${inputClass} min-h-32 resize-none leading-7`} onChange={(event) => updateEditField("description", event.target.value)} value={editForm.description} />
              </FormField>
              <div className="grid gap-5 md:grid-cols-2">
                <FormField label="Category">
                  <select className={inputClass} onChange={(event) => updateEditField("category", event.target.value)} value={editForm.category}>
                    {["Design", "Development", "Data", "Business", "Marketing"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </FormField>
                <FormField label="Level">
                  <select className={inputClass} onChange={(event) => updateEditField("level", event.target.value)} value={editForm.level}>
                    {["Beginner", "Intermediate", "Advanced"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </FormField>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <FormField label="Price">
                  <input className={inputClass} min="0" onChange={(event) => updateEditField("price", event.target.value)} step="1" type="number" value={editForm.price} />
                </FormField>
                <FormField label="Paid course">
                  <label className="flex h-12 items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white/72 px-4 text-sm font-black dark:border-white/10 dark:bg-white/10">
                    <input checked={editForm.isPaid} onChange={(event) => updateEditField("isPaid", event.target.checked)} type="checkbox" />
                    Mark as paid
                  </label>
                </FormField>
              </div>
              <FormField label="Thumbnail">
                <div className="space-y-3">
                  {editingCourse.thumbnail ? (
                    <div className="relative aspect-video overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5">
                      <Image src={editingCourse.thumbnail} alt={`${editingCourse.title} thumbnail`} fill sizes="(min-width: 768px) 48rem, 100vw" className="object-cover" />
                    </div>
                  ) : null}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-cyan-600 dark:bg-white dark:text-slate-950">
                    {replacingThumbnailId === editingCourse._id ? <LoaderCircle className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                    Replace thumbnail
                    <input
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      className="sr-only"
                      disabled={Boolean(replacingThumbnailId)}
                      onChange={handleEditThumbnailSelection}
                      type="file"
                    />
                  </label>
                  {thumbnailStatus[editingCourse._id]?.message ? <p className="text-sm font-black text-emerald-700 dark:text-emerald-200">{thumbnailStatus[editingCourse._id].message}</p> : null}
                  {thumbnailStatus[editingCourse._id]?.error ? <p className="text-sm font-black text-rose-700 dark:text-rose-200">{thumbnailStatus[editingCourse._id].error}</p> : null}
                </div>
              </FormField>
              {editError ? <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700 dark:border-rose-300/20 dark:bg-rose-300/10 dark:text-rose-200">{editError}</div> : null}
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-600 disabled:opacity-60 dark:bg-white dark:text-slate-950" disabled={isSavingEdit} type="submit">
                {isSavingEdit ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Save changes
              </button>
            </form>
          </div>
        </div>
      ) : null}
      {deleteTarget ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.75rem] border border-white/70 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-600 dark:text-rose-200">Confirm delete</p>
                <h2 className="mt-2 text-2xl font-black">Delete this course?</h2>
              </div>
              <button className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-white" onClick={() => setDeleteTarget(null)} type="button" aria-label="Close delete confirmation">
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-4 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
              This will remove &quot;{deleteTarget.title}&quot; along with its enrollments, certificates, reviews, and dashboard references.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button className="rounded-full px-4 py-3 text-sm font-black text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white" onClick={() => setDeleteTarget(null)} type="button">
                Cancel
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-black text-white transition hover:bg-rose-500 disabled:opacity-60" disabled={isDeletingCourse} onClick={handleDeleteCourse} type="button">
                {isDeletingCourse ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                Delete course
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageFrame>
  );
}

export function StudentsPage() {
  return (
    <PageFrame eyebrow="Learners" title="Student progress">
      <EducatorPanel
        title="Enrolled students"
        eyebrow="Search and filter"
        action={<SearchBox placeholder="Search students..." />}
      >
        <EducatorTable
          headers={["Student", "Course", "Completion", "Status", "Last active"]}
          rows={students.map(([name, course, progress, status, active]) => [
            <span key={name} className="font-black text-slate-950 dark:text-white">{name}</span>,
            course,
            <span key={progress} className="inline-flex min-w-40 items-center gap-3"><ProgressBar value={Number(progress.replace("%", ""))} /> {progress}</span>,
            <StatusBadge key={status} status={status} />,
            active,
          ])}
          renderActions
        />
      </EducatorPanel>
    </PageFrame>
  );
}

export function AssignmentsPage() {
  return (
    <PageFrame eyebrow="Assignments" title="Create, collect, and grade work">
      <div className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <EducatorPanel title="Create assignment" eyebrow="New task">
          <div className="space-y-4">
            <input className={inputClass} placeholder="Assignment title" />
            <textarea className={`${inputClass} min-h-32 resize-none`} placeholder="Instructions and rubric..." />
            <input className={inputClass} type="date" />
            <button className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-cyan-600 dark:bg-white dark:text-slate-950" type="button">Create assignment</button>
          </div>
        </EducatorPanel>
        <EducatorPanel title="Submissions" eyebrow="Grading status">
          <EducatorTable headers={["Assignment", "Course", "Due date", "Submissions", "Status"]} rows={assignments.map(([a, b, c, d, e]) => [a, b, c, d, <StatusBadge key={e} status={e} />])} renderActions />
        </EducatorPanel>
      </div>
    </PageFrame>
  );
}

export function EarningsPage() {
  return (
    <PageFrame eyebrow="Revenue" title="Earnings analytics">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <EducatorPanel title="Monthly earnings" eyebrow="Revenue trend">
          <ClientChartFrame>
            <ResponsiveContainer width="100%" height="100%" minWidth={240} minHeight={288}>
              <BarChart data={earningsData} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }} />
                <Tooltip contentStyle={{ borderRadius: 18, border: "1px solid rgba(148,163,184,0.25)", fontWeight: 700 }} />
                <Bar dataKey="revenue" radius={[14, 14, 0, 0]} fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </ClientChartFrame>
        </EducatorPanel>
        <EducatorPanel title="Transactions" eyebrow="Latest">
          <EducatorTable headers={["ID", "Course", "Amount", "Status", "Date"]} rows={transactions.map(([a, b, c, d, e]) => [a, b, c, <StatusBadge key={d} status={d} />, e])} />
        </EducatorPanel>
      </div>
    </PageFrame>
  );
}

export function MessagesPage() {
  return (
    <PageFrame eyebrow="Messages" title="Learner conversations">
      <EducatorPanel title="Inbox" eyebrow="Recent">
        <div className="space-y-3">
          {messages.map(([name, text, time]) => (
            <div key={name} className="flex gap-3 rounded-[1.25rem] bg-white/58 p-4 dark:bg-white/5">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-xs font-black text-white dark:bg-white dark:text-slate-950">{name.split(" ").map((part) => part[0]).join("")}</span>
              <div className="min-w-0">
                <p className="font-black">{name}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{text}</p>
                <p className="mt-1 text-xs font-black text-cyan-700 dark:text-cyan-200">{time}</p>
              </div>
            </div>
          ))}
        </div>
      </EducatorPanel>
    </PageFrame>
  );
}

export function ReviewsPage() {
  return (
    <PageFrame eyebrow="Reviews" title="Course feedback">
      <EducatorPanel title="Recent reviews" eyebrow="Ratings">
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map(([course, rating, text]) => (
            <article key={course} className="rounded-[1.5rem] border border-slate-200/70 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
              <Star className="size-6 fill-current text-amber-400" />
              <p className="mt-4 text-3xl font-black">{rating}</p>
              <h3 className="mt-2 font-black">{course}</h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">{text}</p>
            </article>
          ))}
        </div>
      </EducatorPanel>
    </PageFrame>
  );
}

export function SettingsPage({
  user,
}: Readonly<{ user: EducatorProfile }>) {
  const educatorSlug = user.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return (
    <PageFrame eyebrow="Settings" title="Educator studio settings">
      <EducatorPanel title="Profile and publishing preferences" eyebrow="Account">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Display name"><input className={inputClass} defaultValue={user.name} /></FormField>
          <FormField label="Public educator URL"><input className={inputClass} defaultValue={`classhub.com/educators/${educatorSlug || "profile"}`} /></FormField>
          <FormField label="Notification email"><input className={inputClass} defaultValue={user.email} /></FormField>
          <FormField label="Default course visibility"><select className={inputClass} defaultValue="Draft"><option>Draft</option><option>Published</option></select></FormField>
        </div>
      </EducatorPanel>
    </PageFrame>
  );
}

export function EducatorLoadingState() {
  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[102rem] space-y-6">
        <div className="h-64 animate-pulse rounded-[2rem] bg-slate-200 dark:bg-white/10" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-40 animate-pulse rounded-[1.5rem] bg-slate-200 dark:bg-white/10" />)}
        </div>
        <EmptyEducatorState title="Preparing educator studio" description="Loading analytics, courses, and student activity." />
      </div>
    </section>
  );
}

function PageFrame({
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
      <div className="mx-auto w-full max-w-[102rem] space-y-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">{eyebrow}</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">{title}</h1>
        </div>
        {children}
      </div>
    </section>
  );
}

function SearchBox({ placeholder }: Readonly<{ placeholder: string }>) {
  return (
    <label className="flex h-11 min-w-64 items-center gap-3 rounded-full border border-slate-200 bg-white/72 px-4 text-sm font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10">
      <Search className="size-4" />
      <input className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400" placeholder={placeholder} />
    </label>
  );
}
