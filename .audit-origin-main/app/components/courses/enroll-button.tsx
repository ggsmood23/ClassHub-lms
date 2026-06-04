"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";

type EnrollButtonProps = {
  courseId: string;
  alreadyEnrolled?: boolean;
  isPaid?: boolean;
  price?: number;
};

export function EnrollButton({
  courseId,
  alreadyEnrolled = false,
  isPaid = false,
  price = 0,
}: EnrollButtonProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCourseAction = async () => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (!session?.user) return;

    try {
      setIsLoading(true);
      setError("");

      const endpoint = isPaid ? "/api/payments/simulate" : "/api/enrollments";
      const enrollResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
        }),
      });

      const enrollData = await enrollResponse.json();

      if (!enrollResponse.ok) {
        throw new Error(
          enrollData.error || (isPaid ? "Payment simulation failed" : "Failed to enroll in course")
        );
      }

      if (isPaid) {
        setError("Payment successful. Redirecting to your dashboard...");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (enrollError) {
      setError(
        enrollError instanceof Error
          ? enrollError.message
          : isPaid
            ? "Payment simulation failed"
            : "Enrollment failed"
      );
      console.error("Enrollment error:", enrollError);
    } finally {
      setIsLoading(false);
    }
  };

  if (alreadyEnrolled) {
    return (
      <button
        disabled
        className="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-6 py-3 text-sm font-black text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
      >
        Already enrolled
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {isPaid ? (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700 dark:bg-slate-950/80 dark:text-white">
          Course Price: ${price.toLocaleString()}
        </div>
      ) : null}
      <button
        onClick={handleCourseAction}
        disabled={isLoading || status === "loading"}
        className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-cyan-700 disabled:opacity-50 disabled:hover:translate-y-0 dark:bg-cyan-500 dark:hover:bg-cyan-600"
      >
        <Play className="size-4" />
        {isLoading ? (isPaid ? "Processing..." : "Enrolling...") : isPaid ? "Buy Now" : "Enroll Now"}
      </button>
      {error && (
        <p className={`text-sm font-semibold ${error.startsWith("Payment successful") ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
          {error}
        </p>
      )}
    </div>
  );
}
