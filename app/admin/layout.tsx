import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions, roleRedirectPath } from "@/lib/auth/options";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { AdminShell } from "../components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email }).select("role");

  if (!user || user.role !== "admin") {
    redirect(roleRedirectPath(user?.role));
  }

  return <AdminShell>{children}</AdminShell>;
}
