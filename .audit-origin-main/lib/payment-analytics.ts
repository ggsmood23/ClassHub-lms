import Payment from "@/lib/models/Payment";

export type RevenuePerCourse = {
  courseId: string;
  title: string;
  totalRevenue: number;
  totalSales: number;
};

export type EducatorRevenueSummary = {
  totalRevenue: number;
  totalSales: number;
  revenuePerCourse: RevenuePerCourse[];
};

export type RecentPayment = {
  id: string;
  student: string;
  course: string;
  amount: number;
  transactionId: string;
  date: string;
  status: string;
};

export type AdminPaymentSummary = {
  totalRevenue: number;
  totalTransactions: number;
  recentPayments: RecentPayment[];
};

type RevenueAggregateRow = {
  _id: {
    courseId: { toString(): string };
    title?: string;
  };
  totalRevenue?: number;
  totalSales?: number;
};

type RecentPaymentDocument = {
  _id: { toString(): string };
  student?: {
    name?: string;
    email?: string;
  } | null;
  course?: {
    title?: string;
  } | null;
  amount?: number;
  transactionId?: string;
  createdAt?: Date;
  status?: string;
};

export async function getEducatorRevenueSummary(
  teacherId: unknown,
): Promise<EducatorRevenueSummary> {
  const revenuePerCourse = await Payment.aggregate<RevenueAggregateRow>([
    { $match: { status: "success" } },
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    { $match: { "course.teacher": teacherId } },
    {
      $group: {
        _id: {
          courseId: "$course._id",
          title: "$course.title",
        },
        totalRevenue: { $sum: "$amount" },
        totalSales: { $sum: 1 },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  return {
    totalRevenue: revenuePerCourse.reduce(
      (sum, course) => sum + (course.totalRevenue ?? 0),
      0,
    ),
    totalSales: revenuePerCourse.reduce(
      (sum, course) => sum + (course.totalSales ?? 0),
      0,
    ),
    revenuePerCourse: revenuePerCourse.map((course) => ({
      courseId: course._id.courseId.toString(),
      title: course._id.title || "Untitled course",
      totalRevenue: course.totalRevenue ?? 0,
      totalSales: course.totalSales ?? 0,
    })),
  };
}

export async function getAdminPaymentSummary(): Promise<AdminPaymentSummary> {
  const [totals] = await Payment.aggregate<{
    totalRevenue?: number;
    totalTransactions?: number;
  }>([
    { $match: { status: "success" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
        totalTransactions: { $sum: 1 },
      },
    },
  ]);

  const recentPayments = await Payment.find()
    .populate("student", "name email")
    .populate("course", "title")
    .sort({ createdAt: -1 })
    .limit(8)
    .lean<RecentPaymentDocument[]>();

  return {
    totalRevenue: totals?.totalRevenue ?? 0,
    totalTransactions: totals?.totalTransactions ?? 0,
    recentPayments: recentPayments.map((payment) => ({
      id: payment._id.toString(),
      student: payment.student?.name || payment.student?.email || "Unknown student",
      course: payment.course?.title || "Deleted course",
      amount: payment.amount ?? 0,
      transactionId: payment.transactionId || "Unknown",
      date: payment.createdAt?.toISOString() || "",
      status: payment.status || "pending",
    })),
  };
}
