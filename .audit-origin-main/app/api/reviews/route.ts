import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth/current-user";
import Course from "@/lib/models/Course";
import Enrollment from "@/lib/models/Enrollment";
import Review from "@/lib/models/Review";

type ReviewInput = {
  courseId?: string;
  rating?: number;
  review?: string;
};

function validateReviewInput(input: ReviewInput) {
  const rating = Number(input.rating);
  const review = input.review?.trim() ?? "";

  if (!input.courseId) {
    return { error: "Missing courseId" };
  }

  if (!mongoose.Types.ObjectId.isValid(input.courseId)) {
    return { error: "Invalid courseId" };
  }

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

export async function POST(request: NextRequest) {
  try {
    const currentStudent = await getCurrentStudent();

    if ("error" in currentStudent) {
      return NextResponse.json(
        { error: currentStudent.error },
        { status: currentStudent.status },
      );
    }

    const input = (await request.json()) as ReviewInput;
    const validation = validateReviewInput(input);

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const course = await Course.findById(input.courseId).select("_id");

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const enrollment = await Enrollment.findOne({
      student: currentStudent.user._id,
      course: course._id,
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Only enrolled students can review this course" },
        { status: 403 },
      );
    }

    const existingReview = await Review.findOne({
      student: currentStudent.user._id,
      course: course._id,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this course" },
        { status: 409 },
      );
    }

    const createdReview = await Review.create({
      student: currentStudent.user._id,
      course: course._id,
      rating: validation.rating,
      review: validation.review,
    });

    const populatedReview = await Review.findById(createdReview._id).populate(
      "student",
      "name email image",
    );

    return NextResponse.json({ success: true, review: populatedReview }, { status: 201 });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
