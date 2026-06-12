import type { Metadata } from "next"
import { DM_Mono, DM_Sans, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
})

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"]
})

export const metadata: Metadata = {
  title: "Fixeth - Career-Track Learning for Bangladesh",
  description: "Adaptive LMS with AI-powered video intelligence",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-dm-sans), 'DM Sans', 'Segoe UI', system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  )
}

