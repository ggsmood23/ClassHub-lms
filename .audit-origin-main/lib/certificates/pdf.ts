type CertificatePdfData = {
  certificateId: string;
  studentName: string;
  courseName: string;
  completionDate: Date;
};

function escapePdfText(value: string) {
  return value
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function textLine(text: string, x: number, y: number, size: number) {
  return `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`;
}

function centeredText(text: string, y: number, size: number) {
  const approximateWidth = text.length * size * 0.5;
  const x = Math.max(48, (792 - approximateWidth) / 2);

  return textLine(text, x, y, size);
}

export function createCertificatePdf(data: CertificatePdfData) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(data.completionDate);

  const stream = [
    "0.96 0.98 1 rg 0 0 792 612 re f",
    "0.04 0.32 0.47 RG 6 w 28 28 736 556 re S",
    "0.12 0.65 0.74 RG 2 w 42 42 708 528 re S",
    centeredText("CLASS HUB", 500, 18),
    centeredText("Certificate of Completion", 430, 34),
    centeredText("This certificate is proudly presented to", 370, 16),
    centeredText(data.studentName, 315, 30),
    centeredText("for successfully completing the course", 260, 16),
    centeredText(data.courseName, 210, 24),
    centeredText(`Completed on ${formattedDate}`, 145, 14),
    centeredText(`Certificate ID: ${data.certificateId}`, 95, 10),
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 792 612] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "ascii"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "ascii");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  pdf += offsets
    .slice(1)
    .map((offset) => `${offset.toString().padStart(10, "0")} 00000 n \n`)
    .join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "ascii");
}
