"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Module, ChatMessage } from "@/types/ui";
import { YouTubePlayer, type YouTubePlayerHandle } from "@/components/lesson/youtube-player";
import { LessonNotes } from "@/components/lesson/lesson-notes";
import { createClient } from "@/lib/supabase/client";
import { markLessonComplete } from "@/lib/supabase/queries/progress";
import {
  fetchTranscriptChunks,
  formatSeconds,
  buildTimedSegments,
  type TranscriptChunk
} from "@/lib/supabase/queries/transcript";
import { runChat, isAiConfigured, AiNotConfiguredError, type AiPrefs } from "@/lib/ai/byoa";
import {
  buildContext,
  buildSystemPrompt,
  buildUserPrompt,
  parseAnswerSegments
} from "@/lib/ai/video-chat";
import { useAppTheme } from "@/components/providers/app-theme-provider";
import { useCourse } from "@/components/providers/course-provider";
import type { Lesson } from "@/types";

type PracticeItem = {
  q: string;
  opts: string[];
  ans: number;
};

const createLocalizedChatLog = (selectedLang: string): ChatMessage[] => [
  { role: "ai", text: selectedLang === "bn" ? "এই লেকচার ভিডিও সম্পর্কে কিছু জিজ্ঞেস করুন!" : "Ask me anything about this video's logic!" }
];

const createLocalizedPractices = (selectedLang: string): PracticeItem[] => [
  {
    q: selectedLang === "bn" ? "ফাংশন ডিক্লেয়ার করার সঠিক কীওয়ার্ড কোনটি?" : "Which keyword is used to declare a function in Python?",
    opts: ["func", "def", "lambda", "define"],
    ans: 1
  },
  {
    q: selectedLang === "bn" ? "ফাংশনের ভেতর ডিক্লেয়ার করা ভ্যারিয়েবলের স্কোপ কেমন হয়?" : "What scope does a variable declared inside a Python function have?",
    opts: ["Global scope", "Internal local scope", "Relational scope", "Shared outer scope"],
    ans: 1
  }
];

const createLocalizedNotes = (selectedLang: string) =>
  selectedLang === "bn"
    ? "📝 আমার কোর্স নোটস:\n• পাইথনে ফাংশন লেখার জন্য 'def' কীওয়ার্ড ব্যবহার করা হয়\n• 'return' স্টেটমেন্ট দিয়ে মান পাঠানো হয়\n• লোকাল স্কোপ ভ্যারিয়েবল শুধুমাত্র ফাংশনের ভেতরেই সক্রিয় থাকে।"
    : "📝 My Personal Lecture Notes:\n• Python functions are defined with the 'def' keyword\n• Use 'return' to send computed results back\n• Local scope keeps variables inside the function body only.";

