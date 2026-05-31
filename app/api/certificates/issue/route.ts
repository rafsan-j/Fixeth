import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chromium } from "playwright";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const certId = url.searchParams.get("id") || url.searchParams.get("cert_hash");
    if (!certId) return NextResponse.json({ error: "missing id" }, { status: 400 });

    const supabase = await createClient();
    // Try to find certificate by id or cert_hash
    const { data: certById } = await supabase.from("certificates").select("*").eq("id", certId).limit(1).maybeSingle();
    const { data: certByHash } = await supabase.from("certificates").select("*").eq("cert_hash", certId).limit(1).maybeSingle();
    const cert = (certById || certByHash) as any;
    if (!cert) return NextResponse.json({ error: "not found" }, { status: 404 });

    const { data: userRow } = await supabase.from("users").select("*").eq("id", cert.user_id).limit(1).maybeSingle();

    // Build simple HTML certificate with visible watermark
    const issuedAt = cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : new Date().toLocaleDateString();
    const name = (userRow && (userRow as any).name) || "Learner";
    const certLabel = cert.cert_hash || cert.id;

    const html = `
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { font-family: -apple-system, Inter, Roboto, sans-serif; margin: 0; padding: 0; }
          .page { width: 210mm; height: 297mm; display: flex; align-items: center; justify-content: center; }
          .card { width: 90%; height: 80%; border: 2px solid #222; border-radius: 8px; padding: 36px; position: relative; background: #fff; }
          .title { font-size: 22px; font-weight: 700; text-align: center; }
          .name { font-size: 36px; text-align: center; margin-top: 24px; font-weight: 800; }
          .meta { text-align: center; margin-top: 12px; color: #444; }
          .watermark { position: absolute; inset: 0; pointer-events: none; display: flex; flex-wrap: wrap; align-content: center; justify-content: center; gap: 12px; }
          .wm { color: rgba(0,0,0,0.08); font-size: 22px; transform: rotate(-25deg); width: 240px; text-align: center; }
          .footer { position: absolute; bottom: 18px; left: 36px; right: 36px; display: flex; justify-content: space-between; font-size: 12px; color: #333; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="card">
            <div class="title">Fixeth — Certificate of Completion</div>
            <div class="name">${escapeHtml(name)}</div>
            <div class="meta">has successfully completed the track<br/> <strong>${escapeHtml(String(cert.track_id || cert.track || "Track"))}</strong></div>
            <div class="meta">Issued: ${escapeHtml(issuedAt)} • Certificate ID: ${escapeHtml(certLabel)}</div>

            <div class="watermark">
              ${Array.from({ length: 40 })
                .map(() => `<div class="wm">${escapeHtml(name)} • ${escapeHtml(String(certLabel))}</div>`)
                .join("")}
            </div>

            <div class="footer"><div>Verified at fixeth.vercel.app</div><div>Signed by Jawat Al Sovon • Validated by Shafin Ahmed Shoron</div></div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Use Playwright to render PDF
    const browser = await chromium.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdf = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    const uint8 = new Uint8Array(pdf as any);
    return new Response(uint8, {
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

function escapeHtml(s: any) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
