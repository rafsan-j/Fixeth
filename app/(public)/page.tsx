"use client";

import Link from "next/link";
import { Clock, Languages, TrendingUp, GitBranch, ArrowRight, Play } from "lucide-react";
import { usePublicPrefs } from "@/components/public/public-lang";

const COPY = {
  en: {
    heroEyebrow: "AI-native learning for Bangladesh",
    heroTitle1: "Learn in Bangla.",
    heroTitle2: "Get hired globally.",
    heroSub:
      "170 million people. Half under 30. Fixeth turns any YouTube lecture into an AI tutor that answers in English or বাংলা — and seeks to the exact moment in the video.",
    ctaPrimary: "Start learning free",
    ctaSecondary: "See pricing",
    chatQuestion: "What is a prompt?",
    chatAnswerPre: "A prompt is the instruction you give the AI — explained at ",
    chatAnswerPost: " in this lecture.",
    seekLabel: "Video seeks to 14:32",
    featuresTitle: "Built for how Bangladesh actually learns",
    features: [
      {
        icon: "clock",
        title: "Timestamp-seek AI chat",
        body: "Ask any question. The AI finds the exact moment in the video where it's explained — and jumps there."
      },
      {
        icon: "languages",
        title: "Bengali-first, always",
        body: "UI, subtitles and the AI tutor work in both English and বাংলা. Technical terms stay in English."
      },
      {
        icon: "trending",
        title: "Live job market signals",
        body: "Skills demand scraped weekly from Bdjobs and Chakri. Your curriculum follows what employers want."
      },
      {
        icon: "graph",
        title: "Adaptive learning path",
        body: "A concept graph tracks prerequisites — skip what you know, get remedial help where you struggle."
      }
    ],
    statTracks: "Published tracks",
    statLangs: "Languages",
    statSignals: "Job sources tracked",
    bottomTitle: "Thirty seconds to start.",
    bottomSub: "Google sign-in. No credit card. Bengali-first from the first screen.",
    bottomCta: "Sign up"
  },
  bn: {
    heroEyebrow: "বাংলাদেশের জন্য AI-নেটিভ শিক্ষা",
    heroTitle1: "বাংলায় শিখুন।",
    heroTitle2: "বিশ্বে কাজ করুন।",
    heroSub:
      "১৭ কোটি মানুষ। অর্ধেকের বয়স ৩০-এর নিচে। Fixeth যেকোনো ইউটিউব লেকচারকে এমন এক AI টিউটরে বদলে দেয় যে ইংরেজি বা বাংলায় উত্তর দেয় — এবং ভিডিওর সঠিক মুহূর্তে নিয়ে যায়।",
    ctaPrimary: "ফ্রি শেখা শুরু করুন",
    ctaSecondary: "মূল্য দেখুন",
    chatQuestion: "প্রম্পট কী?",
    chatAnswerPre: "প্রম্পট হলো AI-কে দেওয়া নির্দেশনা — এই লেকচারের ",
    chatAnswerPost: " মিনিটে ব্যাখ্যা করা হয়েছে।",
    seekLabel: "ভিডিও চলে যাচ্ছে ১৪:৩২-এ",
    featuresTitle: "বাংলাদেশ যেভাবে শেখে, সেভাবেই তৈরি",
    features: [
      {
        icon: "clock",
        title: "টাইমস্ট্যাম্প-সিক AI চ্যাট",
        body: "যেকোনো প্রশ্ন করুন। AI ভিডিওর সঠিক মুহূর্তটি খুঁজে বের করে — এবং সেখানেই নিয়ে যায়।"
      },
      {
        icon: "languages",
        title: "সবসময় বাংলা-প্রথম",
        body: "UI, সাবটাইটেল এবং AI টিউটর — ইংরেজি ও বাংলা দুই ভাষাতেই। টেকনিক্যাল শব্দ ইংরেজিতেই থাকে।"
      },
      {
        icon: "trending",
        title: "লাইভ জব মার্কেট সিগন্যাল",
        body: "Bdjobs ও Chakri থেকে প্রতি সপ্তাহে স্কিল চাহিদা সংগ্রহ। কারিকুলাম চলে চাকরিদাতাদের চাহিদা অনুযায়ী।"
      },
      {
        icon: "graph",
        title: "অ্যাডাপটিভ লার্নিং পাথ",
        body: "কনসেপ্ট গ্রাফ পূর্বশর্ত ট্র্যাক করে — যা জানেন তা স্কিপ করুন, যেখানে আটকে যান সেখানে সাহায্য পান।"
      }
    ],
    statTracks: "প্রকাশিত ট্র্যাক",
    statLangs: "ভাষা",
    statSignals: "জব সোর্স ট্র্যাকিং",
    bottomTitle: "শুরু করতে লাগে মাত্র ত্রিশ সেকেন্ড।",
    bottomSub: "Google সাইন-ইন। কোনো ক্রেডিট কার্ড লাগবে না। প্রথম স্ক্রিন থেকেই বাংলা।",
    bottomCta: "ফ্রি সাইন আপ"
  }
};

const FEATURE_ICONS = {
  clock: Clock,
  languages: Languages,
  trending: TrendingUp,
  graph: GitBranch
} as const;

