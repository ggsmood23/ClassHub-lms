import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth/current-user";
import Course from "@/lib/models/Course";
import Enrollment from "@/lib/models/Enrollment";
import { createNotification } from "@/lib/notifications";
import { toJsonSafe } from "@/lib/serialization";

export async function POST(request: NextRequest) {
  try {
    const currentStudent = await getCurrentStudent();

    if ("error" in currentStudent) {
      return NextResponse.json(
        { error: currentStudent.error },
        { status: currentStudent.status },
      );
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.isPaid || course.price > 0) {
      return NextResponse.json(
        { error: "Paid courses must be purchased before enrollment" },
        { status: 402 },
      );
    }

    const existingEnrollment = await Enrollment.findOne({
      student: currentStudent.user._id,
      course: courseId,
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Student already enrolled in this course" },
        { status: 409 },
      );
    }

    const enrollment = await Enrollment.create({
      student: currentStudent.user._id,
      course: courseId,
      progress: 0,
      completedLessons: [],
      completed: false,
    });

    await currentStudent.user.updateOne({ $addToSet: { enrolledCourses: courseId } });
    await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { students: currentStudent.user._id } },
      { new: true },
    );

    if (course.teacher) {
      await createNotification({
        user: course.teacher,
        title: "Enrollment received",
        message: `${currentStudent.user.name} enrolled in ${course.title}.`,
        type: "enrollment_received",
      });
    }

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate("student", "name email image role")
      .populate("course", "title description price category level");

    return NextResponse.json(toJsonSafe(populatedEnrollment), { status: 201 });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Failed to create enrollment" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentStudent = await getCurrentStudent();

    if ("error" in currentStudent) {
      return NextResponse.json(
        { error: currentStudent.error },
        { status: currentStudent.status },
      );
    }

    const courseId = request.nextUrl.searchParams.get("courseId");

    if (courseId && !mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
    }

    const query = courseId
      ? { student: currentStudent.user._id, course: courseId }
      : { student: currentStudent.user._id };

    const enrollments = await Enrollment.find(query)
      .populate("student", "name email image role")
      .populate("course", "title description price category level teacher")
      .sort({ createdAt: -1 });

    return NextResponse.json(toJsonSafe(enrollments), { status: 200 });
  } catch (error) {
    console.error("Fetch enrollments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 },
    );
  }
}
