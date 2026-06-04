import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth/current-user";
import Course from "@/lib/models/Course";
import Enrollment from "@/lib/models/Enrollment";
import Certificate from "@/lib/models/Certificate";
import { toJsonSafe } from "@/lib/serialization";

type CourseLesson = {
  _id?: {
    toString(): string;
  };
};

export async function POST(request: NextRequest) {
  try {
    const currentStudent = await getCurrentStudent();

    if ("error" in currentStudent) {
      return NextResponse.json(
        { error: currentStudent.error },
        { status: currentStudent.status },
      );
    }

    const { courseId, lessonId } = await request.json();

    if (!courseId || !lessonId) {
      return NextResponse.json(
        { error: "Missing courseId or lessonId" },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
    }

    const course = await Course.findById(courseId);
    const lessons = (course?.lessons || []) as CourseLesson[];
    const lessonExists = lessons.some(
      (lesson) => lesson._id?.toString() === lessonId,
    );

    if (!course || !lessonExists) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const enrollment = await Enrollment.findOne({
      student: currentStudent.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Only enrolled students can mark lessons complete" },
        { status: 403 },
      );
    }

    await Enrollment.updateOne(
      { _id: enrollment._id },
      { $addToSet: { completedLessons: lessonId } },
    );

    const updated = await Enrollment.findById(enrollment._id);
    const totalLessons = lessons.length;
    const completedCount = (updated?.completedLessons || []).length;
    const progress =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const completed = totalLessons > 0 ? completedCount >= totalLessons : false;

    const completedEnrollment = await Enrollment.findByIdAndUpdate(
      updated?._id,
      { progress, completed },
      { new: true },
    )
      .populate("student", "name email image")
      .populate("course", "title");

    if (completed) {
      await Certificate.findOneAndUpdate(
        {
          student: currentStudent.user._id,
          course: course._id,
        },
        {
          $setOnInsert: {
            student: currentStudent.user._id,
            course: course._id,
            studentName: currentStudent.user.name,
            courseName: course.title,
            completionDate: new Date(),
          },
        },
        { upsert: true, new: true },
      );
    }

    return NextResponse.json(toJsonSafe(completedEnrollment), { status: 200 });
  } catch (error) {
    console.error("Mark complete error:", error);
    return NextResponse.json(
      { error: "Failed to mark lesson complete" },
      { status: 500 },
    );
  }
}
