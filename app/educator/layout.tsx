import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { EducatorShell } from "../components/educator/educator-shell";

export default async function EducatorLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email }).select("role");

  if (!user || user.role !== "teacher") {
    redirect("/dashboard");
  }

  return <EducatorShell>{children}</EducatorShell>;
}
