import { NextResponse } from "next/server";
import { getAdminPayments, getAdminOverview } from "@/lib/admin";
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

    const [overview, payments] = await Promise.all([
      getAdminOverview(),
      getAdminPayments(),
    ]);

    return NextResponse.json({
      success: true,
      stats: overview.stats,
      chartRows: overview.chartRows,
      payments,
    });
  } catch (error) {
    console.error("Admin payments error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin payments" },
      { status: 500 },
    );
  }
}
