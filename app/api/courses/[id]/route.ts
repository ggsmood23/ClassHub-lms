import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import {
  deleteCourseThumbnail,
  getCourseThumbnailPublicId,
} from "@/lib/course-thumbnails";
import connectDB from "@/lib/db";
import Certificate from "@/lib/models/Certificate";
import Course from "@/lib/models/Course";
import Enrollment from "@/lib/models/Enrollment";
import Review from "@/lib/models/Review";
import User from "@/lib/models/User";

export const runtime = "nodejs";

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
  lessons?: Array<{
    title?: string;
    videoUrl?: string;
    duration?: string;
  }>;
  students?: string[];
};

type CourseUpdatePayload = Partial<Omit<CourseInput, "price">> & {
  price?: number;
};

type CourseRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildCoursePayload(input: CourseInput): CourseUpdatePayload {
  const price = input.price === undefined ? undefined : Number(input.price || 0);

  const payload = {
    title: input.title,
    description: input.description,
    thumbnail: input.thumbnail,
    thumbnailPublicId: input.thumbnailPublicId,
    price,
    isPaid: input.isPaid ?? (price === undefined ? undefined : price > 0),
    category: input.category,
    level: input.level,
    teacher: input.teacher,
    lessons: input.lessons,
    students: input.students,
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as CourseUpdatePayload;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

function invalidCourseIdResponse() {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid course id",
    },
    { status: 400 },
  );
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

export async function PUT(request: Request, context: CourseRouteContext) {
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

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return invalidCourseIdResponse();
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
    delete payload.teacher;

    if (payload.title !== undefined && !payload.title.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Course title cannot be empty",
        },
        { status: 400 },
      );
    }

    const courseQuery =
      manager.user.role === "admin"
        ? { _id: id }
        : { _id: id, teacher: manager.user._id };
    if (payload.price !== undefined && (!Number.isFinite(payload.price) || payload.price < 0)) {
      return NextResponse.json(
        {
          success: false,
          message: "Course price must be zero or greater",
        },
        { status: 400 },
      );
    }

    const course = await Course.findOneAndUpdate(courseQuery, payload, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      course,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update course",
        error: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: CourseRouteContext) {
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

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return invalidCourseIdResponse();
    }

    const courseQuery =
      manager.user.role === "admin"
        ? { _id: id }
        : { _id: id, teacher: manager.user._id };
    const course = await Course.findOneAndDelete(courseQuery);

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found",
        },
        { status: 404 },
      );
    }

    await Promise.all([
      Enrollment.deleteMany({ course: course._id }),
      Certificate.deleteMany({ course: course._id }),
      Review.deleteMany({ course: course._id }),
      User.updateMany(
        { enrolledCourses: course._id },
        { $pull: { enrolledCourses: course._id } },
      ),
    ]);

    const thumbnailPublicId =
      course.thumbnailPublicId || getCourseThumbnailPublicId(course.thumbnail);

    if (thumbnailPublicId) {
      try {
        await deleteCourseThumbnail(thumbnailPublicId);
      } catch (deleteError) {
        console.error("Deleted course thumbnail cleanup error:", deleteError);
      }
    }

    return NextResponse.json({
      success: true,
      course,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete course",
        error: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
