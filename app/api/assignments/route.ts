import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import connectDB from "@/lib/db";
import Assignment from "@/lib/models/Assignment";
import Course from "@/lib/models/Course";
import Enrollment from "@/lib/models/Enrollment";
import User from "@/lib/models/User";
import { toJsonSafe } from "@/lib/serialization";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const user = await User.findOne({ email: session.user.email }).select("role");

  if (!user) {
    return { error: "User not found", status: 404 as const };
  }

  return { user };
}

export async function GET() {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();

    if ("error" in currentUser) {
      return NextResponse.json(
        { success: false, message: currentUser.error },
        { status: currentUser.status },
      );
    }

    let courseIds: unknown[] | undefined;

    if (currentUser.user.role === "teacher") {
      const courses = await Course.find({ teacher: currentUser.user._id })
        .select("_id")
        .lean();
      courseIds = courses.map((course) => course._id);
    } else if (currentUser.user.role === "student") {
      const enrollments = await Enrollment.find({ student: currentUser.user._id })
        .select("course")
        .lean();
      courseIds = enrollments.map((enrollment) => enrollment.course);
    } else if (currentUser.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const assignments = await Assignment.find(
      courseIds ? { course: { $in: courseIds } } : {},
    )
      .populate("course", "title teacher")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      assignments: toJsonSafe(assignments),
    });
  } catch (error) {
    console.error("Fetch assignments error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch assignments" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();

    if ("error" in currentUser) {
      return NextResponse.json(
        { success: false, message: currentUser.error },
        { status: currentUser.status },
      );
    }

    if (currentUser.user.role !== "teacher" && currentUser.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only educators can create assignments" },
        { status: 403 },
      );
    }

    const body: unknown = await request.json();

    if (!isRecord(body)) {
      return NextResponse.json(
        { success: false, message: "Request body must be a JSON object" },
        { status: 400 },
      );
    }

    const courseId = typeof body.courseId === "string" ? body.courseId : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const instructions =
      typeof body.instructions === "string" ? body.instructions.trim() : "";
    const status =
      typeof body.status === "string" &&
      ["Draft", "Open", "Grading", "Closed"].includes(body.status)
        ? body.status
        : "Draft";
    const dueDate =
      typeof body.dueDate === "string" && body.dueDate
        ? new Date(body.dueDate)
        : undefined;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { success: false, message: "Invalid course id" },
        { status: 400 },
      );
    }

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Assignment title is required" },
        { status: 400 },
      );
    }

    if (dueDate && Number.isNaN(dueDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid due date" },
        { status: 400 },
      );
    }

    const courseQuery =
      currentUser.user.role === "admin"
        ? { _id: courseId }
        : { _id: courseId, teacher: currentUser.user._id };
    const course = await Course.findOne(courseQuery).select("_id");

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 },
      );
    }

    const assignment = await Assignment.create({
      course: course._id,
      title,
      instructions,
      dueDate,
      status,
    });

    return NextResponse.json(
      { success: true, assignment: toJsonSafe(assignment) },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create assignment error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create assignment" },
      { status: 500 },
    );
  }
}
