import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import {
  deleteCourseThumbnail,
  getCourseThumbnailPublicId,
  uploadCourseThumbnail,
  validateCourseThumbnail,
} from "@/lib/course-thumbnails";
import connectDB from "@/lib/db";
import Course from "@/lib/models/Course";
import User from "@/lib/models/User";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: RouteContext<"/api/courses/[id]/thumbnail">,
) {
  let newPublicId: string | undefined;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const educator = await User.findOne({ email: session.user.email }).select(
      "role",
    );

    if (!educator || (educator.role !== "teacher" && educator.role !== "admin")) {
      return NextResponse.json(
        { error: "Only educators can replace course thumbnails" },
        { status: 403 },
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid course id" }, { status: 400 });
    }

    const course = await Course.findById(id);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (
      educator.role !== "admin" &&
      course.teacher?.toString() !== educator._id.toString()
    ) {
      return NextResponse.json(
        { error: "Only the course educator can replace this thumbnail" },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Select an image to upload" },
        { status: 400 },
      );
    }

    const validationError = validateCourseThumbnail(image);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const previousPublicId =
      course.thumbnailPublicId || getCourseThumbnailPublicId(course.thumbnail);
    const uploaded = await uploadCourseThumbnail(image);
    newPublicId = uploaded.publicId;

    course.thumbnail = uploaded.url;
    course.thumbnailPublicId = uploaded.publicId;
    await course.save();

    if (previousPublicId && previousPublicId !== uploaded.publicId) {
      try {
        await deleteCourseThumbnail(previousPublicId);
      } catch (deleteError) {
        console.error("Old course thumbnail cleanup error:", deleteError);
      }
    }

    return NextResponse.json({
      success: true,
      thumbnail: course.thumbnail,
      thumbnailPublicId: course.thumbnailPublicId,
    });
  } catch (error) {
    if (newPublicId) {
      try {
        await deleteCourseThumbnail(newPublicId);
      } catch (deleteError) {
        console.error("New course thumbnail cleanup error:", deleteError);
      }
    }

    console.error("Replace course thumbnail error:", error);
    return NextResponse.json(
      { error: "Failed to replace course thumbnail" },
      { status: 500 },
    );
  }
}
