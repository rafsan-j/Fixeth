"use client";

type LoadingCanvasVariant =
  | "dashboard"
  | "workspace"
  | "learn"
  | "notebook"
  | "quiz"
  | "submissions"
  | "codespace"
  | "tools"
  | "community"
  | "certificates"
  | "mentor"
  | "list"
  | "library"
  | "auth"
  | "profile"
  | "centered";

type LoadingCanvasTheme = {
  bg0: string;
  bg1: string;
  bg2: string;
  bg3: string;
  border: string;
  shadow: string;
  accent: string;
  txt0: string;
  txt1: string;
  txt2: string;
};

const DEFAULT_THEME: LoadingCanvasTheme = {
  bg0: "#0B0B0F",
  bg1: "#14141A",
  bg2: "#1B1B24",
  bg3: "#242433",
  border: "rgba(255, 255, 255, 0.08)",
  shadow: "0 20px 60px rgba(0, 0, 0, 0.28)",
  accent: "#00C896",
  txt0: "#EEEEF8",
  txt1: "#A5A5C2",
  txt2: "#7D7D97"
};

import { themes } from "@/lib/ui/themes";
import { useEffect, useState } from "react";

export default function LoadingCanvas({
  variant = "dashboard",
  theme = DEFAULT_THEME,
  showTopBar = false
}: {
  variant?: LoadingCanvasVariant;
  theme?: Partial<LoadingCanvasTheme>;
  showTopBar?: boolean;
}) {
  const [clientT, setClientT] = useState<LoadingCanvasTheme | null>(null);

  useEffect(() => {
    try {
      const isDark = typeof window !== "undefined" && localStorage.getItem("fixeth.isDark") === "true";
      const rawPrefs = typeof window !== "undefined" ? localStorage.getItem("fixeth.userPreferences") : null;
      let accent = DEFAULT_THEME.accent;
      if (rawPrefs) {
        try {
          const parsed = JSON.parse(rawPrefs || "{}");
          accent = parsed?.accentColor || parsed?.accent || accent;
        } catch {}
      }
      const base = themes[isDark ? "dark" : "light"] as any;
      setClientT({ ...(DEFAULT_THEME as any), ...(base || {}), accent });
    } catch (err) {
      // ignore and keep defaults
    }
  }, []);

  const T = { ...(clientT ?? DEFAULT_THEME), ...theme } as LoadingCanvasTheme;
  const shimmer = `linear-gradient(90deg, ${T.bg2} 0%, ${T.bg3} 50%, ${T.bg2} 100%)`;

  return (
    <div style={{ minHeight: "100vh", overflow: "hidden", background: T.bg0, color: T.txt0 }}>
      <style>{`
        @keyframes fixeth-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {showTopBar ? <TopBar T={T} shimmer={shimmer} /> : null}

      <div
        style={{
          maxWidth: variant === "auth" ? 480 : variant === "dashboard" ? 1040 : 1080,
          margin: "0 auto",
          padding:
            variant === "auth"
              ? "32px 16px 48px"
              : variant === "workspace" || variant === "learn" || variant === "notebook" || variant === "quiz" || variant === "submissions"
                ? 0
                : "20px 16px 40px"
        }}
      >
        {variant === "auth" ? renderAuth(T, shimmer) : null}
        {variant === "dashboard" ? renderDashboard(T, shimmer) : null}
        {variant === "workspace" ? renderWorkspace(T, shimmer) : null}
        {variant === "learn" ? renderLearn(T, shimmer) : null}
        {variant === "notebook" ? renderNotebook(T, shimmer) : null}
        {variant === "quiz" ? renderQuiz(T, shimmer) : null}
        {variant === "submissions" ? renderSubmissions(T, shimmer) : null}
        {variant === "codespace" ? renderCodeSpace(T, shimmer) : null}
        {variant === "tools" ? renderTools(T, shimmer) : null}
        {variant === "community" ? renderCommunity(T, shimmer) : null}
        {variant === "certificates" ? renderCertificates(T, shimmer) : null}
        {variant === "mentor" ? renderMentor(T, shimmer) : null}
        {variant === "profile" ? renderProfile(T, shimmer) : null}
        {variant === "list" ? renderList(T, shimmer) : null}
        {variant === "library" ? renderLibrary(T, shimmer) : null}
        {variant === "centered" ? renderCentered(T, shimmer) : null}
      </div>
    </div>
  );
}

function TopBar({ T, shimmer }: { T: LoadingCanvasTheme; shimmer: string }) {
  return (
    <div style={{ height: 72, borderBottom: `1px solid ${T.border}`, background: T.bg0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
      <div style={{ width: 140, height: 18, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite" }} />
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite" }} />
        <div style={{ width: 34, height: 34, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
      </div>
    </div>
  );
}

function bar(width: string, height = 12) {
  return <div style={{ width, height, borderRadius: 999, background: "linear-gradient(90deg, #1B1B24 0%, #242433 50%, #1B1B24 100%)", backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite" }} />;
}

function renderAuth(T: LoadingCanvasTheme, shimmer: string) {
  return (
    <div style={{ position: "relative", minHeight: "calc(100vh - 80px)", display: "grid", placeItems: "center" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: -40, right: -20, width: 280, height: 280, borderRadius: 999, background: T.accent + "16", filter: "blur(32px)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -20, width: 300, height: 300, borderRadius: 999, background: T.accent + "10", filter: "blur(34px)" }} />
      </div>
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 120, height: 28, margin: "0 auto 10px", borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite" }} />
          <div style={{ width: "72%", height: 12, margin: "0 auto", borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
        </div>
        <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 24, padding: 24, boxShadow: T.shadow }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <div style={{ flex: 1, height: 38, borderRadius: 10, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite" }} />
            <div style={{ flex: 1, height: 38, borderRadius: 10, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ height: 44, borderRadius: 12, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite" }} />
            <div style={{ height: 44, borderRadius: 12, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
            <div style={{ height: 44, borderRadius: 12, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.16s" }} />
            <div style={{ height: 44, borderRadius: 12, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.24s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function renderDashboard(T: LoadingCanvasTheme, shimmer: string) {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg, ${T.bg2} 0%, ${T.accent}14 100%)`, border: `1px solid ${T.border}`, borderRadius: 18, padding: 24, boxShadow: T.shadow }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(280px, 0.9fr)", gap: 18 }}>
          <div style={{ display: "grid", gap: 10, maxWidth: 440 }}>
            {bar("40%", 18)}
            <div style={{ width: "78%", height: 42, borderRadius: 12, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
            {bar("62%", 14)}
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} style={{ width: 30, height: 30, borderRadius: 8, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.06}s` }} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", justifyContent: "center" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <div style={{ width: 138, height: 42, borderRadius: 10, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite" }} />
              <div style={{ width: 112, height: 42, borderRadius: 10, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
              <div style={{ width: 112, height: 42, borderRadius: 10, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.16s" }} />
            </div>
            {bar("170px", 12)}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, boxShadow: T.shadow, minHeight: 96, display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center" }}>
            <div style={{ flex: 1, display: "grid", gap: 10 }}>
              {bar("58%", 10)}
              <div style={{ width: "42%", height: 20, borderRadius: 8, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.06 + 0.05}s` }} />
              {bar("70%", 9)}
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05}s` }} />
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {[0, 1].map((section) => (
          <div key={section} style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, boxShadow: T.shadow }}>
            {bar("36%", 13)}
            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    {bar("52%", 11)}
                    {bar("36px", 11)}
                  </div>
                  <div style={{ height: 4, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05}s` }} />
                  {bar("40%", 9)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderWorkspace(T: LoadingCanvasTheme, shimmer: string) {
  return renderGuidedVideo(T, shimmer);
}

function renderGuidedVideo(T: LoadingCanvasTheme, shimmer: string) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: "calc(100vh - 80px)", padding: "16px" }}>
      {/* Header with title + dock toggle */}
      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 16px", boxShadow: T.shadow, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "grid", gap: 6 }}>
          {bar("32%", 11)}
          {bar("180px", 14)}
        </div>
        <div style={{ width: 140, height: 34, borderRadius: 8, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite" }} />
      </div>

      {/* Main layout: video (left, larger) + tabs panel (right) */}
      <div style={{ flex: 1, display: "flex", gap: 14, minHeight: 0 }}>
        {/* Left: Video Player */}
        <div style={{ flex: 1.3, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Video player with 16:9 ratio */}
          <div style={{ background: "#000", borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}`, boxShadow: T.shadow, aspectRatio: "16/9" }}>
            <div style={{ width: "100%", height: "100%", background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite" }} />
          </div>

          {/* Video controls strip */}
          <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 12px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite" }} />
            <div style={{ flex: 1, minWidth: 100, height: 3, borderRadius: 2, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.04s" }} />
            <div style={{ width: 60, height: 16, borderRadius: 4, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
            <div style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ width: 20, height: 20, borderRadius: 4, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${i * 0.05}s` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tabs Panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 280, background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", boxShadow: T.shadow }}>
          {/* Tabs selector */}
          <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, background: T.bg2 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 40, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${i * 0.05}s` }} />
            ))}
          </div>

          {/* Tab content area */}
          <div style={{ flex: 1, padding: 14, display: "grid", gap: 10, overflowY: "auto" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ height: i === 0 ? 100 : 46, borderRadius: 10, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${i * 0.05}s` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderWorkspaceLike(T: LoadingCanvasTheme, shimmer: string) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: "calc(100vh - 80px)" }}>
      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, boxShadow: T.shadow, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 8, minWidth: 260 }}>
          {bar("42%", 14)}
          {bar("78%", 12)}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} style={{ width: 120, height: 34, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05}s` }} />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, minHeight: 0 }}>
        <div style={{ flex: 1.3, minWidth: 300, display: "grid", gap: 12 }}>
          <div style={{ background: "#000", borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
            <div style={{ aspectRatio: "16 / 9", background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite" }} />
            <div style={{ height: 54, background: T.bg2, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", padding: "0 12px", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite" }} />
              <div style={{ flex: 1, display: "grid", gap: 6 }}>
                {bar("46%", 10)}
                {bar("72%", 6)}
              </div>
            </div>
          </div>
          <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 14, boxShadow: T.shadow, display: "grid", gap: 10 }}>
            {bar("26%", 12)}
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} style={{ height: 20, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05}s` }} />
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 280, display: "grid", gap: 12 }}>
          <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: T.shadow }}>
            <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} style={{ flex: 1, height: 42, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05}s` }} />
              ))}
            </div>
            <div style={{ padding: 14, display: "grid", gap: 12 }}>
              {bar("44%", 12)}
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} style={{ height: index === 0 ? 46 : 34, borderRadius: 10, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05}s` }} />
              ))}
            </div>
          </div>
          <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 14, boxShadow: T.shadow, display: "grid", gap: 10 }}>
            {bar("54%", 12)}
            <div style={{ height: 120, borderRadius: 12, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function renderLearn(T: LoadingCanvasTheme, shimmer: string) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0, 1fr) 320px", gap: 0, minHeight: "calc(100vh - 80px)" }}>
      <div style={{ background: "#080a11", borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ padding: "18px 16px 10px" }}>{bar("42%", 10)}</div>
        <div style={{ flex: 1, padding: "0 10px 14px", display: "grid", gap: 8 }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} style={{ height: 46, borderRadius: 10, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.04}s` }} />
          ))}
        </div>
        <div style={{ padding: 14, borderTop: `1px solid ${T.border}` }}>
          <div style={{ height: 42, borderRadius: 8, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite" }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", background: T.bg0, borderRight: `1px solid ${T.border}`, minHeight: 0 }}>
        <div style={{ padding: "14px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite" }} />
            <div style={{ display: "grid", gap: 6 }}>
              {bar("120px", 14)}
              {bar("210px", 10)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} style={{ width: 62, height: 28, borderRadius: 8, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05}s` }} />
            ))}
          </div>
        </div>

        <div style={{ padding: "12px 24px 6px", display: "flex", gap: 10, flexWrap: "wrap", flexShrink: 0 }}>
          <div style={{ width: 110, height: 28, borderRadius: 8, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite" }} />
          <div style={{ width: 110, height: 28, borderRadius: 8, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
          <div style={{ width: 110, height: 28, borderRadius: 8, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.16s" }} />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gap: 14 }}>
            {bar("52%", 18)}
            <div style={{ aspectRatio: "16 / 9", borderRadius: 16, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
            <div style={{ display: "grid", gap: 8 }}>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} style={{ height: 24, borderRadius: 8, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05}s` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "#0c0e17", display: "flex", flexDirection: "column", minHeight: 0, borderLeft: `1px solid ${T.border}` }}>
        <div style={{ padding: "14px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "grid", gap: 6, width: "100%" }}>
            {bar("42%", 12)}
            {bar("68%", 10)}
          </div>
        </div>
        <div style={{ flex: 1, padding: 14, display: "grid", gap: 10, overflowY: "auto" }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} style={{ height: index === 0 ? 120 : 96, borderRadius: 12, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function renderNotebook(T: LoadingCanvasTheme, shimmer: string) {
  return (
    <div style={{ display: "grid", gap: 14, minHeight: "calc(100vh - 80px)" }}>
      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, boxShadow: T.shadow, display: "grid", gap: 12 }}>
        {bar("46%", 16)}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} style={{ width: 120, height: 30, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05}s` }} />
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} style={{ display: "grid", gridTemplateColumns: "34px 1fr", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05}s` }} />
            <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, boxShadow: T.shadow, display: "grid", gap: 10 }}>
              {bar("28%", 12)}
              <div style={{ height: 82, borderRadius: 12, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05 + 0.04}s` }} />
              <div style={{ height: 56, borderRadius: 12, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05 + 0.08}s` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderQuiz(T: LoadingCanvasTheme, shimmer: string) {
  return (
    <div style={{ display: "grid", gap: 14, minHeight: "calc(100vh - 80px)" }}>
      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, boxShadow: T.shadow, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 8, width: "58%", minWidth: 260 }}>
          {bar("48%", 16)}
          {bar("86%", 11)}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.16s" }} />
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, boxShadow: T.shadow, display: "grid", gap: 12 }}>
          {bar("78%", 14)}
          <div style={{ display: "grid", gap: 8 }}>
            {Array.from({ length: 4 }).map((_, optionIndex) => (
              <div key={optionIndex} style={{ height: 34, borderRadius: 10, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05 + optionIndex * 0.04}s` }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function renderSubmissions(T: LoadingCanvasTheme, shimmer: string) {
  return (
    <div style={{ display: "grid", gap: 14, minHeight: "calc(100vh - 80px)" }}>
      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, boxShadow: T.shadow, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 8, width: "58%", minWidth: 260 }}>
          {bar("54%", 16)}
          {bar("84%", 11)}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 96, height: 32, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite" }} />
          <div style={{ width: 96, height: 32, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, boxShadow: T.shadow, display: "grid", gap: 10 }}>
          {bar("68%", 14)}
          {bar("42%", 10)}
          <div style={{ height: 6, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05}s` }} />
        </div>
      ))}
    </div>
  );
}

function renderCodeSpace(T: LoadingCanvasTheme, shimmer: string) {
  return (
    <div style={{ display: "grid", gridTemplateRows: "40px minmax(0, 1fr) 180px", gap: 12, minHeight: "calc(100vh - 80px)" }}>
      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 12, padding: 10, boxShadow: T.shadow, display: "flex", justifyContent: "space-between", gap: 8 }}>
        {bar("34%", 18)}
        <div style={{ display: "flex", gap: 8 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} style={{ width: 56, height: 18, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05}s` }} />
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0, 1fr)", gap: 12, minHeight: 0 }}>
        <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, boxShadow: T.shadow, display: "grid", gap: 10 }}>
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} style={{ height: 34, borderRadius: 10, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.04}s` }} />
          ))}
        </div>
        <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, boxShadow: T.shadow, display: "grid", gap: 10 }}>
          {bar("42%", 14)}
          <div style={{ flex: 1, borderRadius: 14, background: shimmer, backgroundSize: "400% 100%", minHeight: 360, animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
        </div>
      </div>
      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, boxShadow: T.shadow, display: "grid", gap: 10 }}>
        {bar("22%", 14)}
        <div style={{ height: 118, borderRadius: 12, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
      </div>
    </div>
  );
}

function renderTools(T: LoadingCanvasTheme, shimmer: string) {
  return (
    <div style={{ flex: 1, overflowY: "auto", background: T.bg0 }}>
      <div style={{ maxWidth: 840, margin: "0 auto", padding: "20px 16px 40px", display: "grid", gap: 20 }}>
        {/* Header */}
        <div style={{ display: "grid", gap: 8 }}>
          {bar("48%", 18)}
          {bar("100%", 11.5)}
        </div>

        {/* BYOA Section */}
        <div style={{ background: T.bg1, border: `1px solid ${T.accent}50`, borderRadius: 12, padding: 20, boxShadow: T.shadow, display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gap: 6 }}>
            {bar("42%", 13.5)}
            {bar("100%", 11)}
          </div>

          {/* Provider buttons grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ height: 74, borderRadius: 14, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${i * 0.05}s` }} />
            ))}
          </div>

          {/* Input + button area */}
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, height: 40, borderRadius: 8, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
            <div style={{ width: 160, height: 40, borderRadius: 8, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.12s" }} />
          </div>
        </div>

        {/* Resource Library Section */}
        <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22, boxShadow: T.shadow, display: "grid", gap: 14 }}>
          {bar("28%", 14)}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: 56, borderRadius: 12, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${i * 0.05}s` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderCommunity(T: LoadingCanvasTheme, shimmer: string) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {bar("44%", 20)}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} style={{ height: 96, borderRadius: 14, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05}s` }} />
        ))}
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, boxShadow: T.shadow, display: "grid", gap: 10 }}>
            {bar("70%", 14)}
            {bar("90%", 10)}
            <div style={{ height: 60, borderRadius: 12, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05 + 0.08}s` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function renderCertificates(T: LoadingCanvasTheme, shimmer: string) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        {bar("48%", 20)}
        <div style={{ width: 220, height: 34, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, boxShadow: T.shadow, display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ width: 80, height: 24, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05}s` }} />
              <div style={{ width: 56, height: 16, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05 + 0.04}s` }} />
            </div>
            {bar("74%", 18)}
            {bar("58%", 10)}
            <div style={{ height: 36, borderRadius: 10, background: shimmer, backgroundSize: "400% 100%", marginTop: 8, animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05 + 0.16}s` }} />
          </div>
        ))}
      </div>
      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, boxShadow: T.shadow, display: "grid", gap: 10 }}>
        {bar("28%", 14)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} style={{ height: 44, borderRadius: 12, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function renderMentor(T: LoadingCanvasTheme, shimmer: string) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0, 1fr) 320px", gap: 0, minHeight: "calc(100vh - 80px)" }}>
      {/* LEFT: Sessions Sidebar */}
      <div style={{ background: "#080a11", borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "18px 16px 10px 16px", fontSize: 10, color: "#6b7280", fontWeight: 800, letterSpacing: "1.5px" }}>
          {bar("42%", 10)}
        </div>
        <div style={{ flex: 1, padding: "0 10px 14px", display: "grid", gap: 8 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: 48, borderRadius: 10, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${i * 0.04}s` }} />
          ))}
        </div>
        <div style={{ padding: 14, borderTop: `1px solid ${T.border}` }}>
          <div style={{ height: 42, borderRadius: 8, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite" }} />
        </div>
      </div>

      {/* CENTER: Chat Workspace */}
      <div style={{ background: "#0c0e17", display: "flex", flexDirection: "column", minHeight: 0, borderRight: `1px solid ${T.border}` }}>
        {/* Header: Title + Cognitive level buttons */}
        <div style={{ padding: "14px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ display: "grid", gap: 6 }}>
            {bar("120px", 14)}
            {bar("80px", 10)}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ width: 72, height: 26, borderRadius: 6, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${i * 0.05}s` }} />
            ))}
          </div>
        </div>

        {/* Chat Messages Area */}
        <div style={{ flex: 1, padding: "16px 24px", display: "grid", gap: 16, overflowY: "auto" }}>
          {Array.from({ length: 5 }).map((_, i) => {
            const isAI = i % 2 === 0;
            return (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: isAI ? "flex-start" : "flex-end", justifyContent: isAI ? "flex-start" : "flex-end" }}>
                {isAI && <div style={{ width: 32, height: 32, borderRadius: "50%", background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${i * 0.04}s` }} />}
                <div style={{ display: "grid", gap: 8, maxWidth: "65%" }}>
                  {Array.from({ length: isAI ? 3 : 2 }).map((_, j) => (
                    <div key={j} style={{ height: 18, borderRadius: 8, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${i * 0.04 + j * 0.05}s` }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input area */}
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${T.border}`, flexShrink: 0, display: "flex", gap: 8 }}>
          <div style={{ flex: 1, height: 38, borderRadius: 8, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite" }} />
          <div style={{ width: 38, height: 38, borderRadius: 8, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
        </div>
      </div>

      {/* RIGHT: Context/Memory Panel */}
      <div style={{ background: "#0c0e17", display: "flex", flexDirection: "column", minHeight: 0, borderLeft: `1px solid ${T.border}` }}>
        <div style={{ padding: "14px 24px", borderBottom: `1px solid ${T.border}`, display: "grid", gap: 6, flexShrink: 0 }}>
          {bar("42%", 12)}
          {bar("68%", 10)}
        </div>
        <div style={{ flex: 1, padding: 14, display: "grid", gap: 12, overflowY: "auto" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ height: 64, borderRadius: 12, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${i * 0.05}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function renderProfile(T: LoadingCanvasTheme, shimmer: string) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        {bar("45%", 34)}
        <div style={{ width: 160, height: 38, borderRadius: 10, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
      </div>
      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20, boxShadow: T.shadow, display: "grid", gap: 12 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} style={{ height: 12, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.06}s` }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, boxShadow: T.shadow, minHeight: 180, display: "grid", gap: 12 }}>
            {bar("38%", 14)}
            {Array.from({ length: 4 }).map((__, row) => (
              <div key={row} style={{ height: 12, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${row * 0.05 + index * 0.04}s` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderList(T: LoadingCanvasTheme, shimmer: string) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        {bar("38%", 30)}
        <div style={{ width: 138, height: 40, borderRadius: 10, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, boxShadow: T.shadow, display: "grid", gap: 10 }}>
          {bar("28%", 12)}
          {bar("72%", 26)}
          {bar("58%", 10)}
          <div style={{ height: 6, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05}s` }} />
        </div>
      ))}
    </div>
  );
}

