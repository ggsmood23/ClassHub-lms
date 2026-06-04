import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StudentCertificatesPage } from "../../../components/dashboard/student-pages";
import { getCurrentStudent } from "@/lib/auth/current-user";
import Certificate from "@/lib/models/Certificate";

export const metadata: Metadata = {
  title: "Certificates | Class Hub",
};

export default async function CertificatesPage() {
  const currentStudent = await getCurrentStudent();

  if ("error" in currentStudent) {
    redirect(currentStudent.status === 401 ? "/login" : "/");
  }

  const certificates = await Certificate.find({
    student: currentStudent.user._id,
  })
    .select("studentName courseName completionDate")
    .sort({ completionDate: -1 });

  return (
    <StudentCertificatesPage
      certificates={certificates.map((certificate) => ({
        _id: certificate._id.toString(),
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        completionDate: certificate.completionDate.toISOString(),
      }))}
    />
  );
}
