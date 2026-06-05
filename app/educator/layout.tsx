import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions, normalizeRole, roleRedirectPath } from "@/lib/auth/options";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { getUserNotifications } from "@/lib/notifications";
import { EducatorShell } from "../components/educator/educator-shell";

export default async function EducatorLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email }).select(
    "name email image role",
  );

  if (!user || normalizeRole(user.role) !== "teacher") {
    redirect(roleRedirectPath(user?.role));
  }

  const notifications = await getUserNotifications(user._id);

  return (
    <EducatorShell
      notifications={notifications.map((notification) => ({
        id: notification._id.toString(),
        title: notification.title,
        message: notification.message,
        read: Boolean(notification.read),
      }))}
      user={{
        name: user.name || session.user.name || "Class Hub educator",
        email: user.email || session.user.email,
        image: user.image || session.user.image || null,
      }}
    >
      {children}
    </EducatorShell>
  );
}
