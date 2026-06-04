import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Enrollment from "@/lib/models/Enrollment";
import Certificate from "@/lib/models/Certificate";
import Payment from "@/lib/models/Payment";
import Review from "@/lib/models/Review";
import { StudentDashboard } from "../../components/dashboard/student-dashboard";

export const metadata: Metadata = {
  title: "Dashboard | Class Hub",
  description: "Protected Class Hub learner dashboard.",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  await connectDB();

  // Find user by email
  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    notFound();
  }

  // Only students can access this page
  if (user.role !== "student") {
    redirect("/");
  }

  // Get all enrollments for this student with course details
  const enrollments = await Enrollment.find({ student: user._id })
    .populate({
      path: "course",
      select: "title description price category level lessons thumbnail teacher",
      populate: {
        path: "teacher",
        select: "name email",
      },
    })
    .sort({ createdAt: -1 });

  const certificates = await Certificate.find({ student: user._id })
    .select("studentName courseName completionDate")
    .sort({ completionDate: -1 });

  const payments = await Payment.find({ student: user._id })
    .populate("course", "title")
    .sort({ createdAt: -1 });
  const reviewStats = await Review.aggregate<{
    _id: { toString(): string };
    averageRating?: number;
    totalReviews?: number;
  }>([
    {
      $group: {
        _id: "$course",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);
  const reviewStatsByCourseId = new Map(
    reviewStats.map((stat) => [
      stat._id.toString(),
      {
        averageRating: stat.averageRating ? Number(stat.averageRating.toFixed(1)) : 0,
        totalReviews: stat.totalReviews ?? 0,
      },
    ]),
  );

  return (
    <StudentDashboard
      user={{
        name: user.name || "",
        email: user.email,
        image: user.image || "",
      }}
      certificates={certificates.map((certificate) => ({
        _id: certificate._id.toString(),
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        completionDate: certificate.completionDate.toISOString(),
      }))}
      payments={payments.map((payment) => {
        const course = payment.course as {
          title?: string;
        } | null;

        return {
          _id: payment._id.toString(),
          courseTitle: course?.title || "Deleted course",
          amount: payment.amount || 0,
          transactionId: payment.transactionId,
          status: payment.status,
          createdAt: payment.createdAt?.toISOString() || "",
        };
      })}
      enrollments={enrollments.map((enrollment) => {
        const course = enrollment.course as {
          _id: { toString(): string };
          title: string;
          description: string;
          price: number;
          category: string;
          level: string;
          thumbnail: string;
          lessons: Array<{ _id: string; title: string; duration: string; videoUrl: string }>;
          teacher: {
            _id: string;
            name: string;
            email: string;
          };
        };
        const stats = reviewStatsByCourseId.get(course._id.toString());

        return {
          _id: enrollment._id.toString(),
          student: {
            _id: enrollment.student.toString(),
          },
          course: {
            _id: course._id.toString(),
            title: course.title || "",
            description: course.description || "",
            price: course.price || 0,
            category: course.category || "",
            level: course.level || "",
            thumbnail: course.thumbnail || "",
            lessonsCount: (course.lessons || []).length,
            teacher: {
              name: (course.teacher?.name) || "",
              email: (course.teacher?.email) || "",
            },
            averageRating: stats?.averageRating ?? 0,
            totalReviews: stats?.totalReviews ?? 0,
          },
          progress: enrollment.progress,
          completedLessons: enrollment.completedLessons,
          completed: enrollment.completed,
          createdAt: enrollment.createdAt?.toISOString() || "",
        };
      })}
    />
  );
}
