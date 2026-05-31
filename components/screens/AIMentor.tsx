"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/types/ui";
import { useAppTheme } from "@/components/providers/app-theme-provider";
import { runChat, isAiConfigured, AiNotConfiguredError, type AiPrefs, getAiPrefsLocal } from "@/lib/ai/byoa";

interface Session {
  id: string;
  title: string;
  subtitle: string;
  messages: ChatMessage[];
}

const createInitialSessions = (lang: string): Session[] => [
  {
    id: "scope-today",
    title: lang === "bn" ? "ফাংশন ও স্কোপ" : "Functions & Scope",
    subtitle: lang === "bn" ? "আজকে" : "Today",
    messages: [
      {
        role: "ai",
        text: lang === "bn"
          ? "আমি আপনার ফিক্সেথ এআই মেন্টর। আমি আপনার অগ্রগতি, আপনার চ্যালেঞ্জ এবং আপনার লক্ষ্যগুলো জানি। আজ আপনি কি শিখতে চান?"
          : "I'm your Fixeth AI Mentor. I know your progress, your struggles, and your goals. What would you like to work on today?"
      },
      {
        role: "ai",
        text: lang === "bn"
          ? "বর্তমান বিষয়: লেসন ৩ (ফাংশন ও স্কোপ)। আপনি শেষ কুইজে ৯২% স্কোর করেছেন — চমৎকার কাজ! আপনি ৩ বার 'return' স্টেটমেন্ট সম্পর্কে জিজ্ঞাসা করেছেন — চলুন এটি নিয়ে আপনাকে আরও গভীরে আলোচনা করি।"
          : "Current context: You're on Lesson 3 (Functions & Scope). You scored 92% on the last quiz — excellent work! You've asked about `return` statements 3 times — let me give you a deeper explanation."
      }
    ]
  },
  {
    id: "control-flow",
    title: lang === "bn" ? "কন্ট্রোল ফ্লো রিভিউ" : "Control Flow review",
    subtitle: lang === "bn" ? "গতকাল" : "Yesterday",
    messages: [
      {
        role: "user",
        text: "How does `elif` block execute program instructions sequentially?"
      },
      {
        role: "ai",
        text: "In Python, the `elif` keyword stands for 'else if'. The interpreter evaluates expressions from top to bottom. Once a condition is true, its block runs and all subsequent checks evaluate as skipped."
      }
    ]
  },
  {
    id: "variables-dive",
    title: lang === "bn" ? "ভ্যারিয়েবলস ডিপ ডাইভ" : "Variables deep dive",
    subtitle: lang === "bn" ? "২৪ মে" : "May 24",
    messages: [
      {
        role: "user",
        text: "What does local vs global mean?"
      },
      {
        role: "ai",
        text: "Local variables live inside function frames and allocate on stack when called. Global variables reside in globals() mapping of modules and persist for runtime lifespan."
      }
    ]
  }
];

