"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { useParams, useRouter } from "next/navigation";
import type {
  ChatMessage,
  DashboardAnalytics,
  DashboardStats,
  Module
} from "@/types/ui";
import { useAppTheme } from "@/components/providers/app-theme-provider";
import {
  fetchActiveEnrollmentClient,
  fetchCompletedProgressInRangeClient,
  fetchCompletedLessonIdsClient,
  fetchCurriculumForTrack
} from "@/lib/supabase/queries/curriculum-client";
import {
  fetchEnrollmentForTrackClient,
  fetchTrackIdForLessonClient
} from "@/lib/supabase/queries/enroll-client";
import { normalizeUiTier, type UiTier } from "@/lib/tier/config";

const DASHBOARD_RANGE_DAYS = 30;

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildDateRangeKeys(days: number): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const keys: string[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - offset);
    keys.push(formatDateKey(d));
  }

  return keys;
}

type CourseContextValue = {
  modules: Module[];
  loading: boolean;
  enrollmentTrackId: string | null;
  activeTrackTier: UiTier;
  activeLessonId: string;
  setActiveLessonId: (id: string) => void;
  openMods: Record<string, boolean>;
  setOpenMods: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  aiMsgs: ChatMessage[];
  setAiMsgs: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  handlePreviousLesson: () => void;
  handleNextLesson: () => void;
  activeModule: Module | undefined;
  activeLesson: Module["lessons"][number] | undefined;
  learnHref: string;
  dashboardStats: DashboardStats | null;
  dashboardAnalytics: DashboardAnalytics | null;
  refreshCurriculum: () => Promise<void>;
};

const CourseContext = createContext<CourseContextValue | null>(null);

export function useCourse() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourse must be used within CourseProvider");
  return ctx;
}

