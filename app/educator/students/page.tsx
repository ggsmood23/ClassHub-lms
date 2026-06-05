import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { StudentsPage } from "../../components/educator/educator-management";
import { authOptions } from "@/lib/auth/options";
import connectDB from "@/lib/db";
import Course from "@/lib/models/Course";
import Enrollment from "@/lib/models/Enrollment";
import User from "@/lib/models/User";

export const metadata: Metadata = {
  title: "Students | Class Hub Educator",
};

type EnrollmentDocument = {
  _id: { toString(): string };
  progress?: number;
  completed?: boolean;
  updatedAt?: Date;
  student?: {
    name?: string;
    email?: string;
  } | null;
  course?: {
    title?: string;
  } | null;
};

function formatDate(value?: Date) {
  return value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(value)
    : "Recent";
}

export default async function Page() {
  const session = await getServerSession(authOptions);

  await connectDB();

  const user = session?.user?.email
    ? await User.findOne({ email: session.user.email }).select("_id role")
    : null;
  const courses = user
    ? await Course.find(user.role === "admin" ? {} : { teacher: user._id })
        .select("_id")
        .lean()
    : [];
  const enrollments = courses.length
    ? await Enrollment.find({ course: { $in: courses.map((course) => course._id) } })
        .populate("student", "name email")
        .populate("course", "title")
        .sort({ updatedAt: -1 })
        .lean<EnrollmentDocument[]>()
    : [];

  return (
    <StudentsPage
      students={enrollments.map((enrollment) => ({
        name: enrollment.student?.name || enrollment.student?.email || "Unknown learner",
        course: enrollment.course?.title || "Deleted course",
        progress: `${enrollment.progress ?? 0}%`,
        status: enrollment.completed ? "Completed" : "Active",
        lastActive: formatDate(enrollment.updatedAt),
      }))}
    />
  );
}
