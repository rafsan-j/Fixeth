"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Globe2,
  GraduationCap,
  ArrowRight,
  Languages,
  TrendingUp,
  Zap,
  Server,
  AlertCircle,
  Briefcase,
  Users,
  Rocket,
  Cpu,
  Building2,
  Leaf,
  Brain,
  Code2,
  Layers,
  BookOpen,
} from "lucide-react";
import TeamGrid from "@/components/docs/TeamGrid";
import type { TeamMember } from "@/types";

const PROBLEMS = [
  {
    Icon: Languages,
    title: "The language barrier",
    body: "World-class tech education is free online — but almost all of it is in English. Many Bangladeshi learners are more comfortable in Bangla and gravitate toward Bengali YouTube content even when they could follow English.",
  },
  {
    Icon: TrendingUp,
    title: "Outdated Bengali content",
    body: "Existing Bangla tutorials on YouTube often teach frameworks and tools that are losing relevance. Learners investing months end up job-ready for the wrong year.",
  },
  {
    Icon: AlertCircle,
    title: "The awareness gap",
    body: "Capable, motivated students at National University and across rural Bangladesh aren't connected to the right modern skills — and don't know what to learn to become competitive in today's market.",
  },
];

type MediaVideo = { type: "video"; src: string; poster?: string };
type MediaImage = { type: "image"; src: string; alt?: string; unoptimized?: boolean };

const SHOWCASE_FEATURES: Array<{
  label: string;
  title: string;
  body: string;
  media: MediaVideo | MediaImage;
  reverse: boolean;
}> = [
  {
    label: "Automation",
    title: "Drop a link. Get a course.",
    body: "Admins add a YouTube URL as a lesson in the database. A scheduled n8n workflow picks it up, transcribes it with Whisper, chunks the transcript into ~150-word topical segments, embeds them locally with Ollama, and writes to the vector store. Content creation is a one-link operation — no manual transcription.",
    media: { type: "image", src: "/features/n8n.gif", alt: "n8n automation pipeline", unoptimized: true },
    reverse: false,
  },
  {
    label: "Comprehension",
    title: "Timestamp-seek AI chat",
    body: "Ask any question in English or বাংলা. The AI finds the exact moment in the lecture where it's explained — and seeks the video there instantly. Bengali subtitle overlay keeps you anchored even through dense technical content.",
    media: { type: "video", src: "/features/chat.mp4" },
    reverse: true,
  },
  {
    label: "Mentorship",
    title: "AI Mentor with memory",
    body: "The AI Mentor tracks your progress, struggles, and milestones across sessions — building a persistent cognitive profile so every answer is personalised to where you are in your learning journey.",
    media: { type: "video", src: "/features/mentor.mp4", poster: "/features/ai_mentor_page.png" },
    reverse: false,
  },
  {
    label: "Practice",
    title: "Hands-on, in the browser",
    body: "A Pyodide-powered Python IDE and full Jupyter notebook environment — run code, write cells, see live output without leaving the platform. No local setup required.",
    media: { type: "image", src: "/features/codespace.png", alt: "Fixeth Codespace IDE" },
    reverse: true,
  },
];

const OUTCOMES = [
  {
    Icon: Briefcase,
    title: "Skills that pay",
    body: "Every track is mapped to current job market demand — scraped weekly from Bdjobs and Chakri. Learners finish with the exact skills employers are hiring for right now.",
  },
  {
    Icon: Users,
    title: "A freelancing hub",
    body: "Technical graduates take on remote global projects directly — strengthening Bangladesh as one of the world's top freelancing economies, dollar by dollar.",
  },
  {
    Icon: Leaf,
    title: "Beyond the screen",
    body: "Our mission extends to agriculture: training rural entrepreneurs who can modernize local farming, train their communities, and build livelihoods beyond the digital sector.",
  },
];

const ROADMAP_TRACKS = [
  { Icon: TrendingUp, label: "Business Analytics track" },
  { Icon: Brain, label: "Machine Learning track" },
  { Icon: Leaf, label: "Precision Agriculture track" },
  { Icon: Layers, label: "Hydroponics track" },
];

