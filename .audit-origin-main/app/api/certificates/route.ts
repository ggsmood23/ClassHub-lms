import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth/current-user";
import Certificate from "@/lib/models/Certificate";

export async function GET() {
  try {
    const currentStudent = await getCurrentStudent();

    if ("error" in currentStudent) {
      return NextResponse.json(
        { error: currentStudent.error },
        { status: currentStudent.status },
      );
    }

    const certificates = await Certificate.find({
      student: currentStudent.user._id,
    })
      .select("studentName courseName completionDate createdAt")
      .sort({ completionDate: -1 });

    return NextResponse.json(certificates, { status: 200 });
  } catch (error) {
    console.error("Fetch certificates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 },
    );
  }
}
