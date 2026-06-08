import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/current-user";
import {
  deleteCourseThumbnail,
  getCourseThumbnailPublicId,
} from "@/lib/course-thumbnails";
import Assignment from "@/lib/models/Assignment";
import Certificate from "@/lib/models/Certificate";
import Course from "@/lib/models/Course";
import Enrollment from "@/lib/models/Enrollment";
import Payment from "@/lib/models/Payment";
import Review from "@/lib/models/Review";
import User from "@/lib/models/User";
import { createNotification } from "@/lib/notifications";
import { toJsonSafe } from "@/lib/serialization";

export const runtime = "nodejs";

type CourseRouteContext = {
  params: Promise<{ id: string }>;
};

type CoursePatchBody = {
  title?: unknown;
  status?: unknown;
};

const statuses = ["Draft", "Review", "Published", "Unpublished", "Rejected"] as const;

function isStatus(value: unknown): value is (typeof statuses)[number] {
  return typeof value === "string" && statuses.includes(value as (typeof statuses)[number]);
}

function invalidCourseIdResponse() {
  return NextResponse.json(
    { success: false, message: "Invalid course id" },
    { status: 400 },
  );
}

export async function PATCH(request: Request, context: CourseRouteContext) {
  try {
    const currentAdmin = await getCurrentAdmin();

    if ("error" in currentAdmin) {
      return NextResponse.json(
        { success: false, message: currentAdmin.error },
        { status: currentAdmin.status },
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return invalidCourseIdResponse();
    }

    const body = (await request.json()) as CoursePatchBody;
    const payload: { title?: string; status?: (typeof statuses)[number] } = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json(
          { success: false, message: "Course title cannot be empty" },
          { status: 400 },
        );
      }

      payload.title = body.title.trim();
    }

    if (body.status !== undefined) {
      if (!isStatus(body.status)) {
        return NextResponse.json(
          { success: false, message: "Invalid course status" },
          { status: 400 },
        );
      }

      payload.status = body.status;
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json(
        { success: false, message: "No course changes provided" },
        { status: 400 },
      );
    }

    const course = await Course.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 },
      );
    }

    if (course.teacher) {
      await createNotification({
        user: course.teacher,
        title: "Course updated by admin",
        message: `${course.title} was updated by an admin.`,
        type: "course_updated",
      });
    }

    return NextResponse.json({ success: true, course: toJsonSafe(course) });
  } catch (error) {
    console.error("Admin update course error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update course" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: CourseRouteContext) {
  try {
    const currentAdmin = await getCurrentAdmin();

    if ("error" in currentAdmin) {
      return NextResponse.json(
        { success: false, message: currentAdmin.error },
        { status: currentAdmin.status },
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return invalidCourseIdResponse();
    }

    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 },
      );
    }

    await Promise.all([
      Enrollment.deleteMany({ course: course._id }),
      Assignment.deleteMany({ course: course._id }),
      Certificate.deleteMany({ course: course._id }),
      Payment.deleteMany({ course: course._id }),
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
        console.error("Admin deleted course thumbnail cleanup error:", deleteError);
      }
    }

    return NextResponse.json({ success: true, course: toJsonSafe(course) });
  } catch (error) {
    console.error("Admin delete course error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete course" },
      { status: 500 },
    );
  }
}
