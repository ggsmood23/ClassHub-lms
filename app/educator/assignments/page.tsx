import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { AssignmentsPage } from "../../components/educator/educator-management";
import { authOptions } from "@/lib/auth/options";
import connectDB from "@/lib/db";
import Assignment from "@/lib/models/Assignment";
import Course from "@/lib/models/Course";
import User from "@/lib/models/User";

export const metadata: Metadata = {
  title: "Assignments | Class Hub Educator",
};

type AssignmentDocument = {
  _id: { toString(): string };
  title?: string;
  dueDate?: Date;
  status?: string;
  course?: {
    _id?: { toString(): string };
    title?: string;
  };
};

type CourseDocument = {
  _id: { toString(): string };
  title?: string;
};

function formatDate(value?: Date) {
  return value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(value)
    : "No due date";
}

export default async function Page() {
  const session = await getServerSession(authOptions);

  await connectDB();

  const user = session?.user?.email
    ? await User.findOne({ email: session.user.email }).select("_id role")
    : null;
  const courseQuery = user?.role === "admin" ? {} : { teacher: user?._id };
  const courses = user
    ? await Course.find(courseQuery)
        .select("_id title")
        .sort({ createdAt: -1 })
        .lean<CourseDocument[]>()
    : [];
  const assignments = courses.length
    ? await Assignment.find({ course: { $in: courses.map((course) => course._id) } })
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .lean<AssignmentDocument[]>()
    : [];

  return (
    <AssignmentsPage
      assignments={assignments.map((assignment) => ({
        id: assignment._id.toString(),
        title: assignment.title || "Untitled assignment",
        course: assignment.course?.title || "Deleted course",
        dueDate: formatDate(assignment.dueDate),
        submissions: "0 submitted",
        status: assignment.status || "Draft",
      }))}
      courses={courses.map((course) => ({
        id: course._id.toString(),
        title: course.title || "Untitled course",
      }))}
    />
  );
}
