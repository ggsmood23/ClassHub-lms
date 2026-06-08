import { NextResponse } from "next/server";
import { getAdminReviews } from "@/lib/admin";
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

    const reviews = await getAdminReviews();

    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Admin reports error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin reports" },
      { status: 500 },
    );
  }
}
