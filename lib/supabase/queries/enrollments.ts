import { createClient } from "@/lib/supabase/client";
import type { Enrollment } from "@/types";
import { issueCertificate } from "@/lib/certificates/issue";

export async function createEnrollment(
  userId: string,
  trackId: string,
  currentLessonId: string | null
): Promise<Enrollment | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .upsert(
      {
        user_id: userId,
        track_id: trackId,
        current_lesson_id: currentLessonId,
        progress_percent: 0
      },
      { onConflict: "user_id,track_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("[createEnrollment]", error.message);
    return null;
  }
  return data as Enrollment;
}

export async function updateEnrollmentProgress(
  userId: string,
  trackId: string,
  progressPercent: number,
  currentLessonId?: string | null
): Promise<void> {
  const supabase = createClient();
  const payload: Record<string, unknown> = {
    progress_percent: Math.min(100, Math.max(0, progressPercent))
  };
  if (currentLessonId !== undefined) {
    payload.current_lesson_id = currentLessonId;
  }

  const { error } = await supabase
    .from("enrollments")
    .update(payload)
    .eq("user_id", userId)
    .eq("track_id", trackId);

  if (error) console.error("[updateEnrollmentProgress]", error.message);

  // If the user reached 100% progress, ensure a certificate is issued.
  try {
    if (Math.round(Number(payload.progress_percent) as number) >= 100) {
      // Try to find enrollment id if not provided via payload
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", userId)
        .eq("track_id", trackId)
        .limit(1)
        .maybeSingle();

      const { data: latestProgress } = await supabase
        .from("progress")
        .select("completed_at")
        .eq("user_id", userId)
        .eq("completed", true)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const enrollmentId = (enrollment as any)?.id ?? null;
      await issueCertificate({
        userId,
        trackId,
        enrollmentId,
        issuedAt: (latestProgress as any)?.completed_at ?? new Date().toISOString()
      });
    }
  } catch (err) {
    console.error("[updateEnrollmentProgress.issue]", (err as any).message || err);
  }
}
