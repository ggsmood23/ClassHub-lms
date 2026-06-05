import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth/current-user";
import Course from "@/lib/models/Course";
import Enrollment from "@/lib/models/Enrollment";
import Payment from "@/lib/models/Payment";
import { createNotification } from "@/lib/notifications";

type SimulatePaymentRequest = {
  courseId?: string;
};

function createTransactionId() {
  return `SIM-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
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

    const body = (await request.json()) as SimulatePaymentRequest;

    if (!body.courseId) {
      return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(body.courseId)) {
      return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
    }

    const course = await Course.findById(body.courseId).select(
      "title price isPaid teacher students",
    );

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (!course.isPaid && course.price <= 0) {
      return NextResponse.json(
        { error: "Free courses do not require payment" },
        { status: 400 },
      );
    }

    if (course.teacher?.toString() === currentStudent.user._id.toString()) {
      return NextResponse.json(
        { error: "Educators cannot purchase their own course" },
        { status: 403 },
      );
    }

    const existingEnrollment = await Enrollment.findOne({
      student: currentStudent.user._id,
      course: course._id,
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Student already enrolled in this course" },
        { status: 409 },
      );
    }

    const existingPayment = await Payment.findOne({
      student: currentStudent.user._id,
      course: course._id,
      status: "success",
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: "Course already purchased" },
        { status: 409 },
      );
    }

    const payment = await Payment.create({
      student: currentStudent.user._id,
      course: course._id,
      amount: course.price,
      status: "success",
      paymentMethod: "simulation",
      transactionId: createTransactionId(),
    });

    const enrollment = await Enrollment.create({
      student: currentStudent.user._id,
      course: course._id,
      progress: 0,
      completedLessons: [],
      completed: false,
    });

    await Promise.all([
      currentStudent.user.updateOne({ $addToSet: { enrolledCourses: course._id } }),
      Course.findByIdAndUpdate(
        course._id,
        { $addToSet: { students: currentStudent.user._id } },
        { new: true },
      ),
    ]);

    if (course.teacher) {
      await createNotification({
        user: course.teacher,
        title: "Enrollment received",
        message: `${currentStudent.user.name} purchased ${course.title}.`,
        type: "enrollment_received",
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment simulated successfully",
        payment: {
          _id: payment._id.toString(),
          transactionId: payment.transactionId,
          amount: payment.amount,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
        },
        enrollment: {
          _id: enrollment._id.toString(),
          course: course._id.toString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Payment simulation error:", error);
    return NextResponse.json(
      { error: "Failed to simulate payment" },
      { status: 500 },
    );
  }
}
