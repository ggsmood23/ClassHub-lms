import "server-only";

import Notification from "@/lib/models/Notification";

type NotificationInput = {
  user: unknown;
  title: string;
  message: string;
  type:
    | "course_created"
    | "course_updated"
    | "enrollment_received"
    | "course_completed";
};

export async function createNotification(input: NotificationInput) {
  await Notification.create(input);
}

export async function getUserNotifications(userId: unknown, limit = 8) {
  return Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}