function renderLibrary(T: LoadingCanvasTheme, shimmer: string) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        {bar("36%", 30)}
        <div style={{ width: 170, height: 40, borderRadius: 10, background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
      </div>
      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, boxShadow: T.shadow }}>
        {bar("32%", 13)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14, marginTop: 16 }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} style={{ minHeight: 168, borderRadius: 14, border: `1px solid ${T.border}`, background: T.bg2, padding: 16, display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05}s` }} />
                <div style={{ width: 68, height: 20, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05 + 0.04}s` }} />
              </div>
              {bar("78%", 18)}
              {bar("60%", 12)}
              <div style={{ marginTop: "auto", width: 96, height: 36, borderRadius: 10, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.05 + 0.16}s` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderCentered(T: LoadingCanvasTheme, shimmer: string) {
  return (
    <div style={{ minHeight: "calc(100vh - 80px)", display: "grid", placeItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 360, display: "grid", gap: 14, textAlign: "center" }}>
        <div style={{ width: 84, height: 84, borderRadius: 28, margin: "0 auto", background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite" }} />
        <div style={{ width: "62%", height: 18, borderRadius: 999, margin: "0 auto", background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.08s" }} />
        <div style={{ width: "82%", height: 12, borderRadius: 999, margin: "0 auto", background: shimmer, backgroundSize: "400% 100%", animation: "fixeth-shimmer 1.3s ease-in-out infinite 0.16s" }} />
        <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, boxShadow: T.shadow, display: "grid", gap: 10 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} style={{ height: 12, borderRadius: 999, background: shimmer, backgroundSize: "400% 100%", animation: `fixeth-shimmer 1.3s ease-in-out infinite ${index * 0.06}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}