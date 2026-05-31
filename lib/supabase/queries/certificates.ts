import { createClient } from "@/lib/supabase/client";

export type UserCertificate = {
  id: string;
  title: string;
  title_bn?: string;
  issued_at?: string;
  track?: string;
  track_bn?: string;
  score?: number;
};

/**
 * Fetch certificates issued to a user. Returns a normalized array suitable for UI mapping.
 */
export async function fetchUserCertificates(userId: string): Promise<UserCertificate[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });

  if (error) {
    console.error("[fetchUserCertificates]", error.message);
    return [];
  }

  return (data || []) as UserCertificate[];
}