const ROADMAP_PLATFORM = [
  { Icon: Languages, label: "Automated Bengali audio dubbing" },
  { Icon: Code2, label: "More in-browser runtimes (Node.js, R)" },
];

const ROADMAP_INFRA = [
  { Icon: Building2, label: "Local training center — staffed by Fixeth graduates" },
  { Icon: Server, label: "Local AI inference (import-independent)" },
  { Icon: Cpu, label: "Infrastructure-as-a-Service & Platform-as-a-Service" },
];

export default function AboutPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((res) => {
        const members: TeamMember[] = res?.data?.members ?? [];
        setTeamMembers(members.filter((m) => !m.full_name.includes("Sadman")));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 lg:py-20">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[640px] -translate-x-1/2 rounded-full bg-[#00C896]/15 blur-3xl" />

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-14 lg:grid-cols-2 lg:gap-14 lg:pb-24 lg:pt-20">
          <div>
            <span
              style={{ animation: "fixeth-fade-up 0.5s ease both" }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00C896]/30 bg-[#00C896]/10 px-3.5 py-1.5 text-xs font-bold text-[#00A87E] dark:text-[#00C896]"
            >
              <span className="size-1.5 rounded-full bg-[#00C896]" />
              AI-native skill development for Bangladesh
            </span>

            <h1
              style={{ animation: "fixeth-fade-up 0.5s ease both 0.12s" }}
              className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
            >
              Training Bangladesh
              <br />
              <span className="bg-gradient-to-r from-[#00C896] to-[#3AA0FF] bg-clip-text text-transparent">
                for the AI era, in Bangla.
              </span>
            </h1>

            <p
              style={{ animation: "fixeth-fade-up 0.5s ease both 0.24s" }}
              className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-lg"
            >
              170 million people. Half under 30. Fixeth curates the world&apos;s best tech resources, wraps them in a Bengali-first AI layer, and turns every lecture into a personalised tutor that answers in বাংলা and seeks to the exact moment.
            </p>

            <div
              style={{ animation: "fixeth-fade-up 0.5s ease both 0.36s" }}
              className="mt-8 flex gap-8"
            >
              {[
                ["3 live tracks", "Published & enrollable"],
                ["EN · বাংলা", "Languages"],
                ["AI tutor", "On every video"],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="text-lg font-black text-neutral-900 dark:text-white">{value}</div>
                  <div className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{label}</div>
                </div>
              ))}
            </div>

            <div
              style={{ animation: "fixeth-fade-up 0.5s ease both 0.48s" }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#00C896] px-6 py-3 text-base font-extrabold text-black no-underline shadow-[0_8px_30px_rgba(0,200,150,0.35)] transition-transform hover:-translate-y-0.5"
              >
                Start learning free
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Hero mock */}
          <div
            style={{ animation: "fixeth-scale-in 0.6s ease both 0.25s" }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl dark:border-neutral-800 dark:bg-[#13131A]">
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900">
                <div
                  style={{ animation: "fixeth-pulse-play 2.4s ease-in-out infinite" }}
                  className="flex size-14 items-center justify-center rounded-full bg-[#00C896]"
                >
                  <svg className="ml-0.5 size-[22px] fill-black" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
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
              <div className="mt-4 flex flex-col gap-2.5">
                <div className="self-end rounded-2xl rounded-br-md bg-[#00C896] px-3.5 py-2 text-sm font-semibold text-black">
                  প্রম্পট কী?
                </div>
                <div
                  style={{ animation: "fixeth-fade-in-up 0.4s ease both 0.9s" }}
                  className="self-start rounded-2xl rounded-bl-md bg-neutral-100 px-3.5 py-2 text-sm leading-relaxed text-neutral-800 dark:bg-[#22222E] dark:text-neutral-200"
                >
                  প্রম্পট হলো AI-কে দেওয়া নির্দেশনা — এই লেকচারের{" "}
                  <span
                    style={{ display: "inline-flex", animation: "fixeth-pulse-small 1.6s ease-in-out infinite" }}
                    className="items-center gap-1 rounded-md border border-[#F5A623]/40 bg-[#F5A623]/15 px-1.5 py-0.5 font-mono text-xs font-black text-[#C07000] dark:text-[#F5A623]"
                  >
                    ⏱ 14:32
                  </span>{" "}
                  মিনিটে।
                </div>
                <div
                  style={{ animation: "fixeth-fade-in 0.4s ease both 1.6s" }}
                  className="self-start text-xs font-bold text-[#00A87E] dark:text-[#00C896]"
                >
                  ▶ ভিডিও চলে যাচ্ছে ১৪:৩২-এ
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Act 1: The Problem ────────────────────────────────── */}
      <section className="mt-20 border-t border-neutral-200 pt-16 dark:border-neutral-800">
        <div className="text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-neutral-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
            The Problem
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
            Why millions of Bangladeshis are still underserved
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-neutral-600 dark:text-neutral-400">
            The talent is here. The internet access is growing. But three systemic barriers keep most learners stuck.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PROBLEMS.map((p, idx) => (
            <div
              key={p.title}
              style={{ animation: `fixeth-fade-up 0.45s ease both ${idx * 0.1}s` }}
              className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#13131A]"
            >
              <div className="mb-3.5 flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400">
                <p.Icon size={20} />
              </div>
              <h3 className="text-base font-extrabold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Act 2: The Platform ───────────────────────────────── */}
      <section className="mt-24">
        <div className="text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#00C896]/30 bg-[#00C896]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#00A87E] dark:text-[#00C896]">
            The Platform
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
            Curate the world&apos;s best. Teach it in Bangla.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-neutral-600 dark:text-neutral-400">
            We don&apos;t recreate what already exists. We curate the best global resources — Digital Literacy, Git &amp; Version Control, Data Science — slot them into job-ready tracks, and wrap each lecture in a Bengali-first AI layer.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {["Digital Literacy", "Git & Version Control", "Data Science"].map((track) => (
              <span
                key={track}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#00C896]/30 bg-[#00C896]/10 px-3 py-1 text-xs font-bold text-[#00A87E] dark:text-[#00C896]"
              >
                <span className="size-1.5 rounded-full bg-[#00C896]" />
                {track}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-20">
          {SHOWCASE_FEATURES.map((feat) => (
            <div
              key={feat.title}
              className={`flex flex-col items-center gap-10 lg:flex-row${feat.reverse ? " lg:flex-row-reverse" : ""}`}
            >
              <div className="w-full lg:w-3/5">
                {feat.media.type === "video" ? (
                  <video
                    src={feat.media.src}
                    poster={feat.media.poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none"
                    className="w-full rounded-2xl border border-neutral-200 shadow-xl dark:border-neutral-800"
                  />
                ) : (
                  <Image
                    src={feat.media.src}
                    alt={feat.media.alt ?? feat.title}
                    width={900}
                    height={560}
                    unoptimized={feat.media.unoptimized ?? false}
                    className="w-full rounded-2xl border border-neutral-200 shadow-xl dark:border-neutral-800"
                  />
                )}
              </div>
              <div className="w-full lg:w-2/5">
                <div className="mb-3 text-xs font-bold uppercase tracking-widest text-[#00A87E] dark:text-[#00C896]">
                  {feat.label}
                </div>
                <h3 className="text-xl font-black tracking-tight sm:text-2xl">
                  {feat.title}
                </h3>
                <p className="mt-3 leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {feat.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Adaptive UI callout */}
        <div className="mt-14 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-[#0F0F16]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#00C896]/10 text-[#00A87E] dark:text-[#00C896]">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold">An interface that grows with the learner</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                Fixeth has three adaptive tiers: Digital Literacy learners see a simplified UI focused on video and chat; intermediate tracks unlock quizzes and concept graphs; advanced tracks expose the full IDE, notebook, and analytics dashboard. The platform meets learners where they are.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Act 3: Career & Impact ────────────────────────────── */}
      <section className="mt-24 border-t border-neutral-200 pt-16 dark:border-neutral-800">
        <div className="text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#3AA0FF]/30 bg-[#3AA0FF]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#2060CC] dark:text-[#3AA0FF]">
            Career &amp; Impact
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
            From skills to livelihood
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-neutral-600 dark:text-neutral-400">
            Fixeth isn&apos;t just a learning platform — it&apos;s a pipeline from motivation to income.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {OUTCOMES.map((o, idx) => (
            <div
              key={o.title}
              style={{ animation: `fixeth-fade-up 0.45s ease both ${idx * 0.1}s` }}
              className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#13131A]"
            >
              <div className="mb-3.5 flex size-10 items-center justify-center rounded-xl bg-[#3AA0FF]/10 text-[#2060CC] dark:text-[#3AA0FF]">
                <o.Icon size={20} />
              </div>
              <h3 className="text-base font-extrabold">{o.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {o.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Act 4: Vision / Roadmap ───────────────────────────── */}
      <section className="mt-24 overflow-hidden rounded-2xl border border-[#F5A623]/30 bg-gradient-to-br from-[#F5A623]/8 to-[#3AA0FF]/5 p-8 dark:border-[#F5A623]/25">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5A623]/40 bg-[#F5A623]/15 px-3 py-1 text-xs font-bold text-[#C07000] dark:text-[#F5A623]">
            <Rocket size={12} />
            Roadmap
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-500">
            Not yet available on the platform
          </span>
        </div>

        <h2 className="mt-4 text-xl font-black tracking-tight sm:text-2xl">
          Where Fixeth is headed
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          The features and tracks below are in build or planned. Importing AI tokens from foreign providers is unsustainable for Bangladesh at scale — our infrastructure roadmap ends with local compute we own.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              <BookOpen size={14} className="text-[#F5A623]" />
              New Tracks
            </h3>
            <div className="space-y-3">
              {ROADMAP_TRACKS.map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 text-sm text-neutral-600 dark:text-neutral-400">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#F5A623]/10 text-[#C07000] dark:text-[#F5A623]">
                    <Icon size={14} />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              <Zap size={14} className="text-[#F5A623]" />
              Platform
            </h3>
            <div className="space-y-3">
              {ROADMAP_PLATFORM.map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 text-sm text-neutral-600 dark:text-neutral-400">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#F5A623]/10 text-[#C07000] dark:text-[#F5A623]">
                    <Icon size={14} />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              <Server size={14} className="text-[#F5A623]" />
              Infrastructure
            </h3>
            <div className="space-y-3">
              {ROADMAP_INFRA.map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 text-sm text-neutral-600 dark:text-neutral-400">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#F5A623]/10 text-[#C07000] dark:text-[#F5A623]">
                    <Icon size={14} />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ──────────────────────────────────────────────── */}
      {teamMembers.length > 0 && (
        <section className="mt-20">
          <h2 className="text-center text-xl font-extrabold">The team</h2>
          <div className="mt-8">
            <TeamGrid members={teamMembers} />
          </div>
        </section>
      )}

      {/* ── NRB collaboration ─────────────────────────────────── */}
      <section className="mt-14 overflow-hidden rounded-2xl border border-[#3AA0FF]/30 bg-gradient-to-br from-[#3AA0FF]/8 to-transparent p-6 dark:border-[#3AA0FF]/25 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#3AA0FF]/15 text-[#2060CC] dark:text-[#3AA0FF]">
            <Globe2 size={26} />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3AA0FF]/30 bg-[#3AA0FF]/10 px-3 py-1 text-xs font-bold text-[#2060CC] dark:text-[#3AA0FF]">
              <GraduationCap size={13} />
              Non-Resident Bangladeshi network
            </span>
            <h2 className="mt-3 text-lg font-extrabold">NRB collaboration</h2>
            <p className="mt-1 text-sm font-bold text-neutral-800 dark:text-neutral-200">
              S M Sadman Sakib Sayor — University of Debrecen, Hungary
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Our academic advisor is a Bangladeshi-origin university lecturer based in Hungary, reviewing curriculum structure and assessment design. The NRB diaspora — 15M+ strong — is both our advisory network and a launch market: diaspora parents sponsoring tech education for family back home.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="mt-14 text-center">
        <h2 className="text-2xl font-black">Want to work with us?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
          Institutional pilots, content partnerships, or NRB mentorship — we&apos;d love to talk.
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#00C896] px-7 py-3 text-base font-extrabold text-black no-underline shadow-[0_8px_30px_rgba(0,200,150,0.35)] transition-transform hover:-translate-y-0.5"
        >
          Get started free
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
