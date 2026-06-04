import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import {
  uploadCourseThumbnail,
  validateCourseThumbnail,
} from "@/lib/course-thumbnails";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const educator = await User.findOne({ email: session.user.email }).select(
      "role",
    );

    if (!educator || educator.role !== "teacher") {
      return NextResponse.json(
        { error: "Only educators can upload course thumbnails" },
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

    const result = await uploadCourseThumbnail(image);

    return NextResponse.json(
      {
        url: result.url,
        publicId: result.publicId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Course thumbnail upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload course thumbnail" },
      { status: 500 },
    );
  }
}
