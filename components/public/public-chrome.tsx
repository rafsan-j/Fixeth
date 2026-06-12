"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { usePublicPrefs } from "@/components/public/public-lang";

const NAV_COPY = {
  en: { home: "Home", about: "About", login: "Log in", signup: "Sign up" },
  bn: { home: "হোম", about: "আমাদের কথা", login: "লগ ইন", signup: "সাইন আপ" }
};

const FOOTER_COPY = {
  en: {
    tagline: "Career-track learning for Bangladesh. Learn. Prove. Build.",
    product: "Product",
    company: "Company",
  rights: "All rights reserved."
  },
  bn: {
    tagline: "বাংলাদেশের জন্য ক্যারিয়ার-ট্র্যাক শিক্ষা। শিখুন। প্রমাণ করুন। গড়ুন।",
    product: "প্রোডাক্ট",
    company: "কোম্পানি",
    rights: "সর্বস্বত্ব সংরক্ষিত।"
  }
};

export function PublicChrome({ children }: { children: React.ReactNode }) {
  const { lang, setLang, isDark, setIsDark } = usePublicPrefs();
  const pathname = usePathname();
  const nav = NAV_COPY[lang];
  const footer = FOOTER_COPY[lang];

  const links = [
    { href: "/", label: nav.home },
    { href: "/about", label: nav.about }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 dark:bg-[#0B0B0F] dark:text-neutral-100">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/85 backdrop-blur-md dark:border-neutral-800 dark:bg-[#0B0B0F]/85">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <img src="/logo.svg" alt="Fixeth" className="size-8 rounded-lg object-contain" />
            <span className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
              Fixeth
            </span>
          </Link>

          <nav className="order-3 flex w-full justify-center gap-1 sm:order-none sm:w-auto sm:flex-1 sm:gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-semibold no-underline transition-colors ${
                  pathname === link.href
                    ? "bg-[#00C896]/10 text-[#00A87E] dark:text-[#00C896]"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            {/* EN / বাংলা toggle */}
            <div className="flex overflow-hidden rounded-lg border border-neutral-200 p-0.5 dark:border-neutral-700">
              {([
                ["en", "EN"],
                ["bn", "বাংলা"]
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLang(id)}
                  className={`cursor-pointer rounded-md border-none px-2.5 py-1 text-xs font-bold ${
                    lang === id
                      ? "bg-[#00C896] text-black"
                      : "bg-transparent text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-transparent text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <Link
              href="/login"
              className="hidden px-2 py-2 text-sm font-semibold text-neutral-600 no-underline dark:text-neutral-300 sm:block"
            >
              {nav.login}
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[#00C896] px-3.5 py-2 text-sm font-extrabold text-black no-underline shadow-[0_4px_14px_rgba(0,200,150,0.25)]"
            >
              {nav.signup}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="Fixeth" className="size-7 rounded-md object-contain" />
              <span className="text-base font-black text-neutral-900 dark:text-white">Fixeth</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              {footer.tagline}
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {footer.product}
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/signup" className="text-sm text-neutral-600 no-underline dark:text-neutral-300">
                  {nav.signup}
                </Link>
                <Link href="/docs" className="text-sm text-neutral-600 no-underline dark:text-neutral-300">
                  Docs
                </Link>
              </div>
            </div>
            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {footer.company}
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/about" className="text-sm text-neutral-600 no-underline dark:text-neutral-300">
                  {nav.about}
                </Link>
                <Link href="/login" className="text-sm text-neutral-600 no-underline dark:text-neutral-300">
                  {nav.login}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-200 py-4 text-center text-xs text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
          © 2026 Fixeth. {footer.rights}
        </div>
      </footer>
    </div>
  );
}