function parseLessonId(lessonParam: string | string[] | undefined): string | null {
  const raw = Array.isArray(lessonParam) ? lessonParam[0] : lessonParam;
  return raw && raw.length > 0 ? raw : null;
}

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const { authUser, profileRow, lang } = useAppTheme();

  const routeLessonId = parseLessonId(params?.lessonId);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentTrackId, setEnrollmentTrackId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonIdState] = useState<string>("");
  const [openMods, setOpenMods] = useState<Record<string, boolean>>({});
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [dashboardAnalytics, setDashboardAnalytics] =
    useState<DashboardAnalytics | null>(null);
  const [activeTrackTier, setActiveTrackTier] = useState<UiTier>(1);
  const [aiMsgs, setAiMsgs] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: "I am your Fixeth companion tutor. Ask me about this lesson!"
    }
  ]);

  const refreshCurriculum = useCallback(async () => {
    setLoading(true);

    // Start completed IDs fetch immediately — it doesn't depend on enrollment.
    const completedPromise = fetchCompletedLessonIdsClient(authUser.id);

    // Resolution order: the lesson currently in the URL wins; otherwise keep the
    // track the learner was last viewing (persisted) so navigating to a
    // tier-less route like /codespace doesn't switch tracks/tiers; finally fall
    // back to whatever enrollment is marked active.
    let enrollment = null as Awaited<ReturnType<typeof fetchActiveEnrollmentClient>>;

    if (routeLessonId) {
      const trackId = await fetchTrackIdForLessonClient(routeLessonId);
      if (trackId) {
        enrollment = await fetchEnrollmentForTrackClient(authUser.id, trackId);
      }
    }

    if (!enrollment) {
      const remembered =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem("fixeth:currentTrackId")
          : null;
      if (remembered) {
        enrollment = await fetchEnrollmentForTrackClient(authUser.id, remembered);
      }
    }

    if (!enrollment) {
      enrollment = await fetchActiveEnrollmentClient(authUser.id);
    }

    const completed = await completedPromise;
    setCompletedIds(completed);

    if (!enrollment?.track_id) {
      setModules([]);
      setEnrollmentTrackId(null);
      setActiveTrackTier(1);
      setDashboardStats(null);
      setDashboardAnalytics(null);
      setLoading(false);
      return;
    }

    setEnrollmentTrackId(enrollment.track_id);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("fixeth:currentTrackId", enrollment.track_id);
    }
    setActiveTrackTier(
      normalizeUiTier(enrollment.track?.tier ?? 1)
    );

    const dateKeys = buildDateRangeKeys(DASHBOARD_RANGE_DAYS);
    const sinceDate = new Date();
    sinceDate.setHours(0, 0, 0, 0);
    sinceDate.setDate(sinceDate.getDate() - (DASHBOARD_RANGE_DAYS - 1));

    // Fetch curriculum and progress data in parallel.
    const [curriculum, progressRows] = await Promise.all([
      fetchCurriculumForTrack(enrollment.track_id, completed, lang),
      fetchCompletedProgressInRangeClient(authUser.id, sinceDate.toISOString()),
    ]);

    setModules(curriculum);

    const firstOpen: Record<string, boolean> = {};
    if (curriculum[0]) firstOpen[curriculum[0].id] = true;
    setOpenMods((prev) => ({ ...firstOpen, ...prev }));

    const totalLessons = curriculum.reduce((n, m) => n + m.lessons.length, 0);
    const trackTitle =
      lang === "bn" && enrollment.track?.title_bn
        ? enrollment.track.title_bn
        : enrollment.track?.title_en || "Your track";

    setDashboardStats({
      progressPercent: Number(enrollment.progress_percent) || 0,
      lessonsCompleted: completed.length,
      totalLessons,
      streak: profileRow?.streak ?? 0,
      trackTitle,
      currentLessonId: enrollment.current_lesson_id ?? null
    });

    const lessonMeta = new Map<string, { lessonTitle: string; moduleTitle: string }>();
    curriculum.forEach((module) => {
      module.lessons.forEach((lesson) => {
        lessonMeta.set(lesson.id, {
          lessonTitle: lesson.title,
          moduleTitle: module.title
        });
      });
    });

    const countsByDate = new Map<string, number>(
      dateKeys.map((date) => [date, 0])
    );
    progressRows.forEach((row) => {
      const dateKey = row.completed_at.slice(0, 10);
      if (countsByDate.has(dateKey)) {
        countsByDate.set(dateKey, (countsByDate.get(dateKey) ?? 0) + 1);
      }
    });

    const dailyCompletions = dateKeys.map((date) => ({
      date,
      completedLessons: countsByDate.get(date) ?? 0
    }));

    const completedSet = new Set(completed);
    const moduleCompletions = curriculum.map((module) => {
      const total = module.lessons.length;
      const completedCount = module.lessons.filter((lesson) => completedSet.has(lesson.id)).length;
      return {
        moduleId: module.id,
        moduleTitle: module.title,
        totalLessons: total,
        completedLessons: completedCount
      };
    });

    const recentActivity = [...progressRows]
      .sort(
        (a, b) =>
          new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      )
      .slice(0, 6)
      .map((row) => {
        const meta =
          lessonMeta.get(row.lesson_id) ??
          ({ lessonTitle: "Lesson", moduleTitle: "Module" } as const);
        return {
          lessonId: row.lesson_id,
          lessonTitle: meta.lessonTitle,
          moduleTitle: meta.moduleTitle,
          completedAt: row.completed_at
        };
      });

    setDashboardAnalytics({
      timeRangeDays: DASHBOARD_RANGE_DAYS,
      dailyCompletions,
      moduleCompletions,
      heatmapCells: dailyCompletions.map((point) => ({
        date: point.date,
        count: point.completedLessons
      })),
      recentActivity
    });

    const defaultLesson =
      routeLessonId ||
      enrollment.current_lesson_id ||
      curriculum[0]?.lessons[0]?.id ||
      "";
    setActiveLessonIdState(defaultLesson);
    setLoading(false);
  }, [authUser.id, lang, profileRow?.streak, routeLessonId]);

  useEffect(() => {
    void refreshCurriculum();
  }, [refreshCurriculum]);

  useEffect(() => {
    if (routeLessonId && routeLessonId !== activeLessonId) {
      setActiveLessonIdState(routeLessonId);
    }
  }, [routeLessonId, activeLessonId]);

  const modulesWithActive = useMemo(
    () =>
      modules.map((mod) => ({
        ...mod,
        lessons: mod.lessons.map((les) => ({
          ...les,
          active: les.id === activeLessonId,
          done: completedIds.includes(les.id)
        }))
      })),
    [modules, activeLessonId, completedIds]
  );

  const setActiveLessonId = useCallback(
    (id: string) => {
      setActiveLessonIdState(id);
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/learn")) {
        router.replace(`/learn/${id}`);
      } else {
        router.push(`/learn/${id}`);
      }
    },
    [router]
  );

  const handlePreviousLesson = useCallback(() => {
    const allLessons: { id: string; modId: string }[] = [];
    modulesWithActive.forEach((m) => {
      m.lessons.forEach((l) => {
        allLessons.push({ id: l.id, modId: m.id });
      });
    });
    const currIdx = allLessons.findIndex((item) => item.id === activeLessonId);
    if (currIdx > 0) {
      const prevItem = allLessons[currIdx - 1];
      setActiveLessonId(prevItem.id);
      setOpenMods((prev) => ({ ...prev, [prevItem.modId]: true }));
    }
  }, [activeLessonId, modulesWithActive, setActiveLessonId]);

  const handleNextLesson = useCallback(() => {
    const allLessons: { id: string; modId: string }[] = [];
    modulesWithActive.forEach((m) => {
      m.lessons.forEach((l) => {
        allLessons.push({ id: l.id, modId: m.id });
      });
    });
    const currIdx = allLessons.findIndex((item) => item.id === activeLessonId);
    if (currIdx < allLessons.length - 1) {
      const nextItem = allLessons[currIdx + 1];
      setActiveLessonId(nextItem.id);
      setOpenMods((prev) => ({ ...prev, [nextItem.modId]: true }));
    }
  }, [activeLessonId, modulesWithActive, setActiveLessonId]);

  const activeModule =
    modulesWithActive.find((mod) =>
      mod.lessons.some((lesson) => lesson.id === activeLessonId)
    ) ?? modulesWithActive[0];
  const activeLesson =
    activeModule?.lessons.find((lesson) => lesson.id === activeLessonId) ??
    activeModule?.lessons[0];

  const learnHref = activeLessonId ? `/learn/${activeLessonId}` : "/learn";

  const value = useMemo(
    () => ({
      modules: modulesWithActive,
      loading,
      enrollmentTrackId,
      activeTrackTier,
      activeLessonId,
      setActiveLessonId,
      openMods,
      setOpenMods,
      aiMsgs,
      setAiMsgs,
      handlePreviousLesson,
      handleNextLesson,
      activeModule,
      activeLesson,
      learnHref,
      dashboardStats,
      dashboardAnalytics,
      refreshCurriculum
    }),
    [
      modulesWithActive,
      loading,
      enrollmentTrackId,
      activeTrackTier,
      activeLessonId,
      setActiveLessonId,
      openMods,
      aiMsgs,
      handlePreviousLesson,
      handleNextLesson,
      activeModule,
      activeLesson,
      learnHref,
      dashboardStats,
      dashboardAnalytics,
      refreshCurriculum
    ]
  );

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}
