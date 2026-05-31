"use client";

import React, { useEffect } from "react";

export default function CertificatePreview({ cert, user, onClose }: { cert: any; user?: any; onClose: () => void }) {
  useEffect(() => {
    const onContext = (e: Event) => e.preventDefault();
    const onBeforePrint = () => {
      // Hide sensitive preview during printing
      document.body.style.pointerEvents = "none";
    };
    const onAfterPrint = () => {
      document.body.style.pointerEvents = "auto";
    };

    const onVisibility = () => {
      if (document.hidden) {
        // Blur the certificate when tab is hidden
        const el = document.getElementById("cert-preview-content");
        if (el) el.style.filter = "blur(8px) brightness(0.6)";
      } else {
        const el = document.getElementById("cert-preview-content");
        if (el) el.style.filter = "none";
      }
    };

    window.addEventListener("contextmenu", onContext);
    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    document.addEventListener("visibilitychange", onVisibility);

    // Prevent selection
    document.documentElement.style.userSelect = "none";

    return () => {
      window.removeEventListener("contextmenu", onContext);
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
      document.removeEventListener("visibilitychange", onVisibility);
      document.documentElement.style.userSelect = "auto";
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div
        id="cert-preview-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 920,
          maxWidth: "95%",
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <button onClick={onClose} style={{ position: "absolute", right: 12, top: 12 }}>Close</button>

        {/* Certificate canvas */}
        <div style={{ position: "relative", padding: 24, background: "#fafafa" }}>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>{cert?.name || "Certificate"}</h2>
            <p style={{ margin: 0, fontSize: 13 }}>{cert?.track || "Track"}</p>
          </div>

          <div style={{ height: 360, position: "relative", borderRadius: 6, border: "1px solid #e6e6e6", overflow: "hidden" }}>
            {/* Main certificate area */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <h1 style={{ fontSize: 36, margin: 0 }}>{user?.name || "Your Name"}</h1>
                <p style={{ marginTop: 8 }}>{`Certificate ID: ${cert?.id ?? cert?.cert_hash ?? "-"}`}</p>
              </div>
            </div>

            {/* Repeating watermark overlay */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              {Array.from({ length: 6 }).map((_, row) => (
                <div key={row} style={{ display: "flex", gap: 12, justifyContent: "center", transform: `translateY(${row * 60}px)` }}>
                  {Array.from({ length: 8 }).map((__, col) => (
                    <div
                      key={col}
                      style={{
                        opacity: 0.12,
                        transform: "rotate(-20deg)",
                        fontSize: 18,
                        color: "#000",
                        width: 180,
                        textAlign: "center"
                      }}
                    >
                      {`${user?.name || "Learner"} • ${cert?.id ?? cert?.cert_hash ?? "CERT"}`}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
