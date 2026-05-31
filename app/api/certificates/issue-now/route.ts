import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: userResp } = await supabase.auth.getUser();
    const userId = userResp?.user?.id;
    if (!userId) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const trackId = body.trackId ?? null;
    const enrollmentId = body.enrollmentId ?? null;
    const score = body.score ?? null;
    const grade = body.grade ?? null;

    const cert_hash = `${userId}-${trackId ?? "_"}-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const payload: Record<string, any> = {
      user_id: userId,
      track_id: trackId,
      enrollment_id: enrollmentId,
      cert_hash,
      score,
      grade,
      pdf_url: null
    };

    const { data, error } = await supabase.from("certificates").insert(payload).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err) {
    console.error("/api/certificates/issue-now error", err);
    return NextResponse.json({ error: (err as any).message || String(err) }, { status: 500 });
  }
}
