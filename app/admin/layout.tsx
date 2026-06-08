import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions, roleRedirectPath } from "@/lib/auth/options";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { getUserNotifications } from "@/lib/notifications";
import { AdminShell } from "../components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email }).select("name email role accountStatus");

  if (user?.accountStatus === "suspended") {
    redirect("/");
  }

  if (!user || user.role !== "admin") {
    redirect(roleRedirectPath(user?.role));
  }

  const notifications = await getUserNotifications(user._id);

  return (
    <AdminShell
      notifications={notifications.map((notification) => ({
        id: notification._id.toString(),
        title: notification.title,
        message: notification.message,
        read: Boolean(notification.read),
      }))}
      user={{
        name: user.name || session.user.name || "Class Hub admin",
        email: user.email || session.user.email,
      }}
    >
      {children}
    </AdminShell>
  );
}
