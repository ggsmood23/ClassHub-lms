import { NextResponse } from "next/server";
import { getAdminOverview } from "@/lib/admin";
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

    const overview = await getAdminOverview();

    return NextResponse.json({
      success: true,
      stats: overview.stats,
      chartRows: overview.chartRows,
      categoryMix: overview.categoryMix,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin analytics" },
      { status: 500 },
    );
  }
}
