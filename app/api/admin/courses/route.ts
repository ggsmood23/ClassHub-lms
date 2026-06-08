import { NextResponse } from "next/server";
import { getAdminCourses } from "@/lib/admin";
import { getCurrentAdmin } from "@/lib/auth/current-user";

export const runtime = "nodejs";

export async function GET() {
  try {
    const currentAdmin = await getCurrentAdmin();

    if ("error" in currentAdmin) {
      return NextResponse.json(
        { success: false, message: currentAdmin.error },
        { status: currentAdmin.status },
      );
    }

    const courses = await getAdminCourses();

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error("Admin courses error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin courses" },
      { status: 500 },
    );
  }
}
