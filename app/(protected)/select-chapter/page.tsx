"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

function ChapterSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectCode = searchParams.get("subject");

  const [user, setUser] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
          if (subjectCode) {
            fetchChapters(subjectCode);
          } else {
            router.push("/select-subject");
          }
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"));
  }, [router, subjectCode]);

  const fetchChapters = async (code: string) => {
    try {
      const res = await fetch(`/api/curriculum/chapters?subject_code=${code}`);
      if (res.ok) {
        const data = await res.json();
        setSubject(data.subject);
        setChapters(data.chapters || []);
      } else {
        toast.error("Failed to load chapters");
        router.push("/select-subject");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChapter = async (chapterId: string) => {
    setSelectingId(chapterId);
    try {
      // Create student selection record
      const selectRes = await fetch("/api/student/selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_id: subject.id,
          chapter_id: chapterId
        })
      });

      if (!selectRes.ok) {
        const err = await selectRes.json();
        throw new Error(err.error || "Failed to save selection");
      }

      // Start the journey (Diagnostic Agent)
      const journeyRes = await fetch(`/api/chapters/${chapterId}/start-journey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!journeyRes.ok) {
        const err = await journeyRes.json();
        throw new Error(err.error || "Failed to start diagnostic quiz");
      }

      const { session_id } = await journeyRes.json();
      router.push(`/quiz/${session_id}`);

    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setSelectingId(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const isBangla = user.version === "bangla";
  const subjectName = isBangla ? subject?.name_bn : subject?.name_en;

  const getClassName = (cls: string) => {
    switch (cls) {
      case "ssc": return isBangla ? "শ্রেণী ৯-১০" : "Class 9-10";
      case "hsc_1": return isBangla ? "এইচএসসি ১ম" : "HSC 1st";
      case "hsc_2": return isBangla ? "এইচএসসি ২য়" : "HSC 2nd";
      default: return cls;
    }
  };

  const convertToBanglaNumber = (num: number) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(digit => banglaDigits[parseInt(digit)] || digit).join('');
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Header user={user} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center text-sm font-medium text-white/70">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            {getClassName(user.current_class)}
          </Link>
          <span className="mx-2">/</span>
          <Link href="/select-subject" className="text-white font-semibold hover:underline">
            {subjectName}
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
            {isBangla ? "অধ্যায় নির্বাচন করুন" : "Select Chapter"}
          </h1>
        </div>

        {/* Chapter List */}
        <div className="space-y-6">
          {chapters.map((chapter) => {
            const chapNum = isBangla ? convertToBanglaNumber(chapter.chapter_number) : chapter.chapter_number;
            const conceptsCount = isBangla ? convertToBanglaNumber(chapter.concept_count) : chapter.concept_count;
            const pageStart = isBangla ? convertToBanglaNumber(chapter.page_start) : chapter.page_start;
            const pageEnd = isBangla ? convertToBanglaNumber(chapter.page_end) : chapter.page_end;

            return (
              <div key={chapter.id} className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-16 h-16 shrink-0 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl font-black">
                  {chapNum}
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {isBangla ? chapter.title_bn : chapter.title_en}
                  </h2>
                  <p className="text-slate-600 mb-4 line-clamp-2">
                    {isBangla ? chapter.summary_bn : chapter.summary_en}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                      {isBangla ? `${conceptsCount}টি ধারণা` : `${conceptsCount} concepts`}
                    </span>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                      {isBangla ? `পৃষ্ঠা ${pageStart}-${pageEnd}` : `Pages ${pageStart}-${pageEnd}`}
                    </span>
                  </div>
                </div>

                <div className="w-full md:w-auto shrink-0 mt-4 md:mt-0">
                  <Button
                    size="lg"
                    className="w-full md:w-auto bg-gradient-to-r from-[#6D5EF5] to-[#5B8DEF] text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 shadow-md font-bold px-8"
                    onClick={() => handleSelectChapter(chapter.id)}
                    disabled={selectingId === chapter.id}
                  >
                    {selectingId === chapter.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {isBangla ? "শুরু করুন" : "Start"}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Coming Soon Muted Card */}
          <div className="bg-transparent rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col md:flex-row gap-6 items-center text-center md:text-left opacity-70">
            <div className="w-16 h-16 shrink-0 bg-slate-200 text-slate-500 rounded-2xl flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-1000 mb-2">
                {isBangla ? "আরও অধ্যায় শীঘ্রই আসছে" : "More chapters coming soon"}
              </h2>
              <p className="text-slate-1000">
                {isBangla
                  ? "আমরা আরো অধ্যায় নিয়ে কাজ করছি।"
                  : "We're working on more chapters. Stay tuned!"}
              </p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function SelectChapterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <ChapterSelectionContent />
    </Suspense>
  );
}