export default function AIMentorScreen({
  T,
  t,
  lang,
  aiMsgs,
  setAiMsgs
}: {
  T: any;
  t: any;
  lang: string;
  aiMsgs: ChatMessage[];
  setAiMsgs: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}) {
  const { preferences } = useAppTheme();
  const [cognitiveLevel, setCognitiveLevel] = useState<"ELI5" | "Student" | "Pro" | "Research">("Student");
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // States for Right-hand Sandbox Panel
  const [activeRightTab, setActiveRightTab] = useState<"memory" | "cognitive">("memory");
  const [newMemoryText, setNewMemoryText] = useState("");
  const [selectedCognitiveNode, setSelectedCognitiveNode] = useState<"builtin" | "global" | "local" | "return">("local");
  const [memories, setMemories] = useState<Array<{ id: string; type: "STRENGTH" | "STRUGGLE" | "PREFERENCE" | "MILESTONE"; text: string; textBn: string }>>([
    {
      id: "mem-1",
      type: "STRENGTH",
      text: "Scored 92% on previous Scope & Scuttles assessment",
      textBn: "পূর্ববর্তী স্কোপ এবং স্কুটলস কুইজে ৯২% স্কোর করেছেন"
    },
    {
      id: "mem-2",
      type: "STRUGGLE",
      text: "Asked about functional return statements 3 separate times",
      textBn: "ফাংশনাল রিটার্ন স্টেটমেন্ট সম্পর্কে ৩ বার প্রশ্ন করেছেন"
    },
    {
      id: "mem-3",
      type: "PREFERENCE",
      text: "Responds exceptionally well to ELI5 real world analogies",
      textBn: "বাস্তব জীবনের সহজ উদাহরণ এবং উপমা দিয়ে বুঝতে পছন্দ করেন"
    },
    {
      id: "mem-4",
      type: "MILESTONE",
      text: "Completed Module 1: Python Scopes & Logic",
      textBn: "মডিউল ১: পাইথন স্কোপ এবং লজিক সফলভাবে শেষ করেছেন"
    }
  ]);

  const [sessions, setSessions] = useState<Session[]>(() => createInitialSessions(lang));

  const [activeSessionId, setActiveSessionId] = useState<string>("scope-today");

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    setSessions(createInitialSessions(lang));
    setActiveSessionId("scope-today");
  }, [lang]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession.messages]);

  // Handle adding a new conversation session
  const handleNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSess: Session = {
      id: newId,
      title: lang === "bn" ? "নতুন সেশন" : "New AI Conversation",
      subtitle: lang === "bn" ? "এখনই" : "Just now",
      messages: [
        {
          role: "ai",
          text: lang === "bn"
            ? "সালাম! আপনার পছন্দের টপিক নিয়ে প্রশ্ন করুন। আমি আপনার সম্পূর্ণ কোডবেস বিশ্লেষণ করছি।"
            : "Hello! Feel free to ask any question regarding python frameworks, algorithms, or active homework sets. I'm ready to tutor!"
        }
      ]
    };
    setSessions((prev) => [newSess, ...prev]);
    setActiveSessionId(newId);
  };

  // Append a message to the active session.
  const appendToSession = (msg: ChatMessage) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId ? { ...s, messages: [...s.messages, msg] } : s
      )
    );
  };

  const cognitiveInstruction: Record<typeof cognitiveLevel, string> = {
    ELI5: "Explain like I'm 5 using simple, everyday analogies. Avoid jargon.",
    Student: "Explain at an undergraduate student level with clear examples.",
    Pro: "Answer for an experienced professional. Be precise and technical.",
    Research: "Answer at a research level with depth, nuance and references to underlying mechanics."
  };

  // Real AI response via the learner's own key (BYOA). Falls back to a helpful
  // message when no key is configured in Settings.
  const handleSend = async (overrideText?: string) => {
    const text = (overrideText || chatInput).trim();
    if (!text || sending) return;
    if (!overrideText) setChatInput("");

    appendToSession({ role: "user", text });

    const local = getAiPrefsLocal();
    const prefs = { ...(preferences.ai as any), ...(local as any) } as AiPrefs;
    if (!isAiConfigured(prefs)) {
      appendToSession({
        role: "ai",
        text:
          lang === "bn"
            ? "এআই মেন্টর চালু করতে সেটিংস → AI মেন্টর-এ আপনার নিজের API কী যুক্ত করুন (BYOA)।"
            : "Add your own API key in Settings → AI Mentor (BYOA) to enable the AI Mentor."
      });
      return;
    }

    setSending(true);
    const system = [
      "You are Fixeth's personal AI Mentor for an IT-placement learner.",
      "You know the learner is currently on the Functions & Scope module.",
      cognitiveInstruction[cognitiveLevel],
      lang === "bn" ? "Respond in Bengali (বাংলা)." : "Respond in clear English.",
      "Be encouraging and concrete. Use short code snippets when helpful."
    ].join(" ");

    try {
      const history = activeSession.messages.map((m) => ({
        role: (m.role === "ai" ? "assistant" : "user") as "assistant" | "user",
        content: m.text
      }));
      const answer = await runChat(prefs, system, [
        ...history,
        { role: "user", content: text }
      ]);
      appendToSession({ role: "ai", text: answer });
    } catch (err) {
      const msg =
        err instanceof AiNotConfiguredError
          ? lang === "bn"
            ? "এআই কনফিগার করা নেই। সেটিংসে গিয়ে আপনার API কী যুক্ত করুন।"
            : "AI is not configured. Add your API key in Settings."
          : err instanceof Error
            ? err.message
            : "Something went wrong contacting the AI.";
      appendToSession({ role: "ai", text: msg });
    } finally {
      setSending(false);
    }
  };

  const prompts = [
    { label: lang === "bn" ? "সহজ করে বুঝাও" : "Explain this", text: "Explain this clearly" },
    { label: lang === "bn" ? "৫টি কুইজ প্রশ্ন" : "Generate 5 questions", text: "Give me 5 questions about scope" },
    { label: lang === "bn" ? "সামারি" : "Summarize video", text: "Summarize the active lesson video for me" },
    { label: lang === "bn" ? "কোড উদাহরণ" : "Code example", text: "Show me a function return code example" },
    { label: lang === "bn" ? "সামনে কী" : "What's next?", text: "What should I learn next in this module?" }
  ];

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, background: T.bg0 }}>
      
      {/* 1. LEFT SESSIONS SIDEBAR SIDE PANEL */}
      <div
        style={{
          width: 220,
          background: T.bg2,
          borderRight: `1px solid ${T.border}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0
        }}
      >
        <div style={{ padding: "18px 16px 10px 16px", fontSize: 10, color: "#6b7280", fontWeight: 800, letterSpacing: "1.5px" }}>
          SESSIONS
        </div>
        
        {/* Session history items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 14px" }}>
          {sessions.map((sess) => {
            const isActive = sess.id === activeSessionId;
            return (
              <div
                key={sess.id}
                onClick={() => setActiveSessionId(sess.id)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: isActive ? "rgba(16, 185, 129, 0.08)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(16, 185, 129, 0.25)" : "transparent"}`,
                  cursor: "pointer",
                  marginBottom: 6,
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: "bold", color: isActive ? "#10b981" : "#d1d5db" }}>
                  {sess.title}
                </div>
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>
                  {sess.subtitle}
                </div>
              </div>
            );
          })}
        </div>

        {/* Clear bottom + New Session trigger */}
        <div style={{ padding: "12px 14px", borderTop: "1px solid #1e2230", background: "#080a11" }}>
          <button
            onClick={handleNewSession}
            style={{
              width: "100%",
              background: "#161b2c",
              border: "1px solid #283046",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#e5e7eb",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
              textAlign: "center"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#21283f";
              e.currentTarget.style.borderColor = "#38bdf8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#161b2c";
              e.currentTarget.style.borderColor = "#283046";
            }}
          >
            + {lang === "bn" ? "নতুন সেশন" : "New Session"}
          </button>
        </div>
      </div>

      {/* 2. MAIN CENTER CHAT WORKSPACE (SPACIOUS WIDE PANORAMA) */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0c0e17" }}>

        {/* TOP COMPONENT HEADER BLOCK WITH COGNITIVE SELECTORS */}
        <div
          style={{
            padding: "14px 24px",
            borderBottom: "1px solid #1e2230",
            background: "#0c0e17",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0
          }}
        >
          {/* Online info */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#0a231c",
                border: "1.5px solid rgba(16, 185, 129, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#10b981",
                boxShadow: "0 0 10px rgba(16, 185, 129, 0.15)"
              }}
            >
              <span style={{ fontSize: 16 }}>✦</span>
            </div>
            <div>
              <h2 style={{ fontSize: 14.5, fontWeight: "bold", color: "#ffffff", margin: 0 }}>
                {lang === "bn" ? "এআই মেন্টর" : "AI Mentor"}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 6px #10b981" }} />
                <span style={{ fontSize: 10.5, color: "#10b981", fontWeight: 700 }}>
                  Online · Context: Lesson 3 — Functions & Scope
                </span>
              </div>
            </div>
          </div>

          {/* ELI5, Student, Pro, Research Selectors inline tab header */}
          <div style={{ display: "flex", background: "#131722", borderRadius: 8, overflow: "hidden", border: "1px solid #1e2230", padding: 2 }}>
            {(["ELI5", "Student", "Pro", "Research"] as const).map((level) => {
              const isActive = cognitiveLevel === level;
              return (
                <button
                  key={level}
                  onClick={() => setCognitiveLevel(level)}
                  style={{
                    padding: "4px 12px",
                    fontSize: 10,
                    fontWeight: 800,
                    cursor: "pointer",
                    background: isActive ? "#00b887" : "transparent",
                    color: isActive ? "#000000" : "#9ca3af",
                    border: "none",
                    borderRadius: 6,
                    transition: "all 0.1s ease"
                  }}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. CONTEXT BADGES IMMOBILIZED BENEATH HEADER */}
        <div
          style={{
            padding: "12px 24px 6px 24px",
            background: "#0c0e17",
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            flexShrink: 0
          }}
        >
          {/* Functions & Scope Badge */}
          <div
            style={{
              background: "rgba(59, 130, 246, 0.12)",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              borderRadius: "8px",
              padding: "5px 12px",
              fontSize: "11px",
              fontWeight: 800,
              color: "#60a5fa",
              display: "flex",
              alignItems: "center",
              gap: 5
            }}
          >
            📹 {lang === "bn" ? "ফাংশন ও স্কোপ" : "Functions & Scope"}
          </div>

          {/* DS Track - Module 1 Badge */}
          <div
            style={{
              background: "rgba(139, 92, 246, 0.12)",
              border: "1px solid rgba(139, 92, 246, 0.4)",
              borderRadius: "8px",
              padding: "5px 12px",
              fontSize: "11px",
              fontWeight: 800,
              color: "#c084fc",
              display: "flex",
              alignItems: "center",
              gap: 5
            }}
          >
            🗺️ {lang === "bn" ? "ডিএস ট্র্যাক - মডিউল ১" : "DS Track · Module 1"}
          </div>

          {/* Quiz score indicator Badge */}
          <div
            style={{
              background: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              borderRadius: "8px",
              padding: "5px 12px",
              fontSize: "11px",
              fontWeight: 800,
              color: "#f59e0b",
              display: "flex",
              alignItems: "center",
              gap: 5
            }}
          >
            🏆 {lang === "bn" ? "কুইজ গড়: ৮৭%" : "Quiz avg: 87%"}
          </div>
        </div>

        {/* 4. DIALOG SCROLL MESSAGING AREA */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          {activeSession.messages.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: isUser ? "row-reverse" : "row",
                  gap: 12,
                  alignItems: "flex-start"
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "#0a231c",
                      border: "1px solid rgba(16, 185, 129, 0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      color: "#10b981",
                      flexShrink: 0,
                      marginTop: 2
                    }}
                  >
                    ✦
                  </div>
                )}
                
                <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
                  <div
                    style={{
                      background: isUser ? "#00b887" : "#1a1d29",
                      color: isUser ? "#000000" : "#e5e7eb",
                      borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      padding: "12px 16px",
                      fontSize: "12.5px",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      border: isUser ? "none" : "1px solid rgba(255, 255, 255, 0.05)",
                      fontWeight: isUser ? "bold" : "normal",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* 5. FOOTER QUICK SUGGESTIONS ROW */}
        <div
          style={{
            padding: "10px 24px",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            background: "#0c0e17",
            borderTop: "1px solid #131722",
            flexShrink: 0
          }}
        >
          {prompts.map((p) => (
            <button
              key={p.label}
              onClick={() => handleSend(p.text)}
              style={{
                padding: "6px 14px",
                fontSize: 11,
                borderRadius: 16,
                background: "#131622",
                border: "1px solid #232a3f",
                color: "#9ca3af",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.1s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.borderColor = "#00b887";
                e.currentTarget.style.background = "#1a2135";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#9ca3af";
                e.currentTarget.style.borderColor = "#232a3f";
                e.currentTarget.style.background = "#131622";
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* 6. INPUT KEYBOARD CHAT TERMINAL */}
        <div
          style={{
            padding: "14px 24px 20px 24px",
            display: "flex",
            gap: 12,
            borderTop: "1px solid #1e2230",
            background: "#0c0e17",
            flexShrink: 0
          }}
        >
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={lang === "bn" ? "মেন্টরকে যেকোনো প্রশ্ন করুন..." : "Ask me anything..."}
            style={{
              flex: 1,
              background: "#080a11",
              border: "1px solid #1e2230",
              borderRadius: 8,
              padding: "10px 16px",
              color: "#ffffff",
              fontSize: 12.5,
              outline: "none",
              transition: "border-color 0.15s"
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#00b887";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#1e2230";
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={sending}
            style={{
              background: "#00b887",
              border: "none",
              borderRadius: "50%",
              width: 38,
              height: 38,
              color: "#000000",
              fontSize: 16,
              fontWeight: "bold",
              cursor: sending ? "not-allowed" : "pointer",
              opacity: sending ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0, 184, 135, 0.25)"
            }}
          >
            {sending ? "…" : "↑"}
          </button>
        </div>

      </div>

      {/* 3. RIGHT SIDE PANEL: MEMORY & COGNITIVE TREE SANDBOX */}
      <div
        style={{
          width: 330,
          background: "#080a11",
          borderLeft: "1px solid #1e2230",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0
        }}
      >
        {/* Tab switch header */}
        <div style={{ display: "flex", borderBottom: "1px solid #1e2230", background: "#0c0e17" }}>
          <button
            onClick={() => setActiveRightTab("memory")}
            style={{
              flex: 1,
              padding: "14px 10px",
              background: activeRightTab === "memory" ? "rgba(16, 185, 129, 0.05)" : "transparent",
              border: "none",
              borderBottom: `2px solid ${activeRightTab === "memory" ? "#00b887" : "transparent"}`,
              color: activeRightTab === "memory" ? "#00b887" : "#8892b0",
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: "0.5px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              outline: "none"
            }}
          >
            🧠 {lang === "bn" ? "মেমোরি ফ্রেম" : "Memory Frame"}
          </button>
          <button
            onClick={() => setActiveRightTab("cognitive")}
            style={{
              flex: 1,
              padding: "14px 10px",
              background: activeRightTab === "cognitive" ? "rgba(16, 185, 129, 0.05)" : "transparent",
              border: "none",
              borderBottom: `2px solid ${activeRightTab === "cognitive" ? "#00b887" : "transparent"}`,
              color: activeRightTab === "cognitive" ? "#00b887" : "#8892b0",
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: "0.5px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              outline: "none"
            }}
          >
            🌳 {lang === "bn" ? "কগনিটিভ ট্রি" : "Cognitive Tree"}
          </button>
        </div>

        {/* Tab contents */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column" }}>
          {activeRightTab === "memory" ? (
            /* MEMORY TAB */
            <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
              <div>
                <h3 style={{ fontSize: 13, color: "#ffffff", fontWeight: 700, margin: "0 0 4px 0" }}>
                  {lang === "bn" ? "মেন্টর মেমরি ব্যাংক" : "Mentor Memory Profiling"}
                </h3>
                <p style={{ fontSize: 10.5, color: "#8892b0", lineHeight: 1.4, margin: 0 }}>
                  {lang === "bn" ? "মেন্টর রিয়েল-টাইমে আপনার কাজের অগ্রগতি এবং দুর্বলতাগুলো ট্র্যাক করছে।" : "Live contextual metadata synthesized during your active sessions to optimize explanation density."}
                </p>
              </div>

              {/* Memory node list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {memories.map((mem) => {
                  let color = "#10b981";
                  let bg = "rgba(16, 185, 129, 0.08)";
                  let border = "rgba(16, 185, 129, 0.2)";
                  if (mem.type === "STRUGGLE") {
                    color = "#f43f5e";
                    bg = "rgba(244, 63, 94, 0.08)";
                    border = "rgba(244, 63, 94, 0.2)";
                  } else if (mem.type === "PREFERENCE") {
                    color = "#00bcd4";
                    bg = "rgba(0, 188, 212, 0.08)";
                    border = "rgba(0, 188, 212, 0.2)";
                  } else if (mem.type === "MILESTONE") {
                    color = "#fbbf24";
                    bg = "rgba(251, 191, 36, 0.08)";
                    border = "rgba(251, 191, 36, 0.2)";
                  }

                  return (
                    <div
                      key={mem.id}
                      style={{
                        background: bg,
                        border: `1px solid ${border}`,
                        borderRadius: "8px",
                        padding: "10px 12px",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 9, color: color, fontWeight: 900, letterSpacing: "1.2px" }}>
                          {mem.type}
                        </span>
                        <button
                          onClick={() => setMemories(p => p.filter(m => m.id !== mem.id))}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#8892b0",
                            cursor: "pointer",
                            fontSize: 11,
                            padding: "0 2px"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "#f43f5e"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "#8892b0"}
                          title="Erase Memory"
                        >
                          ✕
                        </button>
                      </div>
                      <span style={{ fontSize: 11, color: "#ccd6f6", lineHeight: 1.4 }}>
                        {lang === "bn" ? mem.textBn : mem.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Memory Block */}
              <div style={{ marginTop: "auto", borderTop: "1px solid #1e2230", paddingTop: 14 }}>
                <span style={{ fontSize: 10, color: "#8892b0", fontWeight: 800, display: "block", marginBottom: 6 }}>
                  {lang === "bn" ? "মেমোরি ট্যাগ যোগ করুন" : "INJECT CUSTOM MEMORY"}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    value={newMemoryText}
                    onChange={(e) => setNewMemoryText(e.target.value)}
                    placeholder={lang === "bn" ? "যেমন: কোড দিয়ে বুঝাতে ভালোবাসেন" : "e.g. Always include type signatures"}
                    style={{
                      flex: 1,
                      background: "#0c0e17",
                      border: "1px solid #1e2230",
                      borderRadius: 6,
                      padding: "6px 10px",
                      fontSize: 11,
                      color: "#ffffff",
                      outline: "none"
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!newMemoryText.trim()) return;
                      const newNode = {
                        id: `id-${Date.now()}`,
                        type: "PREFERENCE" as const,
                        text: newMemoryText,
                        textBn: newMemoryText
                      };
                      setMemories(p => [...p, newNode]);
                      setNewMemoryText("");
                    }}
                    style={{
                      background: "#10b981",
                      border: "none",
                      borderRadius: 6,
                      color: "#000000",
                      fontWeight: "bold",
                      fontSize: 11,
                      padding: "0 12px",
                      cursor: "pointer"
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* COGNITIVE TREE TAB */
            <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
              <div>
                <h3 style={{ fontSize: 13, color: "#ffffff", fontWeight: 700, margin: "0 0 4px 0" }}>
                  {lang === "bn" ? "কগনিটিভ ট্রি স্যান্ডবক্স" : "Cognitive Lexical Tree"}
                </h3>
                <p style={{ fontSize: 10.5, color: "#8892b0", lineHeight: 1.4, margin: 0 }}>
                  {lang === "bn" ? "পাইথন কার্নেলের ভ্যারিয়েবল স্কোপিং হায়ারার্কি মানচিত্র।" : "Interactive execution tree of Python scope environments. Click environment levels to inspect lookup rules."}
                </p>
              </div>

              {/* Visualized Scope Hierarchy */}
              <div
                style={{
                  background: "#0c0e17",
                  border: "1px solid #1e2230",
                  borderRadius: 10,
                  padding: "12px 10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  alignItems: "stretch"
                }}
              >
                {[
                  {
                    id: "builtin",
                    name: "Built-in Scope",
                    nameBn: "বিল্ট-ইন স্কোপ",
                    desc: "Definitions like print(), len(). Always active.",
                    descBn: "প্রিন্ট এবং লেন ফাংশন। সর্বদা সক্রিয় থাকে।"
                  },
                  {
                    id: "global",
                    name: "Global Scope",
                    nameBn: "গ্লোবাল স্কোপ",
                    desc: "Declared at top module level. Persistent for lifetime.",
                    descBn: "প্রধান মডিউল এলাকা। আজীবন ভ্যালু স্টেপ করে।"
                  },
                  {
                    id: "local",
                    name: "Local Scope",
                    nameBn: "লোকাল স্কোপ",
                    desc: "Dynamic instance stacks that live inside definitions.",
                    descBn: "ফাংশন ফ্রেম। এটি শেষ হলেই ভৌত ভ্যারিয়েবল ধ্বংস হয়।"
                  },
                  {
                    id: "return",
                    name: "Return Channel",
                    nameBn: "রিটার্ন চ্যানেল",
                    desc: "Passes computed parameters safely out of local stacks.",
                    descBn: "লোকাল блок থেকে মান মূল কোড স্ট্যাকে ফেরত পাঠায়।"
                  }
                ].map((node) => {
                  const isSel = selectedCognitiveNode === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedCognitiveNode(node.id as any)}
                      style={{
                        padding: "8px 10px",
                        background: isSel ? "rgba(16, 185, 129, 0.08)" : "#080a11",
                        border: isSel ? "1px solid #10b981" : "1px solid #1e2230",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.1s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: 10
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: isSel ? "#10b981" : "#4b5563",
                          boxShadow: isSel ? "0 0 8px #10b981" : "none"
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: "bold", color: isSel ? "#10b981" : "#ccd6f6" }}>
                          {lang === "bn" ? node.nameBn : node.name}
                        </div>
                      </div>
                      <span style={{ fontSize: 10, color: "#8892b0" }}>
                        {isSel ? "● ACTIVE" : "▶"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Selected node descriptions */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 11.5,
                  lineHeight: 1.5,
                  color: "#d1d5db"
                }}
              >
                {selectedCognitiveNode === "builtin" && (
                  <div>
                    <strong style={{ color: "#10b981" }}>{lang === "bn" ? "বিল্ট-ইন এনভায়রনমেন্ট" : "Built-in Environment:"}</strong>
                    <p style={{ margin: "4px 0 0", color: "#8892b0", fontSize: 11 }}>
                      {lang === "bn"
                        ? "পাইথন ইন্টারপ্রেটার শুরু হওয়ার সাথে সাথে এই স্কোপ তৈরি হয়। এতে সমস্ত বিল্ট-ইন ফাংশন ও কি-ওয়ার্ড লোড থাকে।"
                        : "Loads automatically when Python initiates. Contains pre-defined keywords, functions like max() / print(), and standard runtime exceptions."}
                    </p>
                  </div>
                )}
                {selectedCognitiveNode === "global" && (
                  <div>
                    <strong style={{ color: "#10b981" }}>{lang === "bn" ? "গ্লোবাল মডিউল লেভেল" : "Global Module Level:"}</strong>
                    <p style={{ margin: "4px 0 0", color: "#8892b0", fontSize: 11 }}>
                      {lang === "bn"
                        ? "আপনার ফাইলে কোডের একদম বাইরে ডিক্লেয়ার করা ভ্যারিয়েবলগুলো হলো গ্লোবাল। এগুলো মডিউলের যে কোনো স্থান থেকে এক্সেসযোগ্য।"
                        : "Variables instantiated at the top line of a file. Accessible for read tasks in absolute segments, but write requests from local functions require 'global' token prefixes."}
                    </p>
                  </div>
                )}
                {selectedCognitiveNode === "local" && (
                  <div>
                    <strong style={{ color: "#10b981" }}>{lang === "bn" ? "লোকাল স্ট্যাক অ্যাক্টিভেশন" : "Local Stack Activation:"}</strong>
                    <p style={{ margin: "4px 0 0", color: "#8892b0", fontSize: 11 }}>
                      {lang === "bn"
                        ? "ফাংশন শুরু হওয়ার পর 'def' এর ভেতরে ভ্যারিয়েবল তৈরি হয়। ফাংশনের এক্সিকিউশন বা রান শেষ হওয়া মাত্রই এই মেমোরি খালি হয়ে যায়।"
                        : "Created exclusively during function block invocations. Scoped arguments live in active local execution registries and discard naturally after returning state."}
                    </p>
                  </div>
                )}
                {selectedCognitiveNode === "return" && (
                  <div>
                    <strong style={{ color: "#10b981" }}>{lang === "bn" ? "রিটার্ন বাউন্ডিং গেটওয়ে" : "Return Bounding Gateway:"}</strong>
                    <p style={{ margin: "4px 0 0", color: "#8892b0", fontSize: 11 }}>
                      {lang === "bn"
                        ? "ফাংশনের রিটার্ন কিওয়ার্ডটি অবজেক্ট রেফারেন্স বা রেজাল্ট ভ্যালু ব্যাক করে কলার ফ্রেমের কাছে পাঠিয়ে দেয়।"
                        : "Unbinds registry stacks and hands off targeted evaluation references back to the parent calling instruction pointers cleanly."}
                    </p>
                  </div>
                )}

                {/* Ask about this interactive block */}
                <button
                  onClick={() => {
                    let query = "";
                    if (selectedCognitiveNode === "builtin") {
                      query = lang === "bn" ? "বিল্ট-ইন স্কোপ এবং প্রিন্ট ফাংশনের কাজ কি বুঝাও" : "Explain Built-in scoping rules in python and how names are resolved.";
                    } else if (selectedCognitiveNode === "global") {
                      query = lang === "bn" ? "পাইথনে গ্লোবাল ভ্যারিয়েবল নিয়ে একটি প্রোগ্রাম দেখাও" : "Give me a python example demonstrating Global variables vs local variables shadowing.";
                    } else if (selectedCognitiveNode === "local") {
                      query = lang === "bn" ? "লোকাল স্কোপ কেন ব্যবহার করা উচিত এবং উদাহরণ দাও" : "What is local function scope and why shouldn't we abuse global namespace in python?";
                    } else {
                      query = lang === "bn" ? "রিটার্ন এবং প্রিন্ট এর পার্থক্য কি উদাহরণ সহ বলো" : "Compare return vs print inside python subroutines with functional code examples.";
                    }
                    setChatInput(query);
                  }}
                  style={{
                    width: "100%",
                    background: "#161b2c",
                    border: "1px solid #283046",
                    color: "#00b887",
                    borderRadius: 6,
                    padding: "8px 10px",
                    marginTop: 10,
                    fontSize: 11,
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.1s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#21283f"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#161b2c"}
                >
                  📝 {lang === "bn" ? "চ্যাটবক্সে এই টপিক ড্রাফট করুন" : "Draft prompt on this Topic"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
