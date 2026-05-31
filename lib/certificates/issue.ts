import { createClient } from "@/lib/supabase/client";

export type IssuedCertificate = {
  id: string;
  user_id: string;
  track_id?: string;
  enrollment_id?: string;
  cert_hash: string;
  score?: number;
  grade?: string;
  pdf_url?: string | null;
  issued_at?: string;
};

/**
 * Ensure a certificate row exists for a completed enrollment/track.
 * Returns the existing or newly created certificate row.
 */
export async function issueCertificate(options: {
  userId: string;
  trackId?: string;
  enrollmentId?: string;
  score?: number;
  grade?: string;
  issuedAt?: string;
}): Promise<IssuedCertificate | null> {
  const supabase = createClient();
  const { userId, trackId, enrollmentId, score, grade, issuedAt } = options;

  try {
    // If a certificate already exists for this enrollment, return it.
    if (enrollmentId) {
      const { data: existing } = await supabase
        .from("certificates")
        .select("*")
        .eq("enrollment_id", enrollmentId)
        .limit(1)
        .maybeSingle();
      if (existing) return existing as IssuedCertificate;
    }

    // Fallback: check by user+track combo.
    const { data: byUserTrack } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .eq("track_id", trackId)
      .limit(1)
      .maybeSingle();
    if (byUserTrack) return byUserTrack as IssuedCertificate;

    // Generate a simple unique cert_hash
    const cert_hash = `${userId}-${trackId ?? "_"}-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const payload: Record<string, any> = {
      user_id: userId,
      track_id: trackId ?? null,
      enrollment_id: enrollmentId ?? null,
      cert_hash,
      issued_at: issuedAt ?? new Date().toISOString(),
      score: score ?? null,
      grade: grade ?? null,
      pdf_url: null
    };

    const { data, error } = await supabase.from("certificates").insert(payload).select().single();
    if (error) {
      console.error("[issueCertificate] insert error", error.message);
      return null;
    }
    return data as IssuedCertificate;
  } catch (err) {
    console.error("[issueCertificate]", (err as any).message || err);
    return null;
  }
}
