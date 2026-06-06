import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/current-user";
import User from "@/lib/models/User";
import { toJsonSafe } from "@/lib/serialization";

export const runtime = "nodejs";

type UserRouteContext = {
  params: Promise<{ id: string }>;
};

const roles = ["student", "teacher", "admin"] as const;

function isRole(value: unknown): value is (typeof roles)[number] {
  return typeof value === "string" && roles.includes(value as (typeof roles)[number]);
}

export async function PATCH(request: Request, context: UserRouteContext) {
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
        { success: false, message: "Invalid user id" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as { role?: unknown };

    if (!isRole(body.role)) {
      return NextResponse.json(
        { success: false, message: "Role must be student, teacher, or admin" },
        { status: 400 },
      );
    }

    if (String(currentAdmin.user._id) === id && body.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admins cannot demote their own account" },
        { status: 400 },
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role: body.role },
      { new: true, runValidators: true },
    ).select("_id name email role");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, user: toJsonSafe(user) });
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 },
    );
  }
}