export default function LandingPage() {
  const { lang } = usePublicPrefs();
  const c = COPY[lang];

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[640px] -translate-x-1/2 rounded-full bg-[#00C896]/15 blur-3xl" />

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-14 lg:grid-cols-2 lg:gap-14 lg:pb-24 lg:pt-20">
          <div>
            <div
              style={{ animation: "fixeth-fade-up 0.5s ease both" }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00C896]/30 bg-[#00C896]/10 px-3.5 py-1.5 text-xs font-bold text-[#00A87E] dark:text-[#00C896]"
            >
              <span className="size-1.5 rounded-full bg-[#00C896]" />
              {c.heroEyebrow}
            </div>

            <h1
              style={{ animation: "fixeth-fade-up 0.5s ease both 0.12s" }}
              className="text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
            >
              {c.heroTitle1}
              <br />
              <span className="bg-gradient-to-r from-[#00C896] to-[#3AA0FF] bg-clip-text text-transparent">
                {c.heroTitle2}
              </span>
            </h1>

            <p
              style={{ animation: "fixeth-fade-up 0.5s ease both 0.24s" }}
              className="mt-5 max-w-xl text-base leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-lg"
            >
              {c.heroSub}
            </p>

            <div
              style={{ animation: "fixeth-fade-up 0.5s ease both 0.36s" }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#00C896] px-6 py-3 text-base font-extrabold text-black no-underline shadow-[0_8px_30px_rgba(0,200,150,0.35)] transition-transform hover:-translate-y-0.5"
              >
                {c.ctaPrimary}
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-neutral-300 px-6 py-3 text-base font-bold text-neutral-700 no-underline dark:border-neutral-700 dark:text-neutral-200"
              >
                {c.ctaSecondary}
              </Link>
            </div>

            <div
              style={{ animation: "fixeth-fade-up 0.5s ease both 0.48s" }}
              className="mt-10 flex gap-8"
            >
              {[
                ["5+", c.statTracks],
                ["EN · বাংলা", c.statLangs],
                ["6", c.statSignals]
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="text-xl font-black text-neutral-900 dark:text-white">{value}</div>
                  <div className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div
            style={{ animation: "fixeth-scale-in 0.6s ease both 0.25s" }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl dark:border-neutral-800 dark:bg-[#13131A]">
              {/* Mock video frame */}
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900">
                <div
                  style={{ animation: "fixeth-pulse-play 2.4s ease-in-out infinite" }}
                  className="flex size-14 items-center justify-center rounded-full bg-[#00C896]"
                >
                  <Play size={22} className="ml-0.5 text-black" fill="currentColor" />
                </div>
                {/* Seek bar */}
                <div className="absolute inset-x-3 bottom-3">
                  <div className="relative h-1.5 rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-[#00C896]"
                      style={{ animation: "fixeth-seekbar 5s linear infinite" }}
                    />
                    <div
                      className="absolute -top-7 rounded-md bg-[#F5A623] px-1.5 py-0.5 font-mono text-[10px] font-black text-black"
                      style={{ animation: "fixeth-timestamp-pos 5s linear infinite" }}
                    >
                      14:32
                    </div>
                  </div>
                </div>
              </div>

              {/* Mock chat */}
              <div className="mt-4 flex flex-col gap-2.5">
                <div className="self-end rounded-2xl rounded-br-md bg-[#00C896] px-3.5 py-2 text-sm font-semibold text-black">
                  {c.chatQuestion}
                </div>
                <div
                  style={{ animation: "fixeth-fade-in-up 0.4s ease both 0.9s" }}
                  className="self-start rounded-2xl rounded-bl-md bg-neutral-100 px-3.5 py-2 text-sm leading-relaxed text-neutral-800 dark:bg-[#22222E] dark:text-neutral-200"
                >
                  {c.chatAnswerPre}
                  <span
                    style={{ display: "inline-flex", animation: "fixeth-pulse-small 1.6s ease-in-out infinite" }}
                    className="mx-0.5 cursor-pointer items-center gap-1 rounded-md border border-[#F5A623]/40 bg-[#F5A623]/15 px-1.5 py-0.5 font-mono text-xs font-black text-[#C07000] dark:text-[#F5A623]"
                  >
                    ⏱ 14:32
                  </span>
                  {c.chatAnswerPost}
                </div>
                <div
                  style={{ animation: "fixeth-fade-in 0.4s ease both 1.6s" }}
                  className="self-start text-xs font-bold text-[#00A87E] dark:text-[#00C896]"
                >
                  ▶ {c.seekLabel}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature cards ───────────────────────────────────── */}
      <section className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-[#0F0F16]">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
          <h2 className="text-center text-2xl font-black tracking-tight sm:text-3xl">
            {c.featuresTitle}
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.features.map((feature, idx) => {
              const Icon = FEATURE_ICONS[feature.icon as keyof typeof FEATURE_ICONS];
              return (
                <div
                  key={feature.title}
                  style={{ animation: `fixeth-fade-up 0.45s ease both ${idx * 0.08}s` }}
                  className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#13131A]"
                >
                  <div className="mb-3.5 flex size-10 items-center justify-center rounded-xl bg-[#00C896]/12 text-[#00A87E] dark:text-[#00C896]">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-extrabold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {feature.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center lg:py-24">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{c.bottomTitle}</h2>
        <p className="mx-auto mt-3 max-w-md text-base text-neutral-600 dark:text-neutral-400">
          {c.bottomSub}
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#00C896] px-8 py-3 text-base font-extrabold text-black no-underline shadow-[0_8px_30px_rgba(0,200,150,0.35)] transition-transform hover:-translate-y-0.5"
        >
          {c.bottomCta}
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
