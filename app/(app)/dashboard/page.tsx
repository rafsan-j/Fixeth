"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import DashboardScreen from "@/components/screens/Dashboard";
import { useAppTheme } from "@/components/providers/app-theme-provider";
import { useCourse } from "@/components/providers/course-provider";
import type { UserEvaluation } from "@/types/ui";

let cachedEvaluationRaw: string | null = null;
let cachedEvaluationSnapshot: UserEvaluation | null = null;

function readStoredEvaluation(): UserEvaluation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("fixeth.evaluation");
    if (raw === cachedEvaluationRaw) return cachedEvaluationSnapshot;

    cachedEvaluationRaw = raw;
    cachedEvaluationSnapshot = raw ? (JSON.parse(raw) as UserEvaluation) : null;
    return cachedEvaluationSnapshot;
  } catch {
    cachedEvaluationRaw = null;
    cachedEvaluationSnapshot = null;
    return null;
  }
}

function subscribeEvaluation(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("fixeth:evaluation-changed", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("fixeth:evaluation-changed", onStoreChange);
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { T, t, lang, user, preferences, profileRow } = useAppTheme();
  const { modules, activeLessonId, dashboardStats, dashboardAnalytics, loading } =
    useCourse();
  const evaluation = useSyncExternalStore(
    subscribeEvaluation,
    readStoredEvaluation,
    () => null
  );

  const continueHref = activeLessonId
    ? `/learn/${activeLessonId}`
    : dashboardStats?.currentLessonId
      ? `/learn/${dashboardStats.currentLessonId}`
      : "/learn";

  return (
    <DashboardScreen
      T={T}
      t={t}
      lang={lang}
      user={user}
      evaluation={evaluation}
      modules={modules}
      activeLessonId={activeLessonId}
      weeklyGoal={preferences.weeklyGoal}
      dashboardStats={dashboardStats}
      dashboardAnalytics={dashboardAnalytics}
      streak={dashboardStats?.streak ?? profileRow?.streak ?? 0}
      loading={loading}
      onContinue={() => router.push(continueHref)}
      onStartAssessment={() => router.push("/onboarding")}
      onMyTracks={() => router.push("/my-tracks")}
      onTrackLibrary={() => router.push("/tracks")}
    />
  );
}
