"use client";

import React, { useEffect, useMemo, useState } from "react";
import { saveAiPrefsLocal, getAiPrefsLocal, removeAiPrefsLocal } from "@/lib/ai/byoa";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Database,
  Download,
  Languages,
  LayoutGrid,
  MoonStar,
  Palette,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Trash2,
  UserRound,
  Brain,
  Code,
  Award,
  Terminal,
  WifiOff,
  Eye,
  EyeOff
} from "lucide-react";
import { UserProfile, UserPreferences } from "@/types/ui";

type ScreenTab = "profile" | "codespace" | "mentor" | "credentials" | "data";

const SECTION_STYLE = {
  display: "grid",
  gap: 14
} as const;

export default function ProfileSettingsScreen({
  T,
  lang,
  isDark,
  user,
  preferences,
  initialTab,
  onBack,
  onSaveUser,
  onSavePreferences,
  onResetPreferences,
  onExportProfileData,
  onClearProfileData,
  onSetLang,
  onToggleTheme
}: {
  T: any;
  t: any;
  lang: string;
  isDark: boolean;
  user: UserProfile;
  preferences: UserPreferences;
  initialTab: any;
  onBack: () => void;
  onSaveUser: (nextUser: UserProfile) => void;
  onSavePreferences: (nextPrefs: UserPreferences) => void;
  onResetPreferences: () => void;
  onExportProfileData: () => void;
  onClearProfileData: () => void;
  onSetLang: (nextLang: string) => void;
  onToggleTheme: () => void;
}) {
  // Map old tabs to new tabs for compatibility
  const getMappedTab = (tab: string): ScreenTab => {
    if (tab === "account") return "data";
    if (tab === "preferences") return "codespace";
    if (["profile", "codespace", "mentor", "credentials", "data"].includes(tab)) {
      return tab as ScreenTab;
    }
    return "profile";
  };

  const [activeTab, setActiveTab] = useState<ScreenTab>(getMappedTab(initialTab));
  const [profileDraft, setProfileDraft] = useState<UserProfile>(user);
  const [prefsDraft, setPrefsDraft] = useState<UserPreferences>(preferences);
  const [toast, setToast] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  const linkedInShareId = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < user.name.length; i++) {
      hash = (hash * 31 + user.name.charCodeAt(i)) | 0;
    }
    return `fixeth-cred-${user.name.toLowerCase()}-${1000 + (Math.abs(hash) % 9000)}`;
  }, [user.name]);

  useEffect(() => {
    setActiveTab(getMappedTab(initialTab));
  }, [initialTab]);

  useEffect(() => {
    setProfileDraft(user);
  }, [user]);

  useEffect(() => {
    setPrefsDraft(preferences);
    // Load any locally stored BYOA prefs (do not send to server)
    try {
      const local = getAiPrefsLocal();
      if (local) setPrefsDraft((p) => ({ ...p, ai: { ...(p.ai as any), ...(local as any) } as any }));
    } catch (e) {
      // swallow
    }
  }, [preferences]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  };

  const saveIdentity = () => {
    const nextName = profileDraft.name.trim() || "Learner";
    const nextEmail = profileDraft.email.trim();
    onSaveUser({ ...profileDraft, name: nextName, email: nextEmail });
    showToast(lang === "bn" ? "প্রোফাইল তথ্য সফলভাবে সেভ করা হয়েছে" : "Profile successfully updated");
  };

  const savePreferences = () => {
    // When saving preferences, do NOT send the raw API key to the server.
    const { apiKey, ...aiWithoutKey } = prefsDraft.ai as any;
    const sanitized = { ...prefsDraft, ai: aiWithoutKey } as typeof prefsDraft;
    onSavePreferences(sanitized);
    // Persist key only locally
    if (prefsDraft.ai?.apiKey) saveAiPrefsLocal({ apiKey: prefsDraft.ai.apiKey });
    showToast(lang === "bn" ? "কাস্টমাইজেশন সেটিংস সেভ করা হয়েছে" : "Customization settings saved");
  };

  const removeLocalApiKey = () => {
    removeAiPrefsLocal();
    setPrefsDraft((p) => ({ ...p, ai: { ...p.ai, apiKey: "" } }));
    showToast(lang === "bn" ? "লোকাল API কী মুছে ফেলা হয়েছে" : "Local API key removed");
  };

  const saveBoth = () => {
    onSaveUser(profileDraft);
    onSavePreferences(prefsDraft);
    showToast(lang === "bn" ? "সকল সেটিংস সফলভাবে আপডেট হয়েছে" : "All settings successfully updated");
  };

  const gradientPreview = useMemo(() => {
    return `linear-gradient(140deg, ${prefsDraft.accentColor}30 0%, ${T.bg2} 45%, ${T.bg1} 100%)`;
  }, [prefsDraft.accentColor, T.bg1, T.bg2]);

  // Live IDE Theme Colors Preview Map
  const themePreviewColors = {
    monokai: { bg: "#272822", txt: "#f8f8f2", kw: "#f92672", fn: "#a6e22e", str: "#e6db74" },
    "one-dark": { bg: "#282c34", txt: "#abb2bf", kw: "#c678dd", fn: "#61afef", str: "#98c379" },
    solarized: { bg: "#002b36", txt: "#839496", kw: "#859900", fn: "#268bd2", str: "#2aa198" },
    vibrant: { bg: "#0f0f16", txt: "#eeeeee", kw: "#ff007f", fn: "#00f6ff", str: "#ffea00" },
    "github-light": { bg: "#f6f8fa", txt: "#24292f", kw: "#cf222e", fn: "#8250df", str: "#0a3069" }
  };

  // Mock Mentor Persona Dialogs Map
  const personaDialogPreviews = {
    socratic: {
      title: "Socratic Companion",
      avatar: "🧘‍♂️",
      textEn: "That's an excellent question about return types! Before I write the code, what do you think would happen if we didn't specify a return value? Try tracing it.",
      textBn: "রিটার্ন টাইপ নিয়ে খুব সুন্দর একটি প্রশ্ন করেছ! আমি কোডটি লিখে দেয়ার আগে, তোমার কী মনে হয় বলতো যদি আমরা কোনো রিটার্ন ভ্যালু না দিই? একটু চিন্তা করো।"
    },
    academic: {
      title: "Academic Compiler",
      avatar: "🎓",
      textEn: "Subroutine boundaries dictate scope visibility. In Python, omitting a return expression yields None implicitly. Let us analyze the stack allocation profile.",
      textBn: "সাবরুটিন সীমানাগুলো স্কোপের ভিজিবিলিটি নির্ধারণ করে। পাইথনে কোনো রিটার্ন এক্সপ্রেশন বাদ দিলে তা পরোক্ষভাবে None রিটার্ন করে। চলুন এর মেমরি স্ট্যাকগুলো বিশ্লেষণ করি।"
    },
    bengali: {
      title: "Bengali Code Coach",
      avatar: "☕",
      textEn: "Hey buddy! Worried about return statements? It's simple: Imagine ordering tea, and the vendor prepares it and hands it back (returns it) in a cup for you. That's a return!",
      textBn: "আরে ভাই! রিটার্ন স্টেটমেন্ট নিয়ে চিন্তা করছেন? এটি খুব সহজ! মনে করুন আপনি চা খেতে চাইলেন, আর দোকানদার চা বানিয়ে কাপটা আপনার হাতে ফেরত (return) দিল। এটাই হলো রিটার্ন!"
    },
    rpg: {
      title: "RPG Quest Master",
      avatar: "⚔️",
      textEn: "Ah, young adventurer! The scroll of functions requires a return portal. Place the keyword at the end of your quest code to retrieve the legendary computed artifact!",
      textBn: "স্বাগতম তরুন বীর! ফাংশনের জাদু খাতা সচল করতে একটি রিটার্ন পোর্টাল প্রয়োজন। তোমার কোডের একদম শেষ লাইনে এই কিওয়ার্ডটি যুক্ত করে নিয়ে নাও জাদুকরী কম্পিউটেড আর্টিফ্যাক্ট!"
    }
  };

  const tabButton = (tab: ScreenTab, label: string, icon: React.ReactNode) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: activeTab === tab ? T.accentDim : T.bg2,
        border: `1px solid ${activeTab === tab ? T.accent : T.border}`,
        borderRadius: 10,
        color: activeTab === tab ? T.accent : T.txt1,
        padding: "10px 14px",
        fontSize: 12,
        fontWeight: 800,
        cursor: "pointer",
        transition: "all 0.2s ease"
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", background: T.bg0 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 16px 48px" }}>
        
        {/* TOP LEVEL NAVIGATION & BILINGUAL HEADERS */}
        <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              onClick={onBack}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: T.bg2,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                color: T.txt0,
                fontWeight: 800,
                fontSize: 11,
                padding: "8px 12px",
                cursor: "pointer",
                alignSelf: "flex-start",
                transition: "all 0.15s ease"
              }}
            >
              <ArrowLeft size={14} />
              <span>{lang === "bn" ? "ওয়ার্কস্পেসে ফিরে যান" : "Back to Workspace"}</span>
            </button>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 950, color: T.txt0 }}>
              {lang === "bn" ? "প্রোফাইল সেটিংস ও কন্ট্রোল সেন্টার" : "Profile Control Center"}
            </h1>
            <p style={{ margin: "4px 0 0", color: T.txt1, fontSize: 12.5, maxWidth: 680 }}>
              {lang === "bn"
                ? "আপনার আইডেন্টিটি, কোডস্পেস এডিটর, এআই মেন্টরের ব্যক্তিত্ব এবং নিরাপত্তা সেটিংস ��াস্টমাইজ করুন।"
                : "Tune your identity, IDE codespace editor, AI Mentor behavior, and privacy defaults from one polished workspace."}
            </p>
          </div>
          
          <div style={{ background: T.accentDim, border: `1px solid ${T.accent}66`, color: T.accent, borderRadius: 999, padding: "8px 12px", fontSize: 10.5, fontWeight: 900, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <BadgeCheck size={14} />
            <span>{lang === "bn" ? "প্রিমিয়াম এলএমএস লাইসেন্স সচল" : "Premium LMS Personalization"}</span>
          </div>
        </div>

        {/* 5 VISUALLY PREMIUM NAVIGATION TABS */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {tabButton("profile", lang === "bn" ? "আইডেন্টিটি ও বিভাগ" : "Identity & Regional", <UserRound size={14} />)}
          {tabButton("codespace", lang === "bn" ? "আইডিই কোডস্পেস" : "Codespace IDE", <Code size={14} />)}
          {tabButton("mentor", lang === "bn" ? "এআই মেন্টর সেটিংস" : "AI Mentor Tuning", <Brain size={14} />)}
          {tabButton("credentials", lang === "bn" ? "সার্টিফিকেট ও প্রাইভেসী" : "Credentials & Privacy", <Award size={14} />)}
          {tabButton("data", lang === "bn" ? "সিস্টেম ও ডাটা সেটিংস" : "System & Data Controls", <Database size={14} />)}
        </div>

        {/* ----------------- TAB 1: IDENTITY & REGIONAL DIVISION ----------------- */}
        {activeTab === "profile" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            <section style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18, boxShadow: T.shadow, ...SECTION_STYLE }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 14, color: T.txt0, fontWeight: 800 }}>
                  {lang === "bn" ? "ব্যক্তিগত পরিচয় ও বাংলাদেশ বিভাগ" : "Identity & Division Alignment"}
                </h3>
                <p style={{ margin: "6px 0 0", color: T.txt1, fontSize: 11.5 }}>
                  {lang === "bn" 
                    ? "সার্টিফিকেট, ড্যাশবোর্ড এবং জাতীয় কর্মসংস্থান অ্যানালিটিক্স সিঙ্ক করার জন্য আপনার তথ্য সেট করুন।"
                    : "Keep your public profile and regional data aligned to customize localized national job demand maps."}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, color: T.txt1 }}>
                  {lang === "bn" ? "সম্পূর্ণ নাম" : "Full Name"}
                  <input value={profileDraft.name} onChange={(e) => setProfileDraft((p) => ({ ...p, name: e.target.value }))} style={{ background: T.bg2, border: `1px solid ${T.border}`, color: T.txt0, borderRadius: 10, padding: "10px 12px", fontSize: 12 }} />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, color: T.txt1 }}>
                  {lang === "bn" ? "পেশাগত টাইটেল" : "Professional Title"}
                  <input value={profileDraft.title || ""} onChange={(e) => setProfileDraft((p) => ({ ...p, title: e.target.value }))} style={{ background: T.bg2, border: `1px solid ${T.border}`, color: T.txt0, borderRadius: 10, padding: "10px 12px", fontSize: 12 }} />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, color: T.txt1 }}>
                  {lang === "bn" ? "বাংলাদেশ বিভাগ" : "Division Location (Bangladesh)"}
                  <select 
                    value={profileDraft.division || "Dhaka"} 
                    onChange={(e) => setProfileDraft((p) => ({ ...p, division: e.target.value as any }))}
                    style={{ background: T.bg2, border: `1px solid ${T.border}`, color: T.txt0, borderRadius: 10, padding: "10px 12px", fontSize: 12, outline: "none" }}
                  >
                    {["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh"].map(div => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, color: T.txt1 }}>
                  {lang === "bn" ? "ক্যারিয়ার ফোকাস" : "Target Career Sector"}
                  <select 
                    value={profileDraft.jobFocus || "job"} 
                    onChange={(e) => setProfileDraft((p) => ({ ...p, jobFocus: e.target.value as any }))}
                    style={{ background: T.bg2, border: `1px solid ${T.border}`, color: T.txt0, borderRadius: 10, padding: "10px 12px", fontSize: 12, outline: "none" }}
                  >
                    <option value="job">{lang === "bn" ? "রিমোট গ্লোবাল ডেভেলপার" : "Remote / Global IT Job"}</option>
                    <option value="upskill">{lang === "bn" ? "দক্ষতা বৃদ্ধি (Upskilling)" : "Professional Upskilling"}</option>
                    <option value="switch">{lang === "bn" ? "ট্র্যাক পরিবর্তন (Field Switch)" : "Pivot Engineering Field"}</option>
                    <option value="explore">{lang === "bn" ? "সাধারণ কারিগরি জ���ঞান" : "General Tech Exploring"}</option>
                  </select>
                </label>
              </div>

              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, color: T.txt1 }}>
                {lang === "bn" ? "অবস্থান (শহর, দেশ)" : "Location (City, Country)"}
                <input value={profileDraft.location || ""} onChange={(e) => setProfileDraft((p) => ({ ...p, location: e.target.value }))} style={{ background: T.bg2, border: `1px solid ${T.border}`, color: T.txt0, borderRadius: 10, padding: "10px 12px", fontSize: 12 }} />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, color: T.txt1 }}>
                {lang === "bn" ? "ছোট বায়ো" : "Short Bio"}
                <textarea value={profileDraft.bio || ""} onChange={(e) => setProfileDraft((p) => ({ ...p, bio: e.target.value }))} rows={3} style={{ background: T.bg2, border: `1px solid ${T.border}`, color: T.txt0, borderRadius: 10, padding: "10px 12px", fontSize: 12, resize: "vertical" }} />
              </label>

              <div
                style={{
                  background: T.bg2,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  padding: 14,
                  display: "grid",
                  gap: 10
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, color: T.txt0 }}>
                  {lang === "bn" ? "আমার শেখা" : "My learning"}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <Link
                    href="/my-tracks"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: T.accentDim,
                      border: `1px solid ${T.accent}44`,
                      color: T.accent,
                      fontWeight: 700,
                      fontSize: 11,
                      textDecoration: "none"
                    }}
                  >
                    {lang === "bn" ? "সক্রিয় ট্র্যাক" : "Active tracks"}
                  </Link>
                  <Link
                    href="/tracks"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: T.bg3,
                      border: `1px solid ${T.border}`,
                      color: T.txt0,
                      fontWeight: 700,
                      fontSize: 11,
                      textDecoration: "none"
                    }}
                  >
                    {lang === "bn" ? "ট্র্যাক লাইব্রেরি" : "Track library"}
                  </Link>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={saveIdentity} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.accent, color: "#000", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 900, cursor: "pointer", fontSize: 12 }}>
                  <Save size={14} />
                  <span>{lang === "bn" ? "তথ্য সেভ করুন" : "Save Profile Details"}</span>
                </button>
              </div>
            </section>

            {/* LIVE CARD WORKSPACE PREVIEW */}
            <aside style={{ background: gradientPreview, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18, boxShadow: T.shadow, height: "fit-content" }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: T.txt0, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={14} color={T.accent} />
                <span>{lang === "bn" ? "লাইভ কার্ড প্রিভিউ" : "Live Dashboard Badge"}</span>
              </div>
              
              <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: prefsDraft.accentColor, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 950, fontSize: 16 }}>
                    {(profileDraft.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: T.txt0 }}>{profileDraft.name || "Learner"}</div>
                    <div style={{ fontSize: 11, color: T.txt1 }}>{profileDraft.title || "Learner"}</div>
                  </div>
                </div>

                <div style={{ marginTop: 14, borderTop: `1px solid ${T.border}`, paddingTop: 12, display: "grid", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.txt1 }}>
                    <span>{lang === "bn" ? "বাংলাদেশ বিভাগ:" : "Division:"}</span>
                    <span style={{ color: T.txt0, fontWeight: 700 }}>{profileDraft.division || "Dhaka"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.txt1 }}>
                    <span>{lang === "bn" ? "উদ্দেশ্য:" : "Target Focus:"}</span>
                    <span style={{ color: T.accent, fontWeight: 800 }}>
                      {profileDraft.jobFocus === "job" ? (lang === "bn" ? "রিমোট জব" : "Remote Job")
                       : profileDraft.jobFocus === "upskill" ? (lang === "bn" ? "দক্ষতা বৃদ্ধি" : "Upskilling")
                       : profileDraft.jobFocus === "switch" ? (lang === "bn" ? "ট্র্যাক পরিবর্তন" : "Field Pivot")
                       : (lang === "bn" ? "সাধারন জ্ঞান" : "Curious Learner")}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.txt1 }}>
                    <span>{lang === "bn" ? "ডাটা সেভার মোড:" : "Data Saver:"}</span>
                    <span style={{ color: prefsDraft.dataSaver ? T.accent : T.txt2, fontWeight: 700 }}>
                      {prefsDraft.dataSaver ? "ACTIVE" : "OFF"}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ----------------- TAB 2: IDE CODESPACE CUSTOMIZATION ----------------- */}
        {activeTab === "codespace" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.3fr", gap: 14 }}>
            <section style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18, boxShadow: T.shadow, ...SECTION_STYLE }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 14, color: T.txt0, fontWeight: 800 }}>
                  {lang === "bn" ? "আইডিই কোডস্পেস ও এডিটর সেটিংস" : "Codespace Editor Environment"}
                </h3>
                <p style={{ margin: "6px 0 0", color: T.txt1, fontSize: 11.5 }}>
                  {lang === "bn"
                    ? "কোডস্পেস ল্যাব এবং টার্মিনালের ফ্রন্ট-এন্ড স্টাইল, ফন্ট এবং শর্টকাটগুলি কাস্টমাইজ করুন।"
                    : "Configure layout sizes, compiler themes, and keyboard bindings for the interactive Codespace."}
                </p>
              </div>

              {/* Theme selection */}
              <div>
                <div style={{ fontSize: 11.5, color: T.txt1, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Palette size={13} color={T.accent} />
                  <span>{lang === "bn" ? "এডিটর কালার থিম" : "IDE Editor Theme Theme"}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                  {([
                    ["monokai", "Monokai"],
                    ["one-dark", "One Dark"],
                    ["solarized", "Solarized"],
                    ["vibrant", "Vibrant Slate"],
                    ["github-light", "Github Light"]
                  ] as const).map(([id, label]) => (
                    <button 
                      key={id} 
                      onClick={() => setPrefsDraft((p) => ({ ...p, editor: { ...p.editor, theme: id } }))} 
                      style={{ 
                        background: prefsDraft.editor.theme === id ? T.accentDim : T.bg2, 
                        border: `1px solid ${prefsDraft.editor.theme === id ? T.accent : T.border}`, 
                        color: prefsDraft.editor.theme === id ? T.accent : T.txt1, 
                        borderRadius: 8, 
                        padding: "8px 6px", 
                        fontSize: 10.5, 
                        fontWeight: 800, 
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size & indents */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, color: T.txt1 }}>
                  <span>{lang === "bn" ? `ফন্ট সাইজ: ${prefsDraft.editor.fontSize}px` : `Font Size: ${prefsDraft.editor.fontSize}px`}</span>
                  <input 
                    type="range" 
                    min={11} 
                    max={18} 
                    value={prefsDraft.editor.fontSize} 
                    onChange={(e) => setPrefsDraft((p) => ({ ...p, editor: { ...p.editor, fontSize: Number(e.target.value) } }))}
                    style={{ cursor: "pointer", width: "100%", accentColor: T.accent }} 
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, color: T.txt1 }}>
                  {lang === "bn" ? "ট্যাব ইনডেন্টেশন" : "Tab Space Indent"}
                  <div style={{ display: "flex", gap: 6 }}>
                    {[2, 4].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setPrefsDraft((p) => ({ ...p, editor: { ...p.editor, indentSize: size as 2 | 4 } }))}
                        style={{
                          flex: 1,
                          background: prefsDraft.editor.indentSize === size ? T.accentDim : T.bg2,
                          border: `1px solid ${prefsDraft.editor.indentSize === size ? T.accent : T.border}`,
                          color: prefsDraft.editor.indentSize === size ? T.accent : T.txt1,
                          borderRadius: 8,
                          padding: "6px",
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: "pointer"
                        }}
                      >
                        {size} Spaces
                      </button>
                    ))}
                  </div>
                </label>
              </div>

              {/* Keyboard shortcuts & Line wrap */}
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: T.txt1, marginBottom: 6 }}>{lang === "bn" ? "কীবোর্ড শর্টকাট ম্যাপ" : "Shortcuts Keymap"}</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {(["standard", "vim", "emacs"] as const).map(key => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPrefsDraft((p) => ({ ...p, editor: { ...p.editor, keymap: key } }))}
                        style={{
                          flex: 1,
                          background: prefsDraft.editor.keymap === key ? T.accentDim : T.bg2,
                          border: `1px solid ${prefsDraft.editor.keymap === key ? T.accent : T.border}`,
                          color: prefsDraft.editor.keymap === key ? T.accent : T.txt1,
                          borderRadius: 8,
                          padding: "8px 4px",
                          fontSize: 10,
                          fontWeight: 800,
                          cursor: "pointer",
                          textTransform: "capitalize"
                        }}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>

                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, color: T.txt1 }}>
                  {lang === "bn" ? "লাইন র‍্যাপিং" : "Line Wrapping"}
                  <button
                    type="button"
                    onClick={() => setPrefsDraft((p) => ({ ...p, editor: { ...p.editor, lineWrapping: !p.editor.lineWrapping } }))}
                    style={{
                      background: prefsDraft.editor.lineWrapping ? T.accentDim : T.bg2,
                      border: `1px solid ${prefsDraft.editor.lineWrapping ? T.accent : T.border}`,
                      color: prefsDraft.editor.lineWrapping ? T.accent : T.txt1,
                      borderRadius: 8,
                      padding: "8px 10px",
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: "pointer"
                    }}
                  >
                    {prefsDraft.editor.lineWrapping ? (lang === "bn" ? "অন (Enabled)" : "ON (Wrap)") : (lang === "bn" ? "অফ (Disabled)" : "OFF (Clip)")}
                  </button>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={savePreferences} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.accent, color: "#000", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 900, cursor: "pointer", fontSize: 12 }}>
                  <Save size={14} />
                  <span>{lang === "bn" ? "সেটিংস সংরক্ষণ করুন" : "Save Editor Config"}</span>
                </button>
              </div>
            </section>

            {/* LIVE THEME CODE PREVIEW BOX */}
            <aside style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18, boxShadow: T.shadow, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: T.txt0, display: "flex", alignItems: "center", gap: 8 }}>
                <Terminal size={14} color={T.accent} />
                <span>{lang === "bn" ? "রিয়েল-টাইম এডিটর প্রিভিউ" : "Real-Time IDE Simulator"}</span>
              </div>

              <div 
                style={{ 
                  flex: 1, 
                  background: themePreviewColors[prefsDraft.editor.theme].bg, 
                  borderRadius: 10, 
                  padding: 14, 
                  fontFamily: "monospace", 
                  fontSize: prefsDraft.editor.fontSize, 
                  lineHeight: 1.6,
                  color: themePreviewColors[prefsDraft.editor.theme].txt,
                  border: `1px solid ${T.borderHi}66`,
                  overflowX: prefsDraft.editor.lineWrapping ? "unset" : "auto",
                  whiteSpace: prefsDraft.editor.lineWrapping ? "pre-wrap" : "pre"
                }}
              >
                <div style={{ color: "#777", fontSize: 10, marginBottom: 8, userSelect: "none" }}>
                  # Preview Tab: {prefsDraft.editor.indentSize} spaces | Keymap: {prefsDraft.editor.keymap}
                </div>
                
                <div>
                  <span style={{ color: themePreviewColors[prefsDraft.editor.theme].kw, fontWeight: 700 }}>import</span> numpy <span style={{ color: themePreviewColors[prefsDraft.editor.theme].kw, fontWeight: 700 }}>as</span> np
                </div>
                <div>
                  <span style={{ color: themePreviewColors[prefsDraft.editor.theme].kw, fontWeight: 700 }}>def</span> <span style={{ color: themePreviewColors[prefsDraft.editor.theme].fn }}>standard_scaler</span>(data):
                </div>
                <div>
                  {Array(prefsDraft.editor.indentSize).fill("\u00A0").join("")}mean = np.mean(data)
                </div>
                <div>
                  {Array(prefsDraft.editor.indentSize).fill("\u00A0").join("")}<span style={{ color: themePreviewColors[prefsDraft.editor.theme].kw, fontWeight: 700 }}>return</span> [(x - mean) / np.std(data) <span style={{ color: themePreviewColors[prefsDraft.editor.theme].kw, fontWeight: 700 }}>for</span> x <span style={{ color: themePreviewColors[prefsDraft.editor.theme].kw, fontWeight: 700 }}>in</span> data]
                </div>
                <div style={{ marginTop: 12 }}>
                  scaler = standard_scaler([<span style={{ color: themePreviewColors[prefsDraft.editor.theme].fn }}>92</span>, <span style={{ color: themePreviewColors[prefsDraft.editor.theme].fn }}>85</span>, <span style={{ color: themePreviewColors[prefsDraft.editor.theme].fn }}>99</span>])
                </div>
                <div>
                  print(<span style={{ color: themePreviewColors[prefsDraft.editor.theme].str }}>"Scaled Scores:"</span>, scaler)
                </div>
              </div>

              <div style={{ fontSize: 10.5, color: T.txt1, lineHeight: 1.45 }}>
                ℹ️ {lang === "bn"
                  ? "উপরের ভিউটি আপনার নির্বাচিত কালারPreset এবং ফন্ট সাইজ সিমুলেট করছে।"
                  : "The compiler block simulated above directly updates based on your current settings presets."}
              </div>
            </aside>
          </div>
        )}

        {/* ----------------- TAB 3: AI MENTOR TUNING & BYOA ----------------- */}
        {activeTab === "mentor" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            <section style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18, boxShadow: T.shadow, ...SECTION_STYLE }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 14, color: T.txt0, fontWeight: 800 }}>
                  {lang === "bn" ? "এআই মেন্টর ও ইউজার এপিআই কী কাস্টমাইজেশন" : "AI Mentor Tuning & API Gateway"}
                </h3>
                <p style={{ margin: "6px 0 0", color: T.txt1, fontSize: 11.5 }}>
                  {lang === "bn"
                    ? "ইউজার এপিআই কী সেট করুন, অফলাইন ওলামা লোকালহোস্ট সিঙ্ক করুন এবং মেন্টরের মেজাজ কাস্টমাইজ করুন।"
                    : "Configure secure BYOA keys, preferred Gemini LLM models, and local offline Ollama host ports."}
                </p>
              </div>

              {/* Secure API Key input */}
              <div>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, color: T.txt1 }}>
                  <span>Gemini API Access Key (BYOA)</span>
                  <div style={{ display: "flex", gap: 6, position: "relative" }}>
                    <input 
                      type={showApiKey ? "text" : "password"} 
                      value={prefsDraft.ai.apiKey} 
                      onChange={(e) => setPrefsDraft((p) => ({ ...p, ai: { ...p.ai, apiKey: e.target.value } }))} 
                      placeholder="AIzaSy..."
                      style={{ flex: 1, background: T.bg2, border: `1px solid ${T.border}`, color: T.txt0, borderRadius: 10, padding: "10px 42px 10px 12px", fontSize: 11.5, fontFamily: "monospace" }} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.txt1, cursor: "pointer" }}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>
                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: prefsDraft.ai.apiKey ? T.accent : T.txt2 }} />
                  <span style={{ fontSize: 10, color: prefsDraft.ai.apiKey ? T.accent : T.txt2, fontWeight: 700 }}>
                    {prefsDraft.ai.apiKey ? "BYOA Client Synced" : "No personal key stored (Using Baseline Studio Trial)"}
                  </span>
                </div>
              </div>

              {/* Models selection */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, color: T.txt1 }}>
                  {lang === "bn" ? "এআই মডেল সিলেক্ট করুন" : "Preferred LLM Engine"}
                  <select 
                    value={prefsDraft.ai.model} 
                    onChange={(e) => setPrefsDraft((p) => ({ ...p, ai: { ...p.ai, model: e.target.value as any } }))}
                    style={{ background: T.bg2, border: `1px solid ${T.border}`, color: T.txt0, borderRadius: 10, padding: "10px", fontSize: 12, outline: "none" }}
                  >
                    <option value="gemini-2.5-flash">gemini-2.5-flash (recommended)</option>
                    <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite (lowest quota use)</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro (deep reasoning)</option>
                    <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                    <option value="ollama">{lang === "bn" ? "অফলাইন লোকাল Ollama" : "Offline Local Ollama"}</option>
                  </select>
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, color: T.txt1 }}>
                  {lang === "bn" ? "ডিফল্ট জ্ঞানীয় স্তর" : "Default Cognitive Style"}
                  <select 
                    value={prefsDraft.ai.defaultCognitiveLevel} 
                    onChange={(e) => setPrefsDraft((p) => ({ ...p, ai: { ...p.ai, defaultCognitiveLevel: e.target.value as any } }))}
                    style={{ background: T.bg2, border: `1px solid ${T.border}`, color: T.txt0, borderRadius: 10, padding: "10px", fontSize: 12, outline: "none" }}
                  >
                    <option value="ELI5">ELI5 (Explain Like I'm 5)</option>
                    <option value="Student">Student Explorer</option>
                    <option value="Pro">Professional Engineer</option>
                    <option value="Research">Academic Research</option>
                  </select>
                </label>
              </div>

              {/* Dynamic local Ollama settings panel */}
              {prefsDraft.ai.model === "ollama" && (
                <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 10 }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 10.5, color: T.txt1 }}>
                    Ollama Server Endpoint
                    <input 
                      type="text" 
                      value={prefsDraft.ai.ollamaUrl} 
                      onChange={(e) => setPrefsDraft((p) => ({ ...p, ai: { ...p.ai, ollamaUrl: e.target.value } }))} 
                      style={{ background: T.bg1, border: `1px solid ${T.border}`, color: T.txt0, borderRadius: 8, padding: "6px 8px", fontSize: 11, fontFamily: "monospace" }} 
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 10.5, color: T.txt1 }}>
                    Ollama Local Model Tag
                    <input 
                      type="text" 
                      value={prefsDraft.ai.ollamaModel} 
                      onChange={(e) => setPrefsDraft((p) => ({ ...p, ai: { ...p.ai, ollamaModel: e.target.value } }))} 
                      style={{ background: T.bg1, border: `1px solid ${T.border}`, color: T.txt0, borderRadius: 8, padding: "6px 8px", fontSize: 11 }} 
                    />
                  </label>
                </div>
              )}

              {/* Mentor Persona Selector */}
              <div>
                <div style={{ fontSize: 11.5, color: T.txt1, marginBottom: 8 }}>{lang === "bn" ? "এআই মেন্টরের ব্যক্তিত্ব" : "AI Mentor Tutoring Persona"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {(["socratic", "academic", "bengali", "rpg"] as const).map(per => (
                    <button
                      key={per}
                      type="button"
                      onClick={() => setPrefsDraft((p) => ({ ...p, ai: { ...p.ai, persona: per } }))}
                      style={{
                        background: prefsDraft.ai.persona === per ? T.accentDim : T.bg2,
                        border: `1px solid ${prefsDraft.ai.persona === per ? T.accent : T.border}`,
                        color: prefsDraft.ai.persona === per ? T.accent : T.txt1,
                        borderRadius: 10,
                        padding: "8px 10px",
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <span>{personaDialogPreviews[per].avatar}</span>
                      <span>{personaDialogPreviews[per].title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button onClick={removeLocalApiKey} type="button" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: T.txt0, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", fontWeight: 900, cursor: "pointer", fontSize: 12 }}>
                  <Trash2 size={14} />
                  <span>{lang === "bn" ? "লোকাল API কী মুছুন" : "Remove Local Key"}</span>
                </button>
                <button onClick={savePreferences} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.accent, color: "#000", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 900, cursor: "pointer", fontSize: 12 }}>
                  <Save size={14} />
                  <span>{lang === "bn" ? "এআই মডেল সেভ করুন" : "Save Mentor Settings"}</span>
                </button>
              </div>
            </section>

            {/* LIVE AI PERSONA PREVIEW CHAT SIMULATOR */}
            <aside style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18, boxShadow: T.shadow, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: T.txt0, display: "flex", alignItems: "center", gap: 8 }}>
                <Brain size={14} color={T.accent} />
                <span>{lang === "bn" ? "মেন্টর চ্যাট সিমুলেটর" : "Tutor Persona Simulator"}</span>
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: T.accentDim, border: `1.5px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                    {personaDialogPreviews[prefsDraft.ai.persona].avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: T.accent, fontWeight: 800, marginBottom: 2 }}>
                      {personaDialogPreviews[prefsDraft.ai.persona].title} (Active)
                    </div>
                    <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: "4px 12px 12px 12px", padding: 12, fontSize: 11.5, color: T.txt0, lineHeight: 1.55 }}>
                      {lang === "bn" ? personaDialogPreviews[prefsDraft.ai.persona].textBn : personaDialogPreviews[prefsDraft.ai.persona].textEn}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: `${T.accent}08`, border: `1px dashed ${T.accent}33`, borderRadius: 8, padding: 10, fontSize: 10.5, color: T.txt1, lineHeight: 1.45 }}>
                💡 {lang === "bn"
                  ? "নির্বাচিত পারসোনা অনুযায়ী এআই মেন্টর স্ক্রিনের গাইডলাইন প্রম্পট স্বয়ংক্রিয়ভাবে টিউন হবে।"
                  : "The selected persona directly changes the tutor's tone in the AI Mentor dashboard sidebar."}
              </div>
            </aside>
          </div>
        )}

        {/* ----------------- TAB 4: ACADEMIC CREDENTIALS & PRIVACY ----------------- */}
        {activeTab === "credentials" && (
          <section style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18, boxShadow: T.shadow, maxWidth: 800, ...SECTION_STYLE }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, color: T.txt0, fontWeight: 800 }}>
                {lang === "bn" ? "অ্যাকাডেমিক সার্টিফিকেট ও প্রাইভেসী কাস্টমাইজেশন" : "Credentials, Certs & Profile Privacy"}
              </h3>
              <p style={{ margin: "6px 0 0", color: T.txt1, fontSize: 11.5 }}>
                {lang === "bn"
                  ? "সার্টিফিকেট নাম, পোর্টফোলিওর পাবলিক ভিজিবিলিটি এবং লিঙ্কডইন ইন্টিগ্রেশন কাস্টমাইজ করুন।"
                  : "Customize legal credential names, LinkedIn synchronization, and public student status."}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, color: T.txt1 }}>
                {lang === "bn" ? "সার্টিফিকেটে ব্যবহৃত নাম (আইডি বা সার্টিফিকেট নাম)" : "Official Name for Certificates (Legal)"}
                <input 
                  type="text" 
                  value={profileDraft.certificateName || profileDraft.name} 
                  onChange={(e) => setProfileDraft((p) => ({ ...p, certificateName: e.target.value }))}
                  placeholder={profileDraft.name}
                  style={{ background: T.bg2, border: `1px solid ${T.border}`, color: T.txt0, borderRadius: 10, padding: "10px 12px", fontSize: 12 }} 
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, color: T.txt1 }}>
                {lang === "bn" ? "LinkedIn শেয়ারিং আইডি" : "LinkedIn Share Identifier"}
                <input 
                  type="text" 
                  readOnly
                  value={linkedInShareId}
                  style={{ background: T.bg3, border: `1px solid ${T.border}`, color: T.txt2, borderRadius: 10, padding: "10px 12px", fontSize: 11, fontFamily: "monospace" }} 
                />
              </label>
            </div>

            <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: T.txt0 }}>{lang === "bn" ? "পাবলিক পোর্টফোলিও ভিজিবিলিটি" : "Public Student Portfolio"}</div>
                  <div style={{ fontSize: 10.5, color: T.txt1 }}>{lang === "bn" ? "আইটি নিয়োগদাতারা আপনার সমাধান করা প্রজেক্ট দেখতে পারবেন।" : "Allow tech recruiters in Bangladesh to verify your coding tracks."}</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={profileDraft.publicPortfolio ?? true} 
                  onChange={(e) => setProfileDraft((p) => ({ ...p, publicPortfolio: e.target.checked }))}
                  style={{ width: 16, height: 16, cursor: "pointer", accentColor: T.accent }}
                />
              </div>
            </div>

            <div style={{ fontSize: 11, color: T.txt1, display: "flex", alignItems: "center", gap: 6 }}>
              <BadgeCheck size={14} color={T.accent} />
              <span>{lang === "bn" ? "সার্টিফিকেট সচল হলে স্বয়ংক্রিয়ভাবে LinkedIn এ শেয়ার করার বাটন যুক্ত হবে।" : "Credentials will be verified under the Government ICT standard validation."}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={saveBoth} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.accent, color: "#000", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 900, cursor: "pointer", fontSize: 12 }}>
                <Save size={14} />
                <span>{lang === "bn" ? "তথ্য সেভ করুন" : "Save Privacy & Certificate Settings"}</span>
              </button>
            </div>
          </section>
        )}

        {/* ----------------- TAB 5: DATA, SYSTEM & MOBILE DATA SAVER ----------------- */}
        {activeTab === "data" && (
          <section style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18, boxShadow: T.shadow, maxWidth: 800, ...SECTION_STYLE }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, color: T.txt0, fontWeight: 800 }}>
                {lang === "bn" ? "সিস্টেম ডাটা ও মোবাইল ব্যান্ডউইথ কন্ট্রোল" : "System, Cache & Data Controls"}
              </h3>
              <p style={{ margin: "6px 0 0", color: T.txt1, fontSize: 11.5 }}>
                {lang === "bn"
                  ? "মোবাইল ডাটা সেভার মোড সচল করুন, লোকাল ক্যাশ ক্লিয়ার করুন অথবা সম্পূর্ণ সেটিংস ডাউনলোড করুন।"
                  : "Optimize telemetry profiles, auto-saving defaults, low-resolution video, or export metadata."}
              </p>
            </div>

            {/* Mobile Data Saver Banner */}
            <div 
              style={{ 
                background: prefsDraft.dataSaver ? `${T.accent}12` : T.bg2, 
                border: `1px solid ${prefsDraft.dataSaver ? T.accent : T.border}`, 
                borderRadius: 12, 
                padding: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: prefsDraft.dataSaver ? T.accentDim : `${T.txt1}15`, display: "flex", alignItems: "center", justifyContent: "center", color: prefsDraft.dataSaver ? T.accent : T.txt1, flexShrink: 0 }}>
                  <WifiOff size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 900, color: T.txt0 }}>
                    {lang === "bn" ? "মোবাইল ডাটা সেভার মোড (লো-ব্যান্ডউইথ)" : "Mobile Data Saver Mode (Low Bandwidth)"}
                  </div>
                  <div style={{ fontSize: 11, color: T.txt1, marginTop: 2, lineHeight: 1.45 }}>
                    {lang === "bn"
                      ? "প্যাকেজ ডাটা বাঁচাতে ভিডিও লো-রেজোলিউশনে চলবে এবং ব্যাকগ্রাউন্ড অ্যানিমেশন বন্ধ থাকবে।"
                      : "Saves mobile data on cell networks (Grameenphone/Robi) by downgrading guided videos."}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrefsDraft((p) => ({ ...p, dataSaver: !p.dataSaver }))}
                style={{
                  background: prefsDraft.dataSaver ? T.accent : T.bg3,
                  border: `1px solid ${prefsDraft.dataSaver ? T.accent : T.border}`,
                  color: prefsDraft.dataSaver ? "#000" : T.txt0,
                  borderRadius: 10,
                  padding: "8px 16px",
                  fontSize: 11,
                  fontWeight: 900,
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                {prefsDraft.dataSaver ? (lang === "bn" ? "সক্রিয়" : "ACTIVE") : (lang === "bn" ? "বন্ধ করুন" : "DISABLED")}
              </button>
            </div>

            {/* Standard Telemetry & Personalization checks */}
            <div style={{ display: "grid", gap: 10, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: 14 }}>
              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, color: T.txt1 }}>
                <span>{lang === "bn" ? "পণ্য অ্যানালিটিক্স ও ট্র্যাকিং অন রাখুন" : "Allow product performance analytics"}</span>
                <input type="checkbox" checked={prefsDraft.dataPreferences.allowTelemetry} onChange={(e) => setPrefsDraft((p) => ({ ...p, dataPreferences: { ...p.dataPreferences, allowTelemetry: e.target.checked } }))} style={{ cursor: "pointer", accentColor: T.accent }} />
              </label>
              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, color: T.txt1 }}>
                <span>{lang === "bn" ? "ব্যক্তিগত মডিউল অ্যানালিটিক্স সুপারিশ করুন" : "Allow AI personalized recommendations"}</span>
                <input type="checkbox" checked={prefsDraft.dataPreferences.allowPersonalization} onChange={(e) => setPrefsDraft((p) => ({ ...p, dataPreferences: { ...p.dataPreferences, allowPersonalization: e.target.checked } }))} style={{ cursor: "pointer", accentColor: T.accent }} />
              </label>
              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, color: T.txt1 }}>
                <span>{lang === "bn" ? "ব্রাউজারে অগ্রগতি স্বয়ংক্রিয়ভাবে সেভ করুন" : "Auto-save homework workspace progress"}</span>
                <input type="checkbox" checked={prefsDraft.dataPreferences.autoSaveProgress} onChange={(e) => setPrefsDraft((p) => ({ ...p, dataPreferences: { ...p.dataPreferences, autoSaveProgress: e.target.checked } }))} style={{ cursor: "pointer", accentColor: T.accent }} />
              </label>
            </div>

            {/* Export format & operations */}
            <div style={{ display: "grid", gap: 14, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
              <div>
                <div style={{ fontSize: 11, color: T.txt1, marginBottom: 8 }}>{lang === "bn" ? "ডাউনলোড মেটাডাটা ফরম্যাট" : "Download Metadata Format"}</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {(["json", "csv"] as const).map((fmt) => (
                    <button key={fmt} onClick={() => setPrefsDraft((p) => ({ ...p, dataPreferences: { ...p.dataPreferences, downloadFormat: fmt } }))} style={{ background: prefsDraft.dataPreferences.downloadFormat === fmt ? T.accentDim : T.bg2, border: `1px solid ${prefsDraft.dataPreferences.downloadFormat === fmt ? T.accent : T.border}`, borderRadius: 10, color: prefsDraft.dataPreferences.downloadFormat === fmt ? T.accent : T.txt1, padding: "8px 14px", fontWeight: 800, fontSize: 11, cursor: "pointer", textTransform: "uppercase" }}>
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                <button onClick={() => { onSavePreferences(prefsDraft); onExportProfileData(); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.bg2, border: `1px solid ${T.border}`, color: T.txt0, borderRadius: 10, padding: "10px 14px", fontWeight: 800, cursor: "pointer", fontSize: 11.5, transition: "all 0.15s ease" }}>
                  <Download size={14} />
                  <span>{lang === "bn" ? "সম্পূর্ণ তথ্য ডাউনলোড করুন" : "Export My Profile"}</span>
                </button>
                <button onClick={() => { onResetPreferences(); showToast(lang === "bn" ? "ডিফল্ট সেটিংস সফলভাবে রিস্টোর হয়েছে" : "System defaults successfully restored"); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.bg2, border: `1px solid ${T.border}`, color: T.txt0, borderRadius: 10, padding: "10px 14px", fontWeight: 800, cursor: "pointer", fontSize: 11.5, transition: "all 0.15s ease" }}>
                  <RotateCcw size={14} />
                  <span>{lang === "bn" ? "রিসেট করুন" : "Reset System Defaults"}</span>
                </button>
                <button onClick={() => { onClearProfileData(); showToast(lang === "bn" ? "লোকাল অগ্রগতি মুছে দেয়া হয়েছে" : "Local browser progress cleared"); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: `1px solid ${T.red}`, color: T.red, borderRadius: 10, padding: "10px 14px", fontWeight: 800, cursor: "pointer", fontSize: 11.5, transition: "all 0.15s ease" }}>
                  <Trash2 size={14} />
                  <span>{lang === "bn" ? "লোকাল ডাটা ক্লিয়ার করুন" : "Wipe Browser Cache"}</span>
                </button>
              </div>
            </div>

            {/* Quick Settings Toggles */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: `1px solid ${T.border}`, flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => onSetLang(lang === "en" ? "bn" : "en")} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10, color: T.txt0, padding: "8px 12px", fontWeight: 800, fontSize: 11.5, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Languages size={13} />
                  <span>{lang === "bn" ? "English" : "বাংলা"}</span>
                </button>
                <button onClick={onToggleTheme} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10, color: T.txt0, padding: "8px 12px", fontWeight: 800, fontSize: 11.5, cursor: "pointer" }}>
                  {isDark ? <SunMedium size={13} color={T.amber} /> : <MoonStar size={13} />}
                  <span>{isDark ? (lang === "bn" ? "লাইট মোড" : "Light Mode") : (lang === "bn" ? "ডার্ক মোড" : "Dark Mode")}</span>
                </button>
              </div>

              <button onClick={saveBoth} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.accent, color: "#000", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 900, cursor: "pointer", fontSize: 12 }}>
                <Save size={14} />
                <span>{lang === "bn" ? "সকল সেটিংস সেভ করুন" : "Save All System Settings"}</span>
              </button>
            </div>
          </section>
        )}
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: T.accent, color: "#000", padding: "10px 14px", borderRadius: 10, fontSize: 11.5, fontWeight: 900, boxShadow: T.shadow, zIndex: 400, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Settings2 size={14} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
