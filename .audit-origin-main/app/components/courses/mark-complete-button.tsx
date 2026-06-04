"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function MarkCompleteButton({ courseId, lessonId }: { courseId: string; lessonId: string; }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { status } = useSession();

  async function handleMark() {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/enrollments/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, lessonId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to mark complete");
      }

      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleMark}
        disabled={loading || status === "loading"}
        className="mt-4 inline-flex items-center rounded bg-green-600 px-3 py-1 text-white disabled:opacity-50"
      >
        {loading ? "Marking..." : "Mark Lesson Complete"}
      </button>
      {error ? <p className="text-red-600 mt-2">{error}</p> : null}
    </div>
  );
}
