import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth/current-user";
import { createCertificatePdf } from "@/lib/certificates/pdf";
import Certificate from "@/lib/models/Certificate";

function safeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(
  _request: Request,
  context: RouteContext<"/api/certificates/[id]/download">,
) {
  try {
    const currentStudent = await getCurrentStudent();

    if ("error" in currentStudent) {
      return NextResponse.json(
        { error: currentStudent.error },
        { status: currentStudent.status },
      );
    }

    const { id } = await context.params;
    const certificate = await Certificate.findOne({
      _id: id,
      student: currentStudent.user._id,
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 },
      );
    }

    const pdf = createCertificatePdf({
      certificateId: certificate._id.toString(),
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      completionDate: certificate.completionDate,
    });
    const filename =
      safeFilename(`${certificate.courseName}-certificate`) ||
      "course-certificate";

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Download certificate error:", error);
    return NextResponse.json(
      { error: "Failed to download certificate" },
      { status: 500 },
    );
  }
}
