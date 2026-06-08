import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/current-user";
import Certificate from "@/lib/models/Certificate";
import Course from "@/lib/models/Course";
import Enrollment from "@/lib/models/Enrollment";
import Notification from "@/lib/models/Notification";
import Payment from "@/lib/models/Payment";
import Review from "@/lib/models/Review";
import User from "@/lib/models/User";
import { toJsonSafe } from "@/lib/serialization";

export const runtime = "nodejs";

type UserRouteContext = {
  params: Promise<{ id: string }>;
};

const roles = ["student", "teacher", "admin"] as const;
const accountStatuses = ["active", "suspended"] as const;

function isRole(value: unknown): value is (typeof roles)[number] {
  return typeof value === "string" && roles.includes(value as (typeof roles)[number]);
}

function isAccountStatus(value: unknown): value is (typeof accountStatuses)[number] {
  return typeof value === "string" && accountStatuses.includes(value as (typeof accountStatuses)[number]);
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

    const body = (await request.json()) as { role?: unknown; accountStatus?: unknown };

    if (body.role !== undefined && !isRole(body.role)) {
      return NextResponse.json(
        { success: false, message: "Role must be student, teacher, or admin" },
        { status: 400 },
      );
    }

    if (body.accountStatus !== undefined && !isAccountStatus(body.accountStatus)) {
      return NextResponse.json(
        { success: false, message: "Account status must be active or suspended" },
        { status: 400 },
      );
    }

    if (body.role === undefined && body.accountStatus === undefined) {
      return NextResponse.json(
        { success: false, message: "No user changes provided" },
        { status: 400 },
      );
    }

    if (String(currentAdmin.user._id) === id && body.role !== undefined && body.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admins cannot demote their own account" },
        { status: 400 },
      );
    }

    if (String(currentAdmin.user._id) === id && body.accountStatus === "suspended") {
      return NextResponse.json(
        { success: false, message: "Admins cannot suspend their own account" },
        { status: 400 },
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        ...(body.role !== undefined ? { role: body.role } : {}),
        ...(body.accountStatus !== undefined ? { accountStatus: body.accountStatus } : {}),
      },
      { new: true, runValidators: true },
    ).select("_id name email role accountStatus");

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

export async function DELETE(_: Request, context: UserRouteContext) {
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

    if (String(currentAdmin.user._id) === id) {
      return NextResponse.json(
        { success: false, message: "Admins cannot delete their own account" },
        { status: 400 },
      );
    }

    const user = await User.findByIdAndDelete(id).select("_id");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    await Promise.all([
      Course.updateMany({ teacher: user._id }, { $unset: { teacher: "" } }),
      Course.updateMany({ students: user._id }, { $pull: { students: user._id } }),
      Enrollment.deleteMany({ student: user._id }),
      Review.deleteMany({ student: user._id }),
      Payment.deleteMany({ student: user._id }),
      Certificate.deleteMany({ student: user._id }),
      Notification.deleteMany({ user: user._id }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 },
    );
  }
}
