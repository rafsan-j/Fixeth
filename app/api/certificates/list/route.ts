import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    const userId = user?.user?.id;
    if (!userId) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

    const { data: existingCerts } = await supabase
      .from("certificates")
      .select("id, cert_hash, score, grade, issued_at, track_id, enrollment_id, pdf_url, track:tracks(title_en,title_bn)")
      .eq("user_id", userId)
      .order("issued_at", { ascending: false });

    const certRows = existingCerts || [];

    const { data: completedEnrollments } = await supabase
      .from("enrollments")
      .select("id, track_id, progress_percent, enrolled_at, track:tracks(title_en,title_bn)")
      .eq("user_id", userId)
      .gte("progress_percent", 100);

    const certEnrollmentIds = new Set(certRows.map((row: any) => String(row.enrollment_id || "")));
    const certTrackIds = new Set(certRows.map((row: any) => String(row.track_id || "")));

    const missingCertificates = (completedEnrollments || []).filter((enrollment) => {
      const enrollmentId = String((enrollment as any).id || "");
      const trackId = String((enrollment as any).track_id || "");
      return !certEnrollmentIds.has(enrollmentId) && !certTrackIds.has(trackId);
    });

    for (const enrollment of missingCertificates) {
      const enrollmentId = String((enrollment as any).id || "");
      const trackId = String((enrollment as any).track_id || "");
      const cert_hash = `${userId}-${trackId || "_"}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      const { error } = await supabase.from("certificates").insert({
        user_id: userId,
        track_id: trackId || null,
        enrollment_id: enrollmentId || null,
        cert_hash,
        score: null,
        grade: null,
        pdf_url: null
      });

      if (error) {
        console.error("[certificates/list backfill]", error.message);
      }
    }

    const { data, error } = await supabase
      .from("certificates")
      .select("id, cert_hash, score, grade, issued_at, track_id, enrollment_id, pdf_url, track:tracks(title_en,title_bn)")
      .eq("user_id", userId)
      .order("issued_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error("/api/certificates/list error", err);
    return NextResponse.json({ error: (err as any).message || String(err) }, { status: 500 });
  }
}
