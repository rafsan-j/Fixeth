import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import PDFDocument from "pdfkit";
import fs from "node:fs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const certId = url.searchParams.get("id") || url.searchParams.get("cert_hash");
    if (!certId) return NextResponse.json({ error: "missing id" }, { status: 400 });

    const supabase = await createClient();
    const { data: certById } = await supabase.from("certificates").select("*").eq("id", certId).limit(1).maybeSingle();
    const { data: certByHash } = await supabase.from("certificates").select("*").eq("cert_hash", certId).limit(1).maybeSingle();
    const cert = (certById || certByHash) as any;
    if (!cert) return NextResponse.json({ error: "not found" }, { status: 404 });

    const { data: userRow } = await supabase.from("users").select("*").eq("id", cert.user_id).limit(1).maybeSingle();
    const trackTitle = (cert.track?.title_en || cert.track?.title_bn || cert.track_id || "Track") as string;
    const issuedAt = cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : new Date().toLocaleDateString();
    const recipientName = String((userRow as any)?.name || "Learner");
    const certLabel = String(cert.cert_hash || cert.id);

    const pdfBuffer = await buildCertificatePdf({
      recipientName,
      trackTitle,
      issuedAt,
      certLabel
    });

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${certLabel}.pdf"`
      }
    });
  } catch (err) {
    console.error("/api/certificates/issue error", err);
    return NextResponse.json({ error: (err as any).message || String(err) }, { status: 500 });
  }
}

async function buildCertificatePdf(options: { recipientName: string; trackTitle: string; issuedAt: string; certLabel: string }) {
  const { recipientName, trackTitle, issuedAt, certLabel } = options;

  const regularFont = pickFont([
    "C:\\Windows\\Fonts\\arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
  ]);
  const boldFont = pickFont([
    "C:\\Windows\\Fonts\\arialbd.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
  ]);
  const italicFont = pickFont([
    "C:\\Windows\\Fonts\\ariali.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf"
  ]);
  const boldItalicFont = pickFont([
    "C:\\Windows\\Fonts\\arialbi.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-BoldOblique.ttf"
  ]);

  return await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: [1120, 792], margin: 40, bufferPages: true });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    doc.registerFont("Regular", regularFont);
    doc.registerFont("Bold", boldFont);
    doc.registerFont("Italic", italicFont);
    doc.registerFont("BoldItalic", boldItalicFont);

    doc.rect(0, 0, pageWidth, pageHeight).fill("#0b0b0f");
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        doc
          .save()
          .translate(150 + col * 250, 170 + row * 180)
          .rotate(-24)
          .opacity(0.05)
          .fillColor("#ffffff")
          .fontSize(22)
          .font("Bold")
          .text("FIXETH", 0, 0, { align: "center", width: 160 })
          .restore();
      }
    }
    doc
      .lineWidth(2)
      .strokeColor("#00c896")
      .roundedRect(42, 42, pageWidth - 84, pageHeight - 84, 24)
      .stroke();

    doc
      .lineWidth(1)
      .strokeColor("#1b1b24")
      .roundedRect(62, 62, pageWidth - 124, pageHeight - 124, 18)
      .stroke();

    doc
      .fillColor("#00c896")
      .fontSize(24)
      .font("BoldItalic")
      .text("Fixeth", 0, 88, { align: "center" });

    doc
      .fillColor("#f4f4f8")
      .fontSize(10)
      .font("Bold")
      .text("CERTIFICATE OF COMPLETION", 0, 120, { align: "center", characterSpacing: 2 });

    doc
      .fillColor("#e8e8ef")
      .fontSize(11)
      .font("Regular")
      .text("This official credential proves that", 0, 165, { align: "center" });

    doc
      .fillColor("#ffffff")
      .fontSize(30)
      .font("Bold")
      .text(recipientName, 0, 195, { align: "center" });

    doc
      .fillColor("#e8e8ef")
      .fontSize(11)
      .font("Regular")
      .text("has successfully completed the following track", 0, 238, { align: "center" });

    doc
      .fillColor("#00c896")
      .fontSize(20)
      .font("Bold")
      .text(trackTitle, 0, 262, { align: "center" });

    doc
      .fillColor("#a5a5c2")
      .fontSize(10)
      .font("Regular")
      .text(`Completed on: ${issuedAt} • Certificate ID: ${certLabel}`, 0, 300, { align: "center" });

    const baseY = pageHeight - 170;
    const sigWidth = (pageWidth - 140) / 3;
    const sigNames = ["Jawat Al Sovon", "Shafin Ahmed Shoron", "Rafsan Jani"];
    const sigRoles = ["Signing Authority", "Validation", "Issuance"];

    sigNames.forEach((name, index) => {
      const x = 45 + index * sigWidth;
      doc.moveTo(x, baseY).lineTo(x + sigWidth - 30, baseY).strokeColor("#2d2d39").stroke();
      doc.fillColor("#ffffff").fontSize(11).font("Bold").text(name, x, baseY + 12, { width: sigWidth - 30, align: "center" });
      doc.fillColor("#a5a5c2").fontSize(8.5).font("Regular").text(sigRoles[index], x, baseY + 27, { width: sigWidth - 30, align: "center" });
    });

    doc
      .fillColor("#7d7d97")
      .fontSize(8.5)
      .font("Regular")
      .text("Verified issue date equals the course completion date.", 0, pageHeight - 78, { align: "center" });

    doc
      .fillColor("#7d7d97")
      .fontSize(8.5)
      .font("Regular")
      .text(`Verify at fixeth.vercel.app/verify?id=${certLabel}`, 0, pageHeight - 62, { align: "center" });

    doc.end();
  });
}

function pickFont(candidates: string[]): string {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`No usable font found. Tried: ${candidates.join(", ")}`);
}
