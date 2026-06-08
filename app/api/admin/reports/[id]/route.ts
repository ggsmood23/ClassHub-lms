import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/current-user";
import Review from "@/lib/models/Review";
import { toJsonSafe } from "@/lib/serialization";

export const runtime = "nodejs";

type ReportRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_: Request, context: ReportRouteContext) {
  try {
    const currentAdmin = await getCurrentAdmin();

    if ("error" in currentAdmin) {
      return NextResponse.json(
        { success: false, message: currentAdmin.error },
        { status: currentAdmin.status },
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid report id" },
        { status: 400 },
      );
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { moderationStatus: "resolved" },
      { new: true, runValidators: true },
    );

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Report not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, report: toJsonSafe(review) });
  } catch (error) {
    console.error("Admin resolve report error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to resolve report" },
      { status: 500 },
    );
  }
}
