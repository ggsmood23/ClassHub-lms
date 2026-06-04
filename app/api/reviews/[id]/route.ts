import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth/current-user";
import Review from "@/lib/models/Review";
import { toJsonSafe } from "@/lib/serialization";

type ReviewRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ReviewInput = {
  rating?: number;
  review?: string;
};

function validateReviewInput(input: ReviewInput) {
  const rating = Number(input.rating);
  const review = input.review?.trim() ?? "";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Rating must be a whole number between 1 and 5" };
  }

  if (review.length < 3) {
    return { error: "Review must be at least 3 characters" };
  }

  if (review.length > 1200) {
    return { error: "Review must be 1200 characters or fewer" };
  }

  return { rating, review };
}

export async function PUT(request: NextRequest, context: ReviewRouteContext) {
  try {
    const currentStudent = await getCurrentStudent();

    if ("error" in currentStudent) {
      return NextResponse.json(
        { error: currentStudent.error },
        { status: currentStudent.status },
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid review id" }, { status: 400 });
    }

    const input = (await request.json()) as ReviewInput;
    const validation = validateReviewInput(input);

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const review = await Review.findOneAndUpdate(
      { _id: id, student: currentStudent.user._id },
      { rating: validation.rating, review: validation.review },
      { new: true, runValidators: true },
    ).populate("student", "name email image");

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, review: toJsonSafe(review) });
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, context: ReviewRouteContext) {
  try {
    const currentStudent = await getCurrentStudent();

    if ("error" in currentStudent) {
      return NextResponse.json(
        { error: currentStudent.error },
        { status: currentStudent.status },
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid review id" }, { status: 400 });
    }

    const review = await Review.findOneAndDelete({
      _id: id,
      student: currentStudent.user._id,
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
