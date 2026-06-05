import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { StudentAssignmentsPage } from "../../../components/dashboard/student-pages";
import { authOptions } from "@/lib/auth/options";
import connectDB from "@/lib/db";
import Assignment from "@/lib/models/Assignment";
import Enrollment from "@/lib/models/Enrollment";
import User from "@/lib/models/User";

export const metadata: Metadata = {
  title: "Assignments | Class Hub",
};

type EnrollmentDocument = {
  course?: unknown;
};

type AssignmentDocument = {
  _id: { toString(): string };
  title?: string;
  dueDate?: Date;
  status?: string;
  course?: {
    title?: string;
  };
};

function formatDate(value?: Date) {
  return value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(value)
    : "No due date";
}

export default async function AssignmentsPage() {
  const session = await getServerSession(authOptions);

  await connectDB();

  const user = session?.user?.email
    ? await User.findOne({ email: session.user.email }).select("_id")
    : null;
  const enrollments = user
    ? await Enrollment.find({ student: user._id })
        .select("course")
        .lean<EnrollmentDocument[]>()
    : [];
  const courseIds = enrollments.map((enrollment) => enrollment.course).filter(Boolean);
  const assignments = courseIds.length
    ? await Assignment.find({ course: { $in: courseIds } })
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .lean<AssignmentDocument[]>()
    : [];

  return (
    <StudentAssignmentsPage
      assignments={assignments.map((assignment) => ({
        id: assignment._id.toString(),
        title: assignment.title || "Untitled assignment",
        course: assignment.course?.title || "Deleted course",
        due: formatDate(assignment.dueDate),
        status: assignment.status || "Draft",
      }))}
    />
  );
}
