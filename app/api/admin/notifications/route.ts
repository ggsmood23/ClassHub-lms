import { NextResponse } from "next/server";
import { getAdminNotifications } from "@/lib/admin";
import { getCurrentAdmin } from "@/lib/auth/current-user";
import Notification from "@/lib/models/Notification";
import User from "@/lib/models/User";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET() {
  try {
    const currentAdmin = await getCurrentAdmin();

    if ("error" in currentAdmin) {
      return NextResponse.json(
        { success: false, message: currentAdmin.error },
        { status: currentAdmin.status },
      );
    }

    return NextResponse.json({
      success: true,
      notifications: await getAdminNotifications(),
    });
  } catch (error) {
    console.error("Admin notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentAdmin = await getCurrentAdmin();

    if ("error" in currentAdmin) {
      return NextResponse.json(
        { success: false, message: currentAdmin.error },
        { status: currentAdmin.status },
      );
    }

    const body: unknown = await request.json();

    if (!isRecord(body)) {
      return NextResponse.json(
        { success: false, message: "Request body must be a JSON object" },
        { status: 400 },
      );
    }

    const audience = typeof body.audience === "string" ? body.audience : "all";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: "Title and message are required" },
        { status: 400 },
      );
    }

    const userQuery =
      audience === "student" || audience === "teacher" || audience === "admin"
        ? { role: audience }
        : {};
    const users = await User.find(userQuery).select("_id").lean<Array<{ _id: unknown }>>();

    if (users.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    await Notification.insertMany(
      users.map((user) => ({
        user: user._id,
        title,
        message,
        type: "admin_broadcast",
      })),
    );

    return NextResponse.json({ success: true, count: users.length });
  } catch (error) {
    console.error("Admin broadcast notification error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send notifications" },
      { status: 500 },
    );
  }
}
