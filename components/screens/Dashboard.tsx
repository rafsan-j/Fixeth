"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ArrowRight, BookOpen, Star, Bot, Award, Trophy, Flame, Library, List } from "lucide-react";
import ContentTemplates from "@/components/screens/ContentTemplates";

const DashboardCharts = dynamic(() => import("./DashboardCharts"), { ssr: false });
import { themeVars } from "@/lib/ui/theme-vars";
import type { DashboardAnalytics, DashboardStats, Module, UserEvaluation } from "@/types/ui";
import type { JobSignal } from "@/types/ui";

const SHIMMER_CSS = `
  @keyframes fixeth-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes fixeth-breathe {
    0%, 100% { transform: translateY(0); opacity: 0.7; }
    50% { transform: translateY(-2px); opacity: 1; }
  }
  .fx-shimmer {
    background: linear-gradient(90deg, var(--t-bg2) 0%, var(--t-bg3) 50%, var(--t-bg2) 100%);
    background-size: 400% 100%;
    animation: fixeth-shimmer 1.4s ease-in-out infinite;
  }
`;

export default function DashboardScreen({
  T,
  t,
  lang,
  onContinue,
  user,
  evaluation,
  modules = [],
  activeLessonId,
  weeklyGoal = 4,
  dashboardStats = null,
  dashboardAnalytics = null,
  streak = 0,
  loading = false,
  onStartAssessment,
  onMyTracks,
  onTrackLibrary
}: {
  T: any;
  t: any;
  lang: string;
  onContinue: () => void;
  user?: { name: string };
  evaluation?: UserEvaluation | null;
  modules?: Module[];
  activeLessonId?: string;
  weeklyGoal?: number;
  dashboardStats?: DashboardStats | null;
  dashboardAnalytics?: DashboardAnalytics | null;
  streak?: number;
  loading?: boolean;
  onStartAssessment?: () => void;
  onMyTracks?: () => void;
  onTrackLibrary?: () => void;
}) {
  const [jobSignals, setJobSignals] = useState<JobSignal[]>([]);

  useEffect(() => {
    let active = true;
    async function loadSignals() {
      try {
        const response = await fetch("/api/jobs?limit=5", { cache: "no-store" });
        const json = (await response.json()) as {
          data?: { signals?: JobSignal[] };
        };
        if (!active) return;
        setJobSignals(json.data?.signals || []);
      } catch {
        if (!active) return;
        setJobSignals([]);
      }
    }
    void loadSignals();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={themeVars(T)} className="flex-1 overflow-y-auto bg-[var(--t-bg0)]">
        <style>{SHIMMER_CSS}</style>

        <div className="mx-auto max-w-[1360px] px-4 pb-10 pt-5">
          <div
            style={{ background: `linear-gradient(135deg, ${T.bg2} 0%, ${T.accent}0d 100%)` }}
            className="mb-5 overflow-hidden rounded-[14px] border border-[var(--t-border)] p-6 shadow-[var(--t-shadow)]"
          >
            <div className="grid gap-[18px] lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
              <div>
                <div className="grid max-w-[420px] gap-2.5">
                  <div className="fx-shimmer h-[18px] w-[42%] rounded-full" />
                  <div className="fx-shimmer h-[42px] w-[78%] rounded-xl" />
                  <div className="fx-shimmer h-3.5 w-[64%] rounded-full" />
                  <div className="mt-2 flex gap-1.5">
                    {Array.from({ length: 7 }).map((_, index) => (
                      <div
                        key={index}
                        className="fx-shimmer size-9 rounded-lg lg:size-[30px]"
                        style={{ animationDelay: `${index * 0.06}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2 lg:items-end">
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <div className="fx-shimmer h-[42px] w-[138px] rounded-[10px]" />
                  <div className="fx-shimmer h-[42px] w-28 rounded-[10px]" style={{ animationDelay: "0.08s" }} />
                  <div className="fx-shimmer h-[42px] w-28 rounded-[10px]" style={{ animationDelay: "0.16s" }} />
                </div>
                <div className="fx-shimmer h-3 w-[170px] rounded-full" style={{ animationDelay: "0.24s" }} />
              </div>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex min-h-[92px] items-center justify-between gap-3.5 rounded-[10px] border border-[var(--t-border)] bg-[var(--t-bg1)] px-4 py-3.5 shadow-[var(--t-shadow)]"
                style={{ animation: "fixeth-breathe 1.9s ease-in-out infinite" }}
              >
                <div className="flex-1">
                  <div className="fx-shimmer h-2.5 w-[58%] rounded-full" style={{ animationDelay: `${index * 0.06}s` }} />
                  <div className="fx-shimmer mt-2.5 h-[22px] w-[42%] rounded-lg" style={{ animationDelay: `${index * 0.06 + 0.05}s` }} />
                  <div className="fx-shimmer mt-2.5 h-[9px] w-[72%] rounded-full" style={{ animationDelay: `${index * 0.06 + 0.1}s` }} />
                </div>
                <div className="fx-shimmer size-9 rounded-lg" style={{ animationDelay: `${index * 0.05}s` }} />
              </div>
            ))}
          </div>

          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[0, 1].map((section) => (
              <div key={section} className="rounded-xl border border-[var(--t-border)] bg-[var(--t-bg1)] p-[18px] shadow-[var(--t-shadow)]">
                <div className="fx-shimmer h-[13px] w-[38%] rounded-full" style={{ animationDelay: `${section * 0.08}s` }} />
                <div className="mt-4 grid gap-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="grid gap-2">
                      <div className="flex justify-between gap-3">
                        <div className="fx-shimmer h-[11px] w-[52%] rounded-full" style={{ animationDelay: `${index * 0.05}s` }} />
                        <div className="fx-shimmer h-[11px] w-9 rounded-full" style={{ animationDelay: `${index * 0.05 + 0.04}s` }} />
                      </div>
                      <div className="fx-shimmer h-1 rounded-full" style={{ animationDelay: `${index * 0.05 + 0.08}s` }} />
                      <div className="fx-shimmer h-[9px] w-[40%] rounded-full" style={{ animationDelay: `${index * 0.05 + 0.12}s` }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-xl border border-[var(--t-border)] bg-[var(--t-bg1)] p-[18px] shadow-[var(--t-shadow)]">
              <div className="fx-shimmer h-[13px] w-[36%] rounded-full" />
              <div className="mt-3 grid grid-cols-2 gap-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="fx-shimmer h-[26px] rounded-lg" style={{ animationDelay: `${index * 0.04}s` }} />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[var(--t-border)] bg-[var(--t-bg1)] p-[18px] shadow-[var(--t-shadow)]">
              <div className="fx-shimmer h-[13px] w-[42%] rounded-full" />
              <div className="mt-3.5 flex flex-col gap-2.5">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <div className="fx-shimmer size-6 rounded-md" style={{ animationDelay: `${index * 0.05}s` }} />
                    <div className="flex-1">
                      <div className="fx-shimmer h-[11px] rounded-full" style={{ width: `${70 - index * 6}%`, animationDelay: `${index * 0.04 + 0.03}s` }} />
                      <div className="fx-shimmer mt-1.5 h-[9px] rounded-full" style={{ width: `${50 - index * 4}%`, animationDelay: `${index * 0.04 + 0.08}s` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const totalLessons =
    dashboardStats?.totalLessons ??
    modules.reduce((count, module) => count + module.lessons.length, 0);
  const completedLessons =
    dashboardStats?.lessonsCompleted ??
    modules.reduce(
      (count, module) => count + module.lessons.filter((lesson) => lesson.done).length,
      0
    );
  const enrollmentProgress = dashboardStats?.progressPercent ?? 0;
  const displayStreak = dashboardStats?.streak ?? streak;
  const currentModule = modules.find((module) => module.lessons.some((lesson) => lesson.id === activeLessonId)) ?? modules[0];
  const currentModuleCompleted = currentModule ? currentModule.lessons.filter((lesson) => lesson.done).length : 0;
  const currentModuleTotal = currentModule?.lessons.length ?? 0;
  const currentModulePct = currentModuleTotal ? Math.round((currentModuleCompleted / currentModuleTotal) * 100) : 0;
  const scorePct = typeof evaluation?.percentage === "number"
    ? evaluation.percentage
    : typeof evaluation?.score === "number"
      ? Math.round((evaluation.score / 10) * 100)
      : undefined;
  const certificateCount = modules.filter((module) => module.lessons.length > 0 && module.lessons.every((lesson) => lesson.done)).length;
  const activityProgress = `${Math.min(completedLessons, weeklyGoal)}/${weeklyGoal}`;
  const assessmentLabel = evaluation?.skipped
    ? (lang === "bn" ? "অপেক্ষমাণ" : "Pending")
    : typeof scorePct === "number"
      ? `${scorePct}%`
      : (lang === "bn" ? "অপেক্ষমাণ" : "Pending");
  const dailySeries = dashboardAnalytics?.dailyCompletions ?? [];
  const recentCompletions = dashboardAnalytics?.recentActivity ?? [];
  const recentWeekSeries = dailySeries.slice(-7);
  const weekBadges = recentWeekSeries.map((point) => ({
    key: point.date,
    completedLessons: point.completedLessons,
    label: new Date(`${point.date}T00:00:00`).toLocaleDateString(
      lang === "bn" ? "bn-BD" : "en-US",
      { weekday: "short" }
    )
  }));
  const trackRows = [
    {
      name: lang === "bn" ? "ডেটা সায়েন্স ট্র্যাক" : "Data Science & AI",
      pct:
        currentModule?.id === modules[0]?.id
          ? currentModulePct
          : Math.min(100, Math.max(0, Math.round((completedLessons / Math.max(totalLessons || 1, 1)) * 100))),
      label: currentModule?.title ?? (lang === "bn" ? "সক্রিয় মডিউল" : "Active module")
    },
    {
      name: lang === "bn" ? "ডিজিটাল লিটারেসি" : "Digital Literacy Fundamentals",
      pct: modules[1]?.lessons.length ? Math.round((modules[1].lessons.filter((lesson) => lesson.done).length / modules[1].lessons.length) * 100) : 0,
      label: lang === "bn" ? `${modules[1]?.lessons.filter((lesson) => lesson.done).length ?? 0} / ${modules[1]?.lessons.length ?? 0} সম্পন্ন` : `${modules[1]?.lessons.filter((lesson) => lesson.done).length ?? 0} / ${modules[1]?.lessons.length ?? 0} done`
    }
  ];

  return (
    <div style={themeVars(T)} className="flex-1 overflow-y-auto bg-[var(--t-bg0)]">
      <div className="mx-auto max-w-[1360px] px-4 pb-10 pt-5">

        {/* Personalized Welcome Banner */}
        <div
          style={{ background: `linear-gradient(135deg, ${T.bg2} 0%, ${T.accent}0d 100%)` }}
          className="mb-5 flex flex-col gap-4 rounded-[14px] border border-[var(--t-border)] p-5 shadow-[var(--t-shadow)] sm:p-6 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h2 className="mb-1.5 text-2xl font-black text-[var(--t-txt0)] lg:text-[21px]">
              {t.greeting}, {user?.name ?? (lang === "bn" ? "বন্ধু" : "Learner")} 👋
            </h2>
            <p className="mb-3.5 text-[15px] leading-snug text-[var(--t-txt1)] lg:text-[13px]">
              {loading
                ? lang === "bn"
                  ? "ডেটা লোড হচ্ছে..."
                  : "Loading your progress..."
                : lang === "bn"
                  ? `${dashboardStats?.trackTitle || "আপনার ট্র্যাক"} — ${enrollmentProgress}% সম্পন্ন। ${displayStreak} দিনের স্ট্রিক।`
                  : `${dashboardStats?.trackTitle || "Your track"} — ${enrollmentProgress}% complete. ${displayStreak}-day streak.`}
            </p>
            {/* Week tracker balls */}
            <div className="flex gap-1.5">
              {weekBadges.map((day) => (
                <div
                  key={day.key}
                  className={`flex size-9 items-center justify-center rounded-lg text-[11px] font-extrabold lg:size-[30px] lg:text-[9.5px] ${
                    day.completedLessons > 0
                      ? "bg-[var(--t-accent)] text-black"
                      : "bg-[var(--t-bg4)] text-[var(--t-txt2)]"
                  }`}
                >
                  {day.label}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:items-end">
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button
                onClick={onContinue}
                className="min-h-11 cursor-pointer rounded-lg border-none bg-[var(--t-accent)] px-5 py-3 text-sm font-extrabold text-black shadow-[0_4px_14px_var(--t-accent-dim)] lg:px-[18px] lg:py-2.5 lg:text-[12.5px]"
              >
                {t.continueBtn}
              </button>
              {onMyTracks && (
                <Link
                  href="/my-tracks"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-[var(--t-border)] bg-[var(--t-bg3)] px-3.5 py-3 text-[13px] font-bold text-[var(--t-txt0)] no-underline lg:py-2.5 lg:text-[11.5px]"
                >
                  <List size={16} />
                  {lang === "bn" ? "আমার ট্র্যাক" : "My tracks"}
                </Link>
              )}
              {onTrackLibrary && (
                <Link
                  href="/tracks"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-[var(--t-border)] bg-[var(--t-bg3)] px-3.5 py-3 text-[13px] font-bold text-[var(--t-txt0)] no-underline lg:py-2.5 lg:text-[11.5px]"
                >
                  <Library size={16} />
                  {lang === "bn" ? "লাইব্রেরি" : "Library"}
                </Link>
              )}
            </div>
            <span className="text-xs text-[var(--t-txt1)] lg:text-[10px]">
              Syllabus Progress · <strong className="text-[var(--t-accent)]">{enrollmentProgress}%</strong>
            </span>
          </div>
        </div>

        {/* Skipped Evaluation Banner */}
        {evaluation?.skipped && (
          <div
            style={{
              background: "linear-gradient(135deg, #FF8A3D0d 0%, #FF8A3D1a 100%)",
              animation: "slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}
            className="mb-5 flex flex-col gap-4 rounded-[14px] border-2 border-[#FF8A3D] px-5 py-5 shadow-[0_4px_14px_#FF8A3D15] sm:flex-row sm:items-center sm:justify-between sm:px-6"
          >
            <style>{`
              @keyframes slideDown {
                from {
                  opacity: 0;
                  transform: translateY(-10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>

            <div className="flex items-center gap-3">
              <AlertCircle size={24} color="#FF8A3D" className="shrink-0" />
              <div>
                <h3 className="mb-1 text-[17px] font-black text-[var(--t-txt0)] lg:text-[15px]">
                  {lang === "bn" ? "আপনার মূল্যায়ন এখনো বাকি" : "Assessment Pending"}
                </h3>
                <p className="m-0 text-sm leading-tight text-[var(--t-txt1)] lg:text-[13px]">
                  {lang === "bn"
                    ? "আপনার দক্ষতা পরিমাপ করুন এবং ব্যক্তিগতকৃত শিক্ষা পথ পান।"
                    : "Complete your assessment to unlock personalized learning recommendations."}
                </p>
              </div>
            </div>

            <button
              onClick={onStartAssessment}
              className="flex min-h-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border-none bg-[#FF8A3D] px-4 py-2.5 text-[13px] font-extrabold text-white shadow-[0_4px_12px_#FF8A3D3d] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_#FF8A3D4d]"
            >
              {lang === "bn" ? "এখনই মূল্যায়ন করুন" : "Take Assessment"}
              <ArrowRight size={16} />
            </button>
          </div>
        )}


        {/* Dynamic Metric Grid */}
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { icon: BookOpen, label: t.lessonsCompleted, value: `${completedLessons}/${totalLessons || 0}`, color: T.accent, note: lang === "bn" ? "কোর্স-স্তরের অগ্রগতি" : "Course-level progress" },
            { icon: Star, label: t.quizAvg, value: assessmentLabel, color: T.amber, note: evaluation?.skipped ? (lang === "bn" ? "ডায়াগনস্টিক বাকি" : "Diagnostic pending") : (lang === "bn" ? "সর্বশেষ স্কোর" : "Latest score") },
            { icon: Flame, label: t.streak, value: `${displayStreak}`, color: "#FF5B8A", note: lang === "bn" ? "টানা দিন" : "Day streak" },
            { icon: Trophy, label: t.certificates, value: `${certificateCount}`, color: T.blue, note: lang === "bn" ? "পূর্ণ মডিউল" : "Completed modules" }
          ].map((card, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-[10px] border border-[var(--t-border)] bg-[var(--t-bg1)] px-4 py-3.5 shadow-[var(--t-shadow)]"
            >
              <div className="min-w-0">
                <div className="truncate text-[10px] font-bold uppercase text-[var(--t-txt1)]">{card.label}</div>
                <div className="mt-1 text-lg font-black text-[var(--t-txt0)]">{card.value}</div>
                <div className="mt-1 text-[10.5px] leading-snug text-[var(--t-txt1)]">{card.note}</div>
              </div>
              <div
                style={{ background: `${card.color}20` }}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg"
              >
                <card.icon size={18} color={card.color} strokeWidth={2} />
              </div>
            </div>
          ))}
        </div>

        {/* Progress & Target Section */}
        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* My tracks progress */}
          <div className="rounded-xl border border-[var(--t-border)] bg-[var(--t-bg1)] p-[18px] shadow-[var(--t-shadow)]">
            <h3 className="mb-3.5 text-[13.5px] font-extrabold text-[var(--t-txt0)]">
              {t.activeTrack}
            </h3>
            {trackRows.map((track, i) => (
              <div
                key={i}
                className={i < 1 ? "border-b border-[var(--t-border)] pb-3.5" : "pt-3.5"}
              >
                <div className="mb-1 flex justify-between text-xs font-bold text-[var(--t-txt0)]">
                  <span>{track.name}</span>
                  <span className="text-[var(--t-accent)]">{track.pct}%</span>
                </div>
                {/* Progress bar line */}
                <div className="mb-1 h-1 rounded-sm bg-[var(--t-bg4)]">
                  <div className="h-full rounded-sm bg-[var(--t-accent)]" style={{ width: `${track.pct}%` }} />
                </div>
                <span className="text-[10px] text-[var(--t-txt1)]">{track.label}</span>
              </div>
            ))}
          </div>

          {/* Weekly progress targets ring */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--t-border)] bg-[var(--t-bg1)] p-[18px] shadow-[var(--t-shadow)]">
            <h3 className="mb-3 self-start text-[13.5px] font-extrabold text-[var(--t-txt0)]">
              {t.weeklyGoal}
            </h3>

            <div className="relative mb-2.5 size-20">
              <svg width="80" height="80" className="-rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke={T.bg4} strokeWidth="6" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke={T.accent}
                  strokeWidth="6"
                  strokeDasharray={213}
                  strokeDashoffset={213 * (1 - 0.75)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-black text-[var(--t-txt0)]">{activityProgress}</span>
                <span className="text-[8px] text-[var(--t-txt1)]">Classes Done</span>
              </div>
            </div>
            <span className="text-[11px] text-[var(--t-txt1)]">{lang === "bn" ? "সাপ্তাহিক লক্ষ্যে এগিয়ে যান!" : "Keep moving toward the weekly goal!"}</span>
          </div>
        </div>

        {/* Learning analytics */}
        <DashboardCharts dashboardAnalytics={dashboardAnalytics} T={T} t={t} lang={lang} />

        <div className="mb-5">
          <div className="rounded-xl border border-[var(--t-border)] bg-[var(--t-bg1)] p-[18px] shadow-[var(--t-shadow)]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="m-0 text-[13.5px] font-extrabold text-[var(--t-txt0)]">{t.jobReadiness}</h3>
              <Link href="/jobs" className="text-[11px] font-bold text-[var(--t-accent)] no-underline">
                {t.viewJobs}
              </Link>
            </div>
            {jobSignals.length === 0 ? (
              <div className="text-[11.5px] text-[var(--t-txt1)]">
                {lang === "bn" ? "লাইভ জব সিগন্যাল আসছে..." : "Live job signals are loading..."}
              </div>
            ) : (
              <div className="grid gap-2">
                {jobSignals.map((signal) => (
                  <div key={`${signal.skill}-${signal.source}`} className="flex justify-between gap-2">
                    <span className="text-[11.5px] text-[var(--t-txt0)]">{signal.skill}</span>
                    <span className="text-[10.5px] text-[var(--t-txt1)]">
                      {signal.mentionCount} · {signal.weekChangePct > 0 ? "+" : ""}
                      {signal.weekChangePct}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-xl border border-[var(--t-border)] bg-[var(--t-bg1)] p-[18px] shadow-[var(--t-shadow)]">
            <h3 className="mb-3.5 text-[13.5px] font-extrabold text-[var(--t-txt0)]">
              {t.recentCompletions}
            </h3>
            {recentCompletions.length === 0 ? (
              <div className="text-xs text-[var(--t-txt2)]">{t.noActivityYet}</div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {recentCompletions.map((event) => (
                  <div key={`${event.lessonId}-${event.completedAt}`} className="flex items-start gap-2.5">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--t-accent-dim)] text-[var(--t-accent)]">
                      <CheckCircle2 size={14} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="text-[11.5px] font-bold text-[var(--t-txt0)]">
                        {event.lessonTitle}
                      </div>
                      <div className="mt-0.5 text-[10px] text-[var(--t-txt1)]">
                        {event.moduleTitle}
                      </div>
                      <div className="mt-0.5 text-[9.5px] text-[var(--t-txt2)]">
                        {new Date(event.completedAt).toLocaleString(
                          lang === "bn" ? "bn-BD" : "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit"
                          }
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Templates for evaluation-based learning paths */}
        {evaluation && !evaluation.skipped && evaluation.percentage !== undefined && (
          <ContentTemplates
            T={T}
            t={t}
            lang={lang}
            evaluationPercentage={evaluation.percentage}
          />
        )}

      </div>
    </div>
  );
}
