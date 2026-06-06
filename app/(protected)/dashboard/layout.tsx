import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/lib/auth/current-user";
import { getUserNotifications } from "@/lib/notifications";
import { ProtectedShell } from "../../components/protected-shell";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const currentStudent = await getCurrentStudent();

  if ("error" in currentStudent) {
    redirect(currentStudent.status === 401 ? "/login" : "/");
  }

  const notifications = await getUserNotifications(currentStudent.user._id);

  return (
    <ProtectedShell
      notifications={notifications.map((notification) => ({
        id: notification._id.toString(),
        title: notification.title,
        message: notification.message,
        read: Boolean(notification.read),
      }))}
    >
      {children}
    </ProtectedShell>
  );
}
