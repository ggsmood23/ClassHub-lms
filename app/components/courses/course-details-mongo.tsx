"use client";

import Link from "next/link";
import { ArrowRight, LoaderCircle, Pencil, Play, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { formatINR } from "@/lib/currency";
import { EnrollButton } from "./enroll-button";

export type MongoLesson = {
  _id: string;
  title: string;
  duration?: string;
  videoUrl?: string;
};

export type MongoCourse = {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  level?: string;
  price?: number;
  isPaid?: boolean;
  thumbnail?: string;
  lessons?: MongoLesson[];
  students?: string[];
  createdAt?: string;
  alreadyEnrolled?: boolean;
  canReview?: boolean;
  currentUserId?: string;
  averageRating?: number;
  totalReviews?: number;
  existingReviewId?: string;
  reviews?: ReviewItem[];
};

export type ReviewItem = {
  _id: string;
  rating: number;
  review: string;
  createdAt: string;
  updatedAt: string;
  student: {
    _id: string;
    name: string;
    email: string;
    image: string;
  };
};

export function MongoCourseDetails({ course }: { course: MongoCourse }) {
  const router = useRouter();
  const lessonCount = course.lessons?.length ?? 0;
  const firstLesson = course.lessons?.[0];
  const createdAt = course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "Recent";
  const currentUserReview = course.reviews?.find(
    (review) => review.student._id === course.currentUserId,
  );
  const [rating, setRating] = useState(currentUserReview?.rating ?? 5);
  const [reviewText, setReviewText] = useState(currentUserReview?.review ?? "");
  const [isEditingReview, setIsEditingReview] = useState(!currentUserReview);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

  async function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReviewError("");
    setReviewMessage("");
    setIsSavingReview(true);

    try {
      const endpoint = currentUserReview
        ? `/api/reviews/${currentUserReview._id}`
        : "/api/reviews";
      const response = await fetch(endpoint, {
        method: currentUserReview ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course._id,
          rating,
          review: reviewText,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save review");
      }

      setReviewMessage(currentUserReview ? "Review updated." : "Review posted.");
      setIsEditingReview(false);
      router.refresh();
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "Failed to save review");
    } finally {
      setIsSavingReview(false);
    }
  }

  async function handleReviewDelete() {
    if (!currentUserReview) {
      return;
    }

    const confirmed = window.confirm("Delete your review for this course?");

    if (!confirmed) {
      return;
    }

    setReviewError("");
    setReviewMessage("");
    setIsDeletingReview(true);

    try {
      const response = await fetch(`/api/reviews/${currentUserReview._id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete review");
      }

      setReviewText("");
      setRating(5);
      setIsEditingReview(true);
      router.refresh();
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "Failed to delete review");
    } finally {
      setIsDeletingReview(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900/70">
          <div className="relative aspect-video overflow-hidden rounded-[1.75rem] bg-slate-100 dark:bg-slate-950/70">
            <Image
              src={course.thumbnail || "/course-web.svg"}
              alt={`${course.title} thumbnail`}
              fill
              preload
              sizes="(min-width: 1152px) 1104px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
                {course.category ?? "Course"}
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                {course.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                {course.description ?? "This course is being prepared by your teaching team."}
              </p>
            </div>
            <div className="grid gap-3 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 text-sm font-black text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-950/70 dark:text-white">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Lessons</p>
                <p className="text-2xl">{lessonCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Level</p>
                <p>{course.level ?? "Unassigned"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Updated</p>
                <p>{createdAt}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Rating</p>
                <p className="inline-flex items-center gap-1">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {course.averageRating ? course.averageRating.toFixed(1) : "New"}
                </p>
              </div>
              {course.price !== undefined ? (
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Price</p>
                  <p>{formatINR(course.price)}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="space-y-6">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-900/70">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Lessons
                    </p>
                    <h2 className="mt-2 text-2xl font-black">Course lessons</h2>
                  </div>
                  {firstLesson && course.alreadyEnrolled ? (
                    <Link
                      href={`/courses/${course._id}/lessons/${firstLesson._id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-cyan-700 px-4 py-3 text-sm font-black text-white transition hover:bg-cyan-600"
                    >
                      <Play className="size-4" />
                      Start first lesson
                    </Link>
                  ) : null}
                </div>

                <div className="space-y-3">
                  {course.lessons?.map((lesson) => {
                    const lessonContent = (
                      <div className="min-w-0">
                        <p className="font-black text-slate-950 dark:text-white">{lesson.title}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{lesson.duration ?? "Duration pending"}</p>
                      </div>
                    );

                    return course.alreadyEnrolled ? (
                      <Link
                        key={lesson._id}
                        href={`/courses/${course._id}/lessons/${lesson._id}`}
                        className="group flex items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 transition hover:border-cyan-300 hover:bg-cyan-50 dark:border-white/10 dark:bg-slate-950/80 dark:hover:bg-slate-900/80"
                      >
                        {lessonContent}
                        <span className="grid h-11 w-11 place-items-center rounded-full bg-cyan-600 text-white transition group-hover:bg-cyan-500">
                          <ArrowRight className="size-4" />
                        </span>
                      </Link>
                    ) : (
                      <div
                        key={lesson._id}
                        className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/80"
                      >
                        {lessonContent}
                        <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-500">
                        <ArrowRight className="size-4" />
                      </span>
                      </div>
                    );
                  })}
                  {lessonCount === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-400">
                      No lessons have been added to this course yet. Add lessons from the educator dashboard to populate the course.
                    </div>
                  ) : null}
                </div>
              </div>
              <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-900/70">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Reviews
                    </p>
                    <h2 className="mt-2 text-2xl font-black">Student feedback</h2>
                    <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {course.totalReviews ?? 0} review{course.totalReviews === 1 ? "" : "s"} with an average rating of{" "}
                      {course.averageRating ? course.averageRating.toFixed(1) : "0.0"}.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-black text-amber-700 dark:bg-amber-300/10 dark:text-amber-200">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    {course.averageRating ? course.averageRating.toFixed(1) : "0.0"}
                  </div>
                </div>

                {course.canReview ? (
                  <div className="mb-5 rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/80">
                    {currentUserReview && !isEditingReview ? (
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-black">Your review</p>
                          <RatingStars value={currentUserReview.rating} />
                          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                            {currentUserReview.review}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-white/10 dark:bg-white/10 dark:text-white"
                            onClick={() => setIsEditingReview(true)}
                            type="button"
                            aria-label="Edit review"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            className="inline-flex size-10 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 disabled:opacity-60 dark:border-rose-300/20 dark:bg-rose-300/10 dark:text-rose-200"
                            disabled={isDeletingReview}
                            onClick={handleReviewDelete}
                            type="button"
                            aria-label="Delete review"
                          >
                            {isDeletingReview ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form className="space-y-4" onSubmit={handleReviewSubmit}>
                        <div>
                          <p className="text-sm font-black">{currentUserReview ? "Edit your review" : "Write a review"}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                key={value}
                                className={`inline-flex size-10 items-center justify-center rounded-full border text-sm font-black transition ${
                                  value <= rating
                                    ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-200"
                                    : "border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300"
                                }`}
                                onClick={() => setRating(value)}
                                type="button"
                                aria-label={`${value} star rating`}
                              >
                                {value}
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea
                          className="min-h-28 w-full resize-none rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 outline-none transition focus:border-cyan-400 dark:border-white/10 dark:bg-white/10"
                          maxLength={1200}
                          minLength={3}
                          onChange={(event) => setReviewText(event.target.value)}
                          placeholder="Share what helped you learn..."
                          required
                          value={reviewText}
                        />
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-600 disabled:opacity-60 dark:bg-white dark:text-slate-950"
                            disabled={isSavingReview}
                            type="submit"
                          >
                            {isSavingReview ? <LoaderCircle className="size-4 animate-spin" /> : null}
                            {currentUserReview ? "Update review" : "Post review"}
                          </button>
                          {currentUserReview ? (
                            <button
                              className="rounded-full px-4 py-3 text-sm font-black text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                              onClick={() => {
                                setIsEditingReview(false);
                                setReviewText(currentUserReview.review);
                                setRating(currentUserReview.rating);
                              }}
                              type="button"
                            >
                              Cancel
                            </button>
                          ) : null}
                        </div>
                      </form>
                    )}
                    {reviewMessage ? <p className="mt-3 text-sm font-black text-emerald-700 dark:text-emerald-200">{reviewMessage}</p> : null}
                    {reviewError ? <p className="mt-3 text-sm font-black text-rose-700 dark:text-rose-200">{reviewError}</p> : null}
                  </div>
                ) : null}

                <div className="space-y-3">
                  {(course.reviews ?? []).length > 0 ? (
                    course.reviews?.map((review) => (
                      <article key={review._id} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/80">
                        <div className="flex min-w-0 items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-black">{review.student.name}</p>
                            <p className="mt-1 text-xs font-bold text-slate-400">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Recent"}
                            </p>
                          </div>
                          <RatingStars value={review.rating} />
                        </div>
                        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                          {review.review}
                        </p>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-6 text-sm font-semibold text-slate-500 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-400">
                      No reviews yet. Enrolled students can be the first to review this course.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  {course.isPaid ? "Purchase course" : "Enroll in course"}
                </p>
                <div className="mt-5">
                  <EnrollButton
                    courseId={course._id}
                    alreadyEnrolled={course.alreadyEnrolled}
                    isPaid={course.isPaid}
                    price={course.price ?? 0}
                  />
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Course summary</p>
                <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <p>
                    Rated {course.averageRating ? course.averageRating.toFixed(1) : "0.0"} by {course.totalReviews ?? 0} student review{course.totalReviews === 1 ? "" : "s"}.
                  </p>
                  <p>
                    {lessonCount} lesson{lessonCount === 1 ? "" : "s"} stored in MongoDB and ready to play.
                  </p>
                  <p>
                    Each lesson includes title, video URL, and duration so learners can access the exact lesson content.
                  </p>
                  <p>
                    The lesson collection is persisted inside the course document using the existing Course model.
                  </p>
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Course access</p>
                <div className="mt-5 flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/80">
                    <p className="font-black">Category</p>
                    <p className="mt-1">{course.category ?? "Uncategorized"}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/80">
                    <p className="font-black">Level</p>
                    <p className="mt-1">{course.level ?? "Unassigned"}</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function RatingStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1 text-amber-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-4 ${star <= value ? "fill-current" : "text-slate-300 dark:text-slate-600"}`}
        />
      ))}
    </div>
  );
}
