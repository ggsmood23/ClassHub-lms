import { NextResponse } from "next/server";
import { getAdminUsers } from "@/lib/admin";
import { getCurrentAdmin } from "@/lib/auth/current-user";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const currentAdmin = await getCurrentAdmin();

    if ("error" in currentAdmin) {
      return NextResponse.json(
        { success: false, message: currentAdmin.error },
        { status: currentAdmin.status },
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const users = await getAdminUsers(
      role === "student" || role === "teacher" || role === "admin"
        ? role
        : undefined,
    );

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin users" },
      { status: 500 },
    );
  }
}
