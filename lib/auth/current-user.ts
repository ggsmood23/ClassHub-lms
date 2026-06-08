import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function getCurrentStudent() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 as const };
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return { error: "User not found", status: 404 as const };
  }

  if (user.accountStatus === "suspended") {
    return { error: "Account suspended", status: 403 as const };
  }

  if (user.role !== "student") {
    return {
      error: "Only logged-in students can perform this action",
      status: 403 as const,
    };
  }

  return { user };
}

export async function getCurrentAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 as const };
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return { error: "User not found", status: 404 as const };
  }

  if (user.accountStatus === "suspended") {
    return { error: "Account suspended", status: 403 as const };
  }

  if (user.role !== "admin") {
    return {
      error: "Only admins can perform this action",
      status: 403 as const,
    };
  }

  return { user };
}
