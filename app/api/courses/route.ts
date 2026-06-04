import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import connectDB from "@/lib/db";
import Course from "@/lib/models/Course";
import User from "@/lib/models/User";

export const runtime = "nodejs";

type LessonInput = {
  title?: string;
  videoUrl?: string;
  duration?: string;
};

type CourseInput = {
  title?: string;
  description?: string;
  thumbnail?: string;
  thumbnailPublicId?: string;
  price?: number;
  isPaid?: boolean;
  category?: string;
  level?: "Beginner" | "Intermediate" | "Advanced";
  teacher?: string;
  lessons?: LessonInput[];
  students?: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildCoursePayload(input: CourseInput) {
  const price = Number(input.price || 0);

  return {
    title: input.title,
    description: input.description,
    thumbnail: input.thumbnail,
    thumbnailPublicId: input.thumbnailPublicId,
    price,
    isPaid: input.isPaid ?? price > 0,
    category: input.category,
    level: input.level,
    teacher: input.teacher,
    lessons: input.lessons,
    students: input.students,
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

async function getCourseManager() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const user = await User.findOne({ email: session.user.email }).select("role");

  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return { error: "Only educators can manage courses", status: 403 as const };
  }

  return { user };
}

export async function GET() {
  try {
    await connectDB();

    const courses = await Course.find()
      .populate("teacher", "name email image role")
      .populate("students", "name email image role")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      courses,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch courses",
        error: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const manager = await getCourseManager();

    if ("error" in manager) {
      return NextResponse.json(
        {
          success: false,
          message: manager.error,
        },
        { status: manager.status },
      );
    }

    const body: unknown = await request.json();

    if (!isRecord(body)) {
      return NextResponse.json(
        {
          success: false,
          message: "Request body must be a JSON object",
        },
        { status: 400 },
      );
    }

    const payload = buildCoursePayload(body as CourseInput);

    if (!payload.title?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Course title is required",
        },
        { status: 400 },
      );
    }

    if (!Number.isFinite(payload.price) || payload.price < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Course price must be zero or greater",
        },
        { status: 400 },
      );
    }

    const course = await Course.create({
      ...payload,
      teacher: manager.user._id,
    });

    return NextResponse.json(
      {
        success: true,
        course,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create course",
        error: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