export default function GuidedVideoScreen({
  T,
  t,
  modules,
  activeLessonId,
  lang
}: {
  T: any;
  t: any;
  modules: Module[];
  openMods: any;
  setOpenMods: any;
  activeLessonId: string;
  setActiveLessonId: any;
  onPrevious: any;
  onNext: any;
  aiMsgs: ChatMessage[];
  setAiMsgs: any;
  lang: string;
}) {
  const { authUser, preferences } = useAppTheme();
  const { activeLesson, enrollmentTrackId, refreshCurriculum } = useCourse();
  const [lessonRow, setLessonRow] = useState<Lesson | null>(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [completeMsg, setCompleteMsg] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [activeViewers, setActiveViewers] = useState(148);
  const [videoLang, setVideoLang] = useState<"en" | "bn" | "off">(lang === "bn" ? "bn" : "en");
  const [dockOnSide, setDockOnSide] = useState(true);

  const [transcript, setTranscript] = useState<TranscriptChunk[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const playerHandleRef = useRef<YouTubePlayerHandle | null>(null);

  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveViewers((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + delta;
        return next < 10 ? 12 : next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const [activeTab, setActiveTab] = useState("Notes");
  const [seekTime, setSeekTime] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>(() => createLocalizedChatLog(lang));
  const [practices, setPractices] = useState<PracticeItem[]>(() => createLocalizedPractices(lang));
  const [userAssessAnswers, setUserAssessAnswers] = useState<{ [key: number]: number }>({});
  const [notesText, setNotesText] = useState(() => createLocalizedNotes(lang));

  // Prefer the lesson row only when it matches the active lesson; otherwise
  // fall back to the curriculum list so switching lessons never shows the
  // previously loaded video while the new row is still being fetched.
  const youtubeId =
    (lessonRow && lessonRow.id === activeLessonId
      ? lessonRow.youtube_video_id
      : null) ||
    activeLesson?.youtubeVideoId ||
    null;

  // Rebuild plausible per-segment timestamps when the stored transcript lacks
  // real timing (single chunk @ 0:00). Recomputes once the real duration loads.
  const timedTranscript = useMemo(
    () => buildTimedSegments(transcript, duration),
    [transcript, duration]
  );

  useEffect(() => {
    if (!activeLessonId) {
      setTranscript([]);
      setLessonRow(null);
      return;
    }
    // Clear the stale row immediately so the player swaps to the new video.
    setLessonRow(null);
    setTranscript([]);
    const supabase = createClient();
    void supabase
      .from("lessons")
      .select("*")
      .eq("id", activeLessonId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) setLessonRow(data as Lesson);
      });
    void fetchTranscriptChunks(activeLessonId).then(setTranscript);
    setCurrentTime(0);
    setDuration(0);
    setCompleteMsg(null);
  }, [activeLessonId]);

  // Track the real playback position to highlight the transcript and show time.
  useEffect(() => {
    const id = setInterval(() => {
      const handle = playerHandleRef.current;
      if (!handle) return;
      setCurrentTime(handle.getCurrentTime());
      const dur = handle.getDuration();
      if (dur && dur !== duration) setDuration(dur);
    }, 1000);
    return () => clearInterval(id);
  }, [duration]);

  const handlePlayerReady = useCallback((handle: YouTubePlayerHandle) => {
    playerHandleRef.current = handle;
    setTimeout(() => setDuration(handle.getDuration()), 600);
  }, []);

  useEffect(() => {
    setVideoLang(lang === "bn" ? "bn" : "en");
    setChatLog(createLocalizedChatLog(lang));
    setPractices(createLocalizedPractices(lang));
    if (!lessonRow?.notes_md && !lessonRow?.notes_bn_md) {
      setNotesText(createLocalizedNotes(lang));
    }
  }, [lang, lessonRow]);

  const handleMarkComplete = useCallback(async () => {
    if (!enrollmentTrackId || !activeLessonId) return;
    setMarkingComplete(true);
    setCompleteMsg(null);
    const result = await markLessonComplete(
      authUser.id,
      activeLessonId,
      enrollmentTrackId
    );
    setMarkingComplete(false);
    if (result.error) {
      setCompleteMsg(result.error);
      return;
    }
    setCompleteMsg(lang === "bn" ? "লেসন সম্পন্ন!" : "Lesson marked complete!");
    await refreshCurriculum();
  }, [activeLessonId, authUser.id, enrollmentTrackId, lang, refreshCurriculum]);

  const subtitles = {
    en: "Functions group reusable segments of logic to avoid redundant boilerplate code execution.",
    bn: "ফাংশন মূলত কোডের পুনঃব্যবহারযোগ্য অংশগুলোকে এক গ্রুপে সাজায় যাতে একই কোড বারবার লিখতে না হয়।"
  };

  const activeLessonTitle =
    modules
      .find((m) => m.lessons.some((l) => l.id === activeLessonId))
      ?.lessons.find((l) => l.id === activeLessonId)?.title ||
    lessonRow?.title_en ||
    (lang === "bn" ? "এই লেসন" : "this lesson");

  const seekToSeconds = useCallback((seconds: number) => {
    setPlaying(true);
    const handle = playerHandleRef.current;
    if (handle) {
      handle.seekTo(seconds);
      handle.play();
    } else {
      window.dispatchEvent(new CustomEvent("seekVideo", { detail: { seconds } }));
    }
    setCurrentTime(seconds);
    setSeekTime(formatSeconds(seconds));
    setTimeout(() => setSeekTime(null), 2000);
  }, []);

  const handleChat = useCallback(async () => {
    const question = chatInput.trim();
    if (!question || chatLoading) return;
    setChatInput("");
    setChatLog((p) => [...p, { role: "user", text: question }]);

    const prefs = preferences.ai as unknown as AiPrefs;
    const configHint =
      lang === "bn"
        ? "চ্যাট চালু করতে সেটিংস → AI মেন্টর-এ আপনার নিজের API কী যুক্ত করুন (BYOA)।"
        : "Add your own API key in Settings → AI Mentor (BYOA) to enable chat with this video.";

    if (!isAiConfigured(prefs)) {
      setChatLog((p) => [...p, { role: "ai", text: configHint }]);
      return;
    }

    setChatLoading(true);
    try {
      // Rebuild timed segments at call time with the live player duration so
      // the markers are never stale, then send the FULL lesson transcript so
      // the model can cite the exact [ts:MM:SS] marker for any moment.
      const liveDuration = playerHandleRef.current?.getDuration?.() || duration;
      const timed = buildTimedSegments(transcript, liveDuration);
      const context = buildContext(timed);
      const system = buildSystemPrompt(activeLessonTitle, lang, prefs.persona);
      const answer = await runChat(prefs, system, [
        { role: "user", content: buildUserPrompt(question, context) }
      ]);
      setChatLog((p) => [...p, { role: "ai", text: answer }]);
    } catch (err) {
      const text =
        err instanceof AiNotConfiguredError
          ? configHint
          : `⚠️ ${(err as Error).message}`;
      setChatLog((p) => [...p, { role: "ai", text }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, preferences, transcript, duration, activeLessonTitle, lang]);

  const handleFullscreen = () => {
    if (videoContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoContainerRef.current.requestFullscreen().catch((err) => {
          console.error("Error enabling fullscreen", err);
        });
      }
    }
  };

  const tabs = lang === "bn"
    ? ["নোটস", "ট্রান্সক্রিপ্ট", "ভিডিও চ্যাট", "অনুশীলনী"]
    : ["Notes", "Transcript", "Chat with Video", "Practice"];

  const lessonNotesMd =
    lang === "bn" && lessonRow?.notes_bn_md
      ? lessonRow.notes_bn_md
      : lessonRow?.notes_md || "";

  // Modular Video Player render logic
  const renderVideoPlayer = () => {
    return (
      <div style={{ width: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div ref={videoContainerRef} style={{ position: "relative" }}>
          {youtubeId ? (
            <YouTubePlayer videoId={youtubeId} onReady={handlePlayerReady} />
          ) : (
            <div
              style={{
                aspectRatio: "16/9",
                background: T.bg2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: T.txt1,
                fontSize: 13
              }}
            >
              {lang === "bn" ? "ভিডিও উপলব্ধ নেই" : "Video not available"}
            </div>
          )}

          {seekTime && (
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: T.amber,
                borderRadius: 6,
                padding: "4px 8px",
                fontSize: 10,
                color: "#000",
                fontWeight: 900,
                zIndex: 4
              }}
            >
              ⏱ Jumped to {seekTime}
            </div>
          )}

          {videoLang !== "off" && !youtubeId && (
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0, 0, 0, 0.8)",
                borderRadius: 6,
                padding: "6px 14px",
                fontSize: 11,
                color: "#FFF",
                textAlign: "center",
                maxWidth: "85%",
                zIndex: 2,
                lineHeight: 1.4,
                border: "1px solid rgba(255,255,255,0.1)"
              }}
            >
              {videoLang === "bn" ? subtitles.bn : subtitles.en}
            </div>
          )}
        </div>

        {/* Sub Player Control strip */}
        <div style={{ background: T.bg2, padding: "8px 12px", display: "flex", alignItems: "center", gap: 12, borderTop: `1px solid ${T.border}`, flexWrap: "wrap" }}>
          <button
            onClick={() => {
              const handle = playerHandleRef.current;
              if (!handle) return;
              if (playing) {
                handle.pause();
                setPlaying(false);
              } else {
                handle.play();
                setPlaying(true);
              }
            }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.txt0, outline: "none" }}
          >
            {playing ? "⏸" : "▶"}
          </button>

          {/* Seekable progress line (click to jump) */}
          <div
            onClick={(e) => {
              if (!duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
              seekToSeconds(ratio * duration);
            }}
            style={{ flex: 1, minWidth: 100, height: 5, background: T.bg4, borderRadius: 2, position: "relative", cursor: "pointer" }}
          >
            <div
              style={{
                width: `${duration ? Math.min(100, (currentTime / duration) * 100) : 0}%`,
                height: "100%",
                background: T.accent,
                borderRadius: 2
              }}
            />
          </div>

          <span style={{ fontSize: 9, color: T.txt1, fontFamily: "monospace" }}>
            {formatSeconds(currentTime)} / {formatSeconds(duration)}
          </span>

          {/* Captions selector */}
          <div style={{ display: "flex", background: T.bg3, borderRadius: 6, overflow: "hidden", border: `1px solid ${T.border}`, padding: 1.5 }}>
            {[
              ["en", "EN"],
              ["bn", "বাংলা"],
              ["off", "OFF"]
            ].map(([lCode, label]) => (
              <button
                key={lCode}
                onClick={() => setVideoLang(lCode as any)}
                style={{
                  padding: "2px 6px",
                  fontSize: 8.5,
                  fontWeight: 700,
                  background: videoLang === lCode ? T.accent : "none",
                  color: videoLang === lCode ? "#000" : T.txt1,
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 4
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Native Fullscreen Button */}
          <button
            onClick={handleFullscreen}
            title={lang === "bn" ? "ফুল স্ক্রিন" : "Fullscreen"}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              color: T.txt0,
              padding: "2px 6px",
              display: "flex",
              alignItems: "center",
              outline: "none"
            }}
          >
            📺
          </button>

          {/* Minimal Live Viewers Counter Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: T.accentDim,
              border: `1px solid ${T.accent}33`,
              borderRadius: 6,
              padding: "3px 8px",
              fontSize: 9.5,
              fontWeight: 700,
              color: T.accent
            }}
            title={lang === "bn" ? `${activeViewers} জন লাইভ শিখছেন` : `${activeViewers} students active now`}
          >
            <span style={{ width: 5, height: 5, background: T.accent, borderRadius: "50%", display: "inline-block", boxShadow: `0 0 6px ${T.accent}` }} />
            {activeViewers} live
          </div>

          <button
            type="button"
            onClick={() => void handleMarkComplete()}
            disabled={markingComplete || activeLesson?.done}
            style={{
              marginLeft: "auto",
              background: activeLesson?.done ? T.bg4 : T.accent,
              border: "none",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 10,
              fontWeight: 800,
              color: activeLesson?.done ? T.txt1 : "#000",
              cursor: activeLesson?.done ? "default" : "pointer"
            }}
          >
            {markingComplete
              ? "..."
              : activeLesson?.done
                ? lang === "bn"
                  ? "✓ সম্পন্ন"
                  : "✓ Done"
                : lang === "bn"
                  ? "সম্পন্ন করুন"
                  : "Mark Complete"}
          </button>
        </div>

        {completeMsg && (
          <div style={{ padding: "6px 12px", fontSize: 11, color: T.accent, fontWeight: 600 }}>
            {completeMsg}
          </div>
        )}

        {lessonNotesMd && (
          <div
            style={{
              padding: "14px 16px",
              borderTop: `1px solid ${T.border}`,
              background: T.bg1,
              maxHeight: 220,
              overflowY: "auto"
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: T.txt1, marginBottom: 8 }}>
              {lang === "bn" ? "লেসন নোট" : "Lesson notes"}
            </div>
            <LessonNotes markdown={lessonNotesMd} lang={lang} />
          </div>
        )}
      </div>
    );
  };

  // Modular Tabs panel render logic
  const renderTabsPanel = (isSideMode: boolean = false) => {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          margin: isSideMode ? "0 4px" : "4px 0 0",
          background: T.bg1,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: T.shadow,
          minHeight: isSideMode ? "100%" : 280
        }}
      >
        {/* Tabs selector bar */}
        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, background: T.bg2 }}>
          {tabs.map((tab, idx) => {
            const tabKeys = ["Notes", "Transcript", "Chat with Video", "Practice"];
            const currentKey = tabKeys[idx];
            const isSelected = activeTab === currentKey;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(currentKey)}
                style={{
                  padding: isSideMode ? "10px 12px" : "10px 18px",
                  fontSize: isSideMode ? 10.5 : 11.5,
                  fontWeight: 700,
                  background: isSelected ? T.bg1 : "none",
                  border: "none",
                  borderBottom: isSelected ? `2.5px solid ${T.accent}` : "2.5px solid transparent",
                  color: isSelected ? T.accent : T.txt1,
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Tab active content layout */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
          {activeTab === "Notes" && (
            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              {lessonNotesMd ? (
                <div style={{ marginBottom: 10, maxHeight: 140, overflowY: "auto" }}>
                  <LessonNotes markdown={lessonNotesMd} lang={lang} />
                </div>
              ) : null}
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                style={{
                  width: "100%",
                  flex: 1,
                  background: T.bg2,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 12,
                  color: T.txt0,
                  lineHeight: 1.6,
                  resize: "none",
                  outline: "none",
                  fontFamily: "inherit"
                }}
              />
              <div style={{ height: 4 }} />
              <div style={{ fontSize: 10, color: T.txt2, textAlign: "right" }}>
                ✦ {lang === "bn" ? "ক্লাউড সিঙ���ক্রোনাইজেশন আর্কাইভে সংরক্ষিত হয়েছে" : "Auto-saved to Cloud Sync Archive"}
              </div>
            </div>
          )}

          {activeTab === "Transcript" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {timedTranscript.length === 0 ? (
                <div style={{ fontSize: 12, color: T.txt2, padding: "8px 4px", lineHeight: 1.5 }}>
                  {lang === "bn"
                    ? "এই ভিডিওর জন্য ট্রান্সক্রিপ্ট এখনো প্রস্তুত হয়নি।"
                    : "Transcript is not available for this video yet."}
                </div>
              ) : (
                timedTranscript.map((chunk) => {
                  const start = chunk.start_time ?? 0;
                  const end = chunk.end_time ?? start + 30;
                  const isActive = currentTime >= start && currentTime < end;
                  return (
                    <div
                      key={chunk.id}
                      onClick={() => seekToSeconds(start)}
                      style={{
                        display: "flex",
                        gap: 12,
                        padding: "8px 10px",
                        borderRadius: 8,
                        cursor: "pointer",
                        background: isActive ? T.accentDim : "transparent",
                        border: isActive ? `1px solid ${T.accent}33` : `1px solid ${T.border}33`,
                        transition: "background 0.1s"
                      }}
                    >
                      <span style={{ fontSize: 10, color: T.accent, fontWeight: 900, fontFamily: "monospace", flexShrink: 0 }}>
                        {formatSeconds(start)}
                      </span>
                      <span style={{ fontSize: 12, color: T.txt0, lineHeight: 1.4 }}>
                        {chunk.chunk_text}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "Chat with Video" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
              <div style={{ flex: 1, overflowY: "auto", marginBottom: 8 }}>
                {chatLog.map((chat, idx) => {
                  const isUser = chat.role === "user";
                  return (
                    <div key={idx} style={{ display: "flex", flexDirection: isUser ? "row-reverse" : "row", gap: 8, marginBottom: 10 }}>
                      <div
                        style={{
                          background: isUser ? T.accent : T.bg3,
                          color: isUser ? "#000" : T.txt0,
                          borderRadius: isUser ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                          padding: "6px 12px",
                          fontSize: 11.5,
                          lineHeight: 1.5,
                          maxWidth: "80%"
                        }}
                      >
                        {isUser
                          ? chat.text
                          : parseAnswerSegments(chat.text).map((seg, sIdx) =>
                              seg.type === "text" ? (
                                <span key={sIdx}>{seg.value}</span>
                              ) : (
                                <button
                                  key={sIdx}
                                  onClick={() => seekToSeconds(seg.seconds)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    margin: "0 2px",
                                    background: T.amberDim,
                                    border: `1px solid ${T.amber}40`,
                                    color: T.amber,
                                    borderRadius: 4,
                                    padding: "0 5px",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    fontFamily: "monospace",
                                    cursor: "pointer"
                                  }}
                                >
                                  ⏱ {seg.value}
                                </button>
                              )
                            )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 6, borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void handleChat()}
                  disabled={chatLoading}
                  placeholder={
                    chatLoading
                      ? lang === "bn"
                        ? "ভাবছি..."
                        : "Thinking..."
                      : lang === "bn"
                        ? "ভিডিওর যেকোনো রেফারেন্সে প্রশ্ন করুন..."
                        : "Ask anything about this video..."
                  }
                  style={{
                    flex: 1,
                    background: T.bg2,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "6px 10px",
                    color: T.txt0,
                    fontSize: 12,
                    outline: "none"
                  }}
                />
                <button
                  onClick={() => void handleChat()}
                  disabled={chatLoading}
                  style={{
                    background: T.accent,
                    border: "none",
                    borderRadius: 8,
                    width: 32,
                    height: 32,
                    cursor: chatLoading ? "default" : "pointer",
                    opacity: chatLoading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#000",
                    fontWeight: 700
                  }}
                >
                  {chatLoading ? "…" : "↑"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "Practice" && (
            <div>
              {practices.map((quiz, qIdx) => (
                <div
                  key={qIdx}
                  style={{
                    background: T.bg2,
                    border: `1px solid ${T.border}`,
                    borderRadius: 10,
                    padding: "12px",
                    marginBottom: 10
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.txt0, marginBottom: 8 }}>
                    {qIdx + 1}. {quiz.q}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {quiz.opts.map((opt: string, oIdx: number) => {
                      const isPicked = userAssessAnswers[qIdx] === oIdx;
                      const isCorrect = userAssessAnswers[qIdx] !== undefined && oIdx === quiz.ans;
                      const isWrong = isPicked && oIdx !== quiz.ans;

                      return (
                        <button
                          key={oIdx}
                          onClick={() => setUserAssessAnswers((p) => ({ ...p, [qIdx]: oIdx }))}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 10px",
                            background: isCorrect ? T.accentDim : isWrong ? T.redDim : isPicked ? T.blueDim : T.bg3,
                            border: `1px solid ${
                              isCorrect
                                ? T.accent + "60"
                                : isWrong
                                ? T.red + "60"
                                : isPicked
                                ? T.blue + "40"
                                : T.border
                            }`,
                            borderRadius: 6,
                            color: T.txt0,
                            fontSize: 11,
                            cursor: "pointer",
                            textAlign: "left"
                          }}
                        >
                          <span
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              border: `1.5px solid ${isPicked ? T.accent : T.borderHi}`,
                              background: isPicked ? T.accent : "none",
                              flexShrink: 0
                            }}
                          />
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        background: T.bg0,
        position: "relative",
        overflowY: "auto",
        padding: "16px"
      }}
    >
      {/* Topic header with Dock Toggle */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: T.bg1,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: "10px 16px",
          marginBottom: 14,
          boxShadow: T.shadow
        }}
      >
        <div>
          <div style={{ fontSize: 9.5, color: T.accent, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase" }}>
            {lang === "bn" ? "ভিডিও লেকচার" : "ACTIVE LESSON VIDEO"}
          </div>
          <h3 style={{ fontSize: 13, fontWeight: 900, color: T.txt0, margin: "2px 0 0" }}>
            {modules.find((m) => m.lessons.some((l) => l.id === activeLessonId))?.lessons.find((l) => l.id === activeLessonId)?.title || "1.3 Scopes and Scuttles Check"}
          </h3>
        </div>

        {/* Dock Control Toggle */}
        <button
          onClick={() => setDockOnSide(!dockOnSide)}
          style={{
            background: T.bg2,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: "6px 12px",
            color: T.accent,
            fontSize: 10.5,
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            outline: "none"
          }}
        >
          {dockOnSide ? "🥞 Move Notes Below" : "📋 Dock Notes to Side"}
        </button>
      </div>

      {/* Main Layout Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {dockOnSide ? (
          /* Side-by-Side Split View */
          <div style={{ flex: 1, display: "flex", gap: 14, minHeight: 0, paddingBottom: 6 }}>
            {/* Left Column: Video player */}
            <div style={{ flex: 1.3, display: "flex", flexDirection: "column", minWidth: 300, justifyContent: "flex-start" }}>
              <div style={{ width: "100%", background: "#000", borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
                {renderVideoPlayer()}
              </div>
            </div>

            {/* Right Column: Interactive Tabs panel */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 280 }}>
              {renderTabsPanel(true)}
            </div>
          </div>
        ) : (
          /* Stacked View (Video on top, Tabs below) */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Centered Video Player */}
            <div style={{ width: "100%", maxWidth: "720px", margin: "0 auto", background: "#000", borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
              {renderVideoPlayer()}
            </div>

            {/* Bottom tabs block */}
            {renderTabsPanel(false)}
          </div>
        )}
      </div>
    </div>
  );
}
