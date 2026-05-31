"use client";

import React, { useEffect, useState } from "react";
import CertificatePreview from "@/components/screens/CertificatePreview";

interface Certificate {
  id: string;
  name: string;
  nameBn: string;
  date: string;
  track: string;
  trackBn: string;
  score: number;
  earned?: boolean;
}

export default function CertificatesScreen({ T, t, lang, user }: { T: any; t: any; lang: string; user?: { id?: string; name?: string } }) {
  const [activeTab, setActiveTab] = useState<"certs" | "verify">("certs");
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loadingCerts, setLoadingCerts] = useState(true);

  // States for verification input
  const [verifyId, setVerifyId] = useState("SH-2026-A4F7B2");
  const [verificationResult, setVerificationResult] = useState<{
    status: "idle" | "success" | "fail";
    cert?: Certificate;
  }>({ status: "idle" });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [certs, setCerts] = useState<Certificate[] | null>(null);
  const hasEarnedCertificates = (certs || []).some((certificate) => certificate.earned);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingCerts(true);
        const res = await fetch("/api/certificates/list");
        if (!mounted) return;
        if (!res.ok) {
          throw new Error(`certificate list failed (${res.status})`);
        }
        const json = await res.json();
        const rows = (json?.data || []) as Array<Record<string, any>>;
        const mapped: Certificate[] = (rows || []).map((r) => ({
          id: String(r.id || r.cert_hash || r.certificate_id || ""),
          name: String(r.title || r.name || "Certificate"),
          nameBn: String(r.title_bn || ""),
          date: r.issued_at ? String(r.issued_at).split("T")[0] : "",
          track: String(r.track?.title_en || r.track_name || r.track || r.track_id || ""),
          trackBn: String(r.track_bn || ""),
          score: Number(r.score ?? 0),
          earned: true
        }));
        setCerts(mapped);
      } catch (err) {
        console.error("[Certificates] fetch error", err);
        setCerts([]);
      } finally {
        if (mounted) setLoadingCerts(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleVerify = () => {
    if (!verifyId.trim()) return;
    const list = certs || [];
    const found = list.find((x) => x.id.toUpperCase() === verifyId.trim().toUpperCase());
    if (found) {
      setVerificationResult({ status: "success", cert: found });
      showToast(lang === "bn" ? "সার্টিফিকেট সফলভাবে যাচাই করা হয়েছে" : "Certificate verified successfully!");
    } else {
      setVerificationResult({ status: "fail" });
      showToast(lang === "bn" ? "ভুল সার্টিফিকেট আইডি দেওয়া হয়েছে" : "Could not find a valid certificate with that ID");
    }
  };

  const copyVerifyLink = (id: string) => {
    const link = `https://fixeth.vercel.app/verify?id=${id}`;
    navigator.clipboard.writeText(link).then(() => {
      showToast(lang === "bn" ? "যাচাইকরণ লিংক ক্লিপবোর্ডে কপি হয়েছে!" : "Verification URL copied to Clipboard!");
    });
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", background: T.bg0, position: "relative" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px 60px" }}>
        
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderBottom: `1px solid ${T.border}`,
            paddingBottom: 16,
            marginBottom: 24,
            gap: 16,
            flexWrap: "wrap"
          }}
        >
          <div>
            <h1 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 20, fontWeight: 950, color: T.txt0, margin: 0 }}>
              <span>🎓</span>
              {lang === "bn" ? "সার্টিফিকেট ও পোর্টফোলিও" : "Certificates & Portfolio"}
            </h1>
            <p style={{ fontSize: 11.5, color: T.txt1, marginTop: 4, marginBottom: 0 }}>
              {lang === "bn"
                ? "ব্লকচেইন-যাচাইকৃত স্থায়ী লার্নিং সার্টিফিকেট — যা নিয়োগকর্তাদের সাথে শেয়ার করা সম্ভব"
                : "Blockchain-verifiable digital credentials — easily shareable with potential employers and recruiters"}
            </p>
          </div>

          {/* Tab Selector */}
          <div style={{ display: "flex", background: T.bg2, padding: 3, borderRadius: 8, border: `1px solid ${T.border}` }}>
            <button
              onClick={() => setActiveTab("certs")}
              style={{
                padding: "6px 14px",
                fontSize: 11.5,
                fontWeight: 800,
                borderRadius: 6,
                background: activeTab === "certs" ? T.accent : "none",
                color: activeTab === "certs" ? "#000" : T.txt1,
                border: "none",
                cursor: "pointer"
              }}
            >
              🏅 {lang === "bn" ? "আমার অর্জনসমূহ" : "My Credentials"}
            </button>
            <button
              onClick={() => {
                setActiveTab("verify");
                setVerificationResult({ status: "idle" });
              }}
              style={{
                padding: "6px 14px",
                fontSize: 11.5,
                fontWeight: 800,
                borderRadius: 6,
                background: activeTab === "verify" ? T.accent : "none",
                color: activeTab === "verify" ? "#000" : T.txt1,
                border: "none",
                cursor: "pointer"
              }}
            >
              🔍 {lang === "bn" ? "সার্টিফিকেট যাচাই" : "Verify Credential"}
            </button>
          </div>
        </div>

        {activeTab === "certs" ? (
          <div>
            {/* Grid for verified credentials and in progress indicator */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 28 }}>
              {loadingCerts ? (
                <div style={{ gridColumn: "1 / -1", padding: 18, border: `1px solid ${T.border}`, borderRadius: 12, background: T.bg1, color: T.txt1 }}>
                  {lang === "bn" ? "সার্টিফিকেট লোড হচ্ছে..." : "Loading certificates..."}
                </div>
              ) : null}

              {!loadingCerts && (certs || []).length === 0 ? (
                <div style={{ gridColumn: "1 / -1", padding: 18, border: `1px solid ${T.border}`, borderRadius: 12, background: T.bg1, color: T.txt1 }}>
                  {lang === "bn"
                    ? "এখনও কোনো সার্টিফিকেট পাওয়া যায়নি। একটি কোর্স ১০০% শেষ হলে এটি এখানে দেখা যাবে।"
                    : "No certificates yet. Finish a course to 100% and it will appear here."}
                </div>
              ) : null}

              {(certs || []).map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    if ((c as any).earned) {
                      setSelectedCert(c);
                      setShowPreview(true);
                    } else {
                      showToast(lang === "bn" ? "এই ভিউটি একটি প্রিভিউ — আপনার অর্জিত সার্টিফিকেট নয়" : "This is a preview — not an earned certificate");
                    }
                  }}
                  style={{
                    background: T.bg1,
                    border: `1.5px solid ${T.border}`,
                    borderRadius: 12,
                    padding: "18px 20px",
                    cursor: "pointer",
                    position: "relative",
                    boxShadow: T.shadow,
                    transition: "all 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = T.accent;
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div>
                    {/* ID & Date top block */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 9, fontWeight: 900, padding: "3px 8px", borderRadius: 6, border: `1px solid ${T.accent}33`, background: (c as any).earned ? T.accentDim : T.bg2, color: (c as any).earned ? T.accent : T.txt2 }}>
                        {(c as any).earned ? `✓ ${lang === "bn" ? "যাচাইকৃত" : "VERIFIED"}` : (lang === "bn" ? "প্রিভিউ" : "PREVIEW")}
                      </span>
                      <span style={{ fontSize: 10, color: T.txt2 }}>
                        {c.date}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 14, fontWeight: 900, color: T.txt0, margin: "0 0 4px" }}>
                      {lang === "bn" ? c.nameBn : c.name}
                    </h3>
                    <p style={{ fontSize: 11, color: T.txt1, margin: 0 }}>
                      {lang === "bn" ? `মূল্যায়ন স্কোর: ${c.score}% • ট্র্যাক: ${c.trackBn}` : `Assessment Score: ${c.score}% • Track: ${c.track}`}
                    </p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${T.border}`, marginTop: 16, paddingTop: 12 }}>
                    <code style={{ fontSize: 10, color: T.txt1, background: T.bg2, padding: "2px 6px", borderRadius: 4, letterSpacing: "0.2px" }}>
                      {c.id}
                    </code>
                    <span style={{ fontSize: 11, color: (c as any).earned ? T.accent : T.txt2, fontWeight: 800 }}>
                      {(c as any).earned ? (lang === "bn" ? "সনদ দেখুন" : "View →") : (lang === "bn" ? "প্রিভিউ" : "Preview")}
                    </span>
                  </div>
                </div>
              ))}

              {showPreview && selectedCert && (
                <CertificatePreview cert={selectedCert} user={user} onClose={() => setShowPreview(false)} />
              )}

              {!hasEarnedCertificates ? (
                <div
                  style={{
                    background: T.bg1,
                    border: `1.5px dashed ${T.borderHi}`,
                    borderRadius: 12,
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center"
                  }}
                >
                  <div style={{ fontSize: 26, marginBottom: 8, animation: "bounce 2s infinite" }}>⏳</div>
                  <h3 style={{ fontSize: 12.5, fontWeight: 800, color: T.txt0, margin: "0 0 2px" }}>
                    {lang === "bn" ? "পরবর্তী সার্টিফিকেট প্রক্রিয়াকরণে" : "Next Certificate in Progress"}
                  </h3>
                  <p style={{ fontSize: 10.5, color: T.txt1, margin: "0 0 12px" }}>
                    {lang === "bn" ? "প্যান্ডাস লাইব্রেরি ডিপ ডাইভ • ৬০% সম্পন্ন" : "Pandas Deep Dive • 60% Complete"}
                  </p>

                  {/* Simulated Animated Progress Bar */}
                  <div style={{ width: "100%", background: T.bg2, height: 6, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: "60%", background: `linear-gradient(90deg, ${T.purple}, ${T.accent})`, height: "100%", borderRadius: 3 }} />
                  </div>
                </div>
              ) : null}
            </div>

            {/* PORTFOLIO PROJECTS PANEL */}
            <div
              style={{
                background: T.bg1,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: "20px",
                boxShadow: T.shadow
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${T.border}`, paddingBottom: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 16 }}>📁</span>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: T.txt0, margin: 0 }}>
                  {lang === "bn" ? "পোর্টফোলিও প্রোজেক্ট গ্যালারি" : "Verified Student Portfolio Projects"}
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                {[
                  {
                    title: "Bangladesh Sales Analytical Dashboard",
                    titleBn: "জাতীয় পণ্য বিক্রয় বিশ্লেষণ ড্যাশবোর্ড",
                    desc: "Interactive Pandas + Plotly interactive framework deployed on sandbox server.",
                    descBn: "প্যান্ডাস এবং প্লটলি ফ্রেমওয়ার্কে তৈরি সেলস এনালিটিক্স অ্যাপ।",
                    tech: "Pandas + Plotly",
                    lbl: lang === "bn" ? "লাইভ ডেমো" : "View Live Demo →"
                  },
                  {
                    title: "Weather Predictor System Engine",
                    titleBn: "আবহাওয়া পূর্বাভাস প্রাক্কলন সিস্টেম",
                    desc: "Linear Regression model trained locally in workspace container notebooks.",
                    descBn: "লিনিয়ার রিগ্রেশন বা ম্যাথমেটিক্যাল এনালাইসিস ইঞ্জিন।",
                    tech: "Scikit-Learn Regression",
                    lbl: lang === "bn" ? "গিটহাব কোড" : "View GitHub →"
                  },
                  {
                    title: "Telecom Customer Churn Classifier",
                    titleBn: "টেলিকম কাস্টমার চার্ন ক্লাসিফায়ার",
                    desc: "Decision trees to evaluate subscriber retention statistics and matrices.",
                    descBn: "কাস্টমার লাইফটাইম ভ্যালু ও রিটেনশন ল্যাব স্ক্রিপ্ট।",
                    tech: "Scikit-Learn Classifier",
                    lbl: lang === "bn" ? "নোটবুক দেখুন" : "View Notebook →"
                  }
                ].map((proj, i) => (
                  <div
                    key={i}
                    style={{
                      background: T.bg2,
                      border: `1px solid ${T.border}`,
                      borderRadius: 10,
                      padding: 14,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 8.5, fontWeight: 900, background: T.blueDim, color: T.blue, padding: "2px 6px", borderRadius: 4 }}>
                        {lang === "bn" ? "বাস্তব প্রকল্প" : "PROJECT"}
                      </span>
                      <h4 style={{ fontSize: 12, fontWeight: 850, color: T.txt0, margin: "6px 0 3px" }}>
                        {lang === "bn" ? proj.titleBn : proj.title}
                      </h4>
                      <p style={{ fontSize: 10.5, color: T.txt1, margin: "0 0 12px", lineHeight: 1.4 }}>
                        {lang === "bn" ? proj.descBn : proj.desc}
                      </p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${T.border}`, paddingTop: 10, marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: T.txt2, fontFamily: "monospace" }}>{proj.tech}</span>
                      <button
                        disabled
                        aria-disabled
                        title={lang === "bn" ? "লাইভ স্যান্ডবক্স শীঘ্রই আসছে" : "Live sandbox demo coming soon"}
                        style={{ background: "none", border: "none", color: T.txt2, fontSize: 10.5, fontWeight: 800, cursor: "not-allowed", opacity: 0.6 }}
                      >
                        {proj.lbl}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* VERIFY PANEL (Matches /verify) */
          <div
            style={{
              background: T.bg1,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: 24,
              boxShadow: T.shadow,
              maxWidth: 640,
              margin: "0 auto"
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 800, color: T.txt0, margin: "0 0 8px" }}>
              🔍 {lang === "bn" ? "সনদপত্রের সত্যতা যাচাইকরণ" : "Credential Ledger Verification"}
            </h3>
            <p style={{ fontSize: 11, color: T.txt1, margin: "0 0 20px" }}>
              {lang === "bn"
                ? "আমাদের যেকোনো সার্টিফিকেটের ইউনিক ক্রডেন্সিয়াল আইডি প্রদান কারুন, সিস্টেম স্বয়ংক্রিয়ভাবে ব্লকচেইন প্রমাণ প্যানেল থেকে বৈধতা যাচাই করবে।"
                : "Enter any Fixeth certificate ID to instantly evaluate authentic issuance dates and performance metrics."}
            </p>

            <label style={{ fontSize: 11, fontWeight: 700, color: T.txt0, display: "block", marginBottom: 6 }}>
              {lang === "bn" ? "সার্টিফিকেট আইডি" : "Certificate ID"}
            </label>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="e.g. SH-2026-A4F7B2"
                value={verifyId}
                onChange={(e) => setVerifyId(e.target.value)}
                style={{
                  flex: 1,
                  background: T.bg2,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "#fff",
                  outline: "none",
                  fontFamily: "monospace"
                }}
              />
              <button
                onClick={handleVerify}
                style={{
                  background: T.accent,
                  color: "#000",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  fontSize: 11.5,
                  fontWeight: 900,
                  cursor: "pointer"
                }}
              >
                {lang === "bn" ? "অনুসন্ধান" : "Verify Authenticity"}
              </button>
            </div>

            {/* RESULTS */}
            {verificationResult.status === "success" && verificationResult.cert && (
              <div
                style={{
                  background: "rgba(0, 200, 150, 0.08)",
                  border: `1.5px solid ${T.accent}`,
                  borderRadius: 10,
                  padding: "16px 18px",
                  marginTop: 20
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 800, color: T.accent, display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <span>✓</span>
                  {lang === "bn" ? "সত্যতা সফল — এটি একটি বৈধ Fixeth ডিজিটাল সার্টিফিকেট" : "Credential Verified — Authentic Fixeth Ledger Record"}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: T.bg0, padding: 12, borderRadius: 8 }}>
                  <div>
                    <span style={{ fontSize: 9.5, color: T.txt1, display: "block" }}>{lang === "bn" ? "সার্টিফিকেটধারী" : "Recipient User"}</span>
                    <strong style={{ fontSize: 11.5, color: T.txt0 }}>{user?.name ?? "John Doe"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 9.5, color: T.txt1, display: "block" }}>{lang === "bn" ? "ইস্যুর তারিখ" : "Issuance Date"}</span>
                    <strong style={{ fontSize: 11.5, color: T.txt0 }}>{verificationResult.cert.date}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 9.5, color: T.txt1, display: "block" }}>{lang === "bn" ? "কোর্স বা মডিউল" : "Acquired Credential"}</span>
                    <strong style={{ fontSize: 11.5, color: T.txt0 }}>{lang === "bn" ? verificationResult.cert.nameBn : verificationResult.cert.name}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 9.5, color: T.txt1, display: "block" }}>{lang === "bn" ? "অর্জিত স্কোর" : "Obtained Score"}</span>
                    <strong style={{ fontSize: 11.5, color: T.txt0 }}>{verificationResult.cert.score}%</strong>
                  </div>
                </div>
              </div>
            )}

            {verificationResult.status === "fail" && (
              <div
                style={{
                  background: "rgba(255, 91, 91, 0.08)",
                  border: `1.5px solid ${T.red}`,
                  borderRadius: 10,
                  padding: "14px 16px",
                  marginTop: 20
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, color: T.red, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span>✗</span>
                  {lang === "bn" ? "ভুল সার্টিফিকেট আইডি দেওয়া হয়েছে!" : "Invalid ID — No Certificate Ledger Match Found"}
                </div>
                <p style={{ fontSize: 11, color: T.txt1, margin: 0 }}>
                  {lang === "bn" ? "অনুগ্রহ করে সার্টিফিকেট আইডি ভালো করে দেখুন, অথবা 'আমার অর্জনসমূহ' থেকে নমুনা কোড কপি করুন।" : "Double check the capitalization and sequence formatting. E.g. try: SH-2026-A4F7B2"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* LUXURY DIPLOMA BLUEPRINT VIEW MODAL */}
      {selectedCert && (selectedCert as any).earned && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: T.bg1,
              border: `1.5px solid ${T.borderHi}`,
              borderRadius: 14,
              maxWidth: 640,
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 12px 36px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Upper dialog header */}
            <div style={{ background: T.bg2, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: T.txt1 }}>
                🎓 {lang === "bn" ? "আউটপুট প্রিভিউ" : "Official Certificate Showcase View"}
              </span>
              <button
                onClick={() => setSelectedCert(null)}
                style={{ background: "none", border: "none", color: T.txt1, cursor: "pointer", fontSize: 16 }}
              >
                ✕
              </button>
            </div>

            {/* PREMIUM CERTIFICATE DIPLOMA BOX MATCHING IMAGE SCHEME */}
            <div style={{ padding: "30px 24px" }}>
                <div
                style={{
                  background: T.bg0,
                  border: `4px double ${T.accent}`,
                  borderRadius: 12,
                  padding: "36px 20px",
                  textAlign: "center",
                  position: "relative",
                  boxShadow: `inset 0 0 40px ${T.accent}22`
                }}
                >
                {/* Vintage Corners Decor */}
                <div style={{ position: "absolute", top: 10, left: 10, borderTop: `2px solid ${T.accent}`, borderLeft: `2px solid ${T.accent}`, width: 14, height: 14 }} />
                <div style={{ position: "absolute", top: 10, right: 10, borderTop: `2px solid ${T.accent}`, borderRight: `2px solid ${T.accent}`, width: 14, height: 14 }} />
                <div style={{ position: "absolute", bottom: 10, left: 10, borderBottom: `2px solid ${T.accent}`, borderLeft: `2px solid ${T.accent}`, width: 14, height: 14 }} />
                <div style={{ position: "absolute", bottom: 10, right: 10, borderBottom: `2px solid ${T.accent}`, borderRight: `2px solid ${T.accent}`, width: 14, height: 14 }} />

                <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontStyle: "italic", margin: "0 0 4px", color: T.accent, letterSpacing: "1px" }}>
                  Fixeth
                </h2>
                <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "2px", color: T.txt1, display: "block", marginBottom: 20 }}>
                  {lang === "bn" ? "সাফল্যের সনদপত্র" : "Certificate of Completion"}
                </div>

                <div style={{ fontSize: 11, color: T.txt1, marginBottom: 8 }}>
                  {lang === "bn" ? "গর্বের সাথে প্রদান করা হচ্ছে:" : "THIS OFficiAL CREDENTIAL PROVES THAT"}
                </div>
                <div style={{ fontSize: 22, fontWeight: 950, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.5px", margin: "10px 0" }}>
                  {user?.name ?? "John Doe"}
                </div>
                <div style={{ fontSize: 11, color: T.txt1, marginBottom: 12 }}>
                  {lang === "bn" ? "সফলতার সাথে কোর্স সম্পন্ন করেছেন" : "has successfully fulfilled educational requirements & assessment modules for"}
                </div>

                <div style={{ fontSize: 17, fontWeight: 800, color: T.accent, margin: "10px 0" }}>
                  {lang === "bn" ? selectedCert.nameBn : selectedCert.name}
                </div>

                <div style={{ fontSize: 10, color: T.txt2, marginBottom: 28 }}>
                  {lang === "bn" ? `মূল্যায়ন স্কোর: ${selectedCert.score}% • ট্র্যাক: ${selectedCert.trackBn}` : `Track Focus: ${selectedCert.track} • Placement Standings: ${selectedCert.score}%`}
                </div>

                {/* Team sign-off side-by-side */}
                <div style={{ display: "flex", justifyContent: "space-around", gap: 16, marginTop: 20, borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
                  <div>
                    <span style={{ fontSize: 12, fontFamily: "Georgia, serif", fontStyle: "italic", color: "#fff", display: "block" }}>Jawat Al Sovon</span>
                    <span style={{ fontSize: 8.5, color: T.txt1, display: "block", marginTop: 2 }}>{lang === "bn" ? "সাইনিং অথরিটি, ফিক্সেথ" : "Signing Authority, Fixeth"}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 12, fontFamily: "monospace", color: "#fff", display: "block" }}>{selectedCert.date}</span>
                    <span style={{ fontSize: 8.5, color: T.txt1, display: "block", marginTop: 2 }}>{lang === "bn" ? "যাচাইকৃত ইস্যু তারিখ" : "Verified Issuance Date"}</span>
                  </div>
                </div>

                {/* Certificate blockchain ID */}
                <span style={{ display: "block", fontSize: 9, color: T.txt2, fontFamily: "monospace", marginTop: 24 }}>
                  Verification Ledger: https://fixeth.vercel.app/verify?id={selectedCert.id}
                </span>

                <div style={{ marginTop: 12, fontSize: 11, color: T.txt1 }}>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>{lang === "bn" ? "টিম" : "Team"}</div>
                  <div>{lang === "bn" ? "Jawat Al Sovon • Shafin Ahmed Shoron • Rafsan Jani" : "Jawat Al Sovon • Shafin Ahmed Shoron • Rafsan Jani"}</div>
                  <div style={{ marginTop: 4, fontSize: 10, color: T.txt2 }}>{lang === "bn" ? "টিমের সদস্যরা সনদ যাচাই ও সাইন অফ করেন" : "Team members sign and validate the credential"}</div>
                </div>
              </div>
            </div>

            {/* Modal actions footer */}
            <div style={{ background: T.bg2, padding: "14px 20px", display: "flex", justifyContent: "flex-end", gap: 10, borderTop: `1px solid ${T.border}` }}>
              <button
                disabled
                aria-disabled
                title={lang === "bn" ? "PDF ডাউনলোড শীঘ্রই আসছে" : "PDF download coming soon"}
                style={{
                  background: "transparent",
                  border: `1.5px solid ${T.borderHi}`,
                  color: T.txt0,
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: "not-allowed",
                  opacity: 0.7
                }}
              >
                🖨️ {lang === "bn" ? "ডাউনলোড PDF" : "Download PDF"}
              </button>

              <button
                disabled
                aria-disabled
                title={lang === "bn" ? "LinkedIn শেয়ার শীঘ্রই আসছে" : "LinkedIn share coming soon"}
                style={{
                  background: "transparent",
                  border: `1.5px solid ${T.borderHi}`,
                  color: T.txt0,
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: "not-allowed",
                  opacity: 0.7
                }}
              >
                💼 {lang === "bn" ? "LinkedIn এ শেয়ার" : "Share on LinkedIn"}
              </button>

              <button
                onClick={() => copyVerifyLink(selectedCert.id)}
                style={{
                  background: T.accent,
                  color: "#000",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontSize: 11.5,
                  fontWeight: 900,
                  cursor: "pointer"
                }}
              >
                🔗 {lang === "bn" ? "কপি যাচাইকরণ লিংক" : "Copy Verification link"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE TOAST */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#00c896",
            color: "#040407",
            padding: "12px 20px",
            borderRadius: 8,
            boxShadow: "0 6px 18px rgba(0,200,150,0.3)",
            fontWeight: 900,
            fontSize: 12,
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            gap: 8,
            animation: "fadeInUp 0.15s ease-out"
          }}
        >
          <span>✓</span>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
