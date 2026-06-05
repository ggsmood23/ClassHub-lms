import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { ReviewsPage } from "../../components/educator/educator-management";
import { authOptions } from "@/lib/auth/options";
import connectDB from "@/lib/db";
import Course from "@/lib/models/Course";
import Review from "@/lib/models/Review";
import User from "@/lib/models/User";

export const metadata: Metadata = {
  title: "Reviews | Class Hub Educator",
};

type ReviewDocument = {
  _id: { toString(): string };
  rating?: number;
  review?: string;
  course?: {
    title?: string;
  } | null;
};

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
  const reviews = courses.length
    ? await Review.find({ course: { $in: courses.map((course) => course._id) } })
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .lean<ReviewDocument[]>()
    : [];

  return (
    <ReviewsPage
      reviews={reviews.map((review) => ({
        id: review._id.toString(),
        course: review.course?.title || "Deleted course",
        rating: (review.rating ?? 0).toFixed(1),
        text: review.review || "",
      }))}
    />
  );
}
