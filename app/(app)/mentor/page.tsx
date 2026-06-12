"use client";
import dynamic from "next/dynamic";
import { useAppTheme } from "@/components/providers/app-theme-provider";

const AIMentorScreen = dynamic(() => import("@/components/screens/AIMentor"), { ssr: false });
import { useCourse } from "@/components/providers/course-provider";

export default function MentorPage() {
  const { T, t, lang } = useAppTheme();
  const { aiMsgs, setAiMsgs } = useCourse();

  return (
    <AIMentorScreen T={T} t={t} lang={lang} aiMsgs={aiMsgs} setAiMsgs={setAiMsgs} />
  );
}
