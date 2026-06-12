"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Brain,
  GraduationCap,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  version: "bangla" | "english";
  current_class: "ssc" | "hsc_1" | "hsc_2" | "ielts" | "medical";
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingStory, setStartingStory] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
        } else {
          router.push("/login");
        }
      })
      .catch(() => {
        toast.error("Session expired. Please login again.");
        router.push("/login?reason=auth_required");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleStoryQuestClick = async () => {
    setStartingStory(true);
    try {
      const res = await fetch("/api/student/selection");
      if (!res.ok) throw new Error("Failed to fetch selection");
      const data = await res.json();

      const chapterId = data.selection?.current_chapter_id;
      if (!chapterId) {
        toast.error(
          isBangla
            ? "আগে একটি অধ্যায় নির্বাচন করুন"
            : "Please select a chapter first"
        );
        router.push("/select-subject");
        return;
      }

      // Start/Resume Story Quest
      const startRes = await fetch("/api/story/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapter_id: chapterId }),
      });

      if (!startRes.ok) {
        const err = await startRes.json();
        throw new Error(err.error || "Failed to start story quest");
      }

      const startData = await startRes.json();
      router.push(`/story/${startData.session_id}`);
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setStartingStory(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-sm font-semibold text-white">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isBangla = user.version === "bangla";
  const isIELTS = user.current_class === "ielts";
  const isMedical = user.current_class === "medical";

  const getClassName = (cls: string) => {
    switch (cls) {
      case "ssc":
        return isBangla ? "শ্রেণী ৯-১০ (এসএসসি)" : "Class 9-10 (SSC)";
      case "hsc_1":
        return isBangla ? "এইচএসসি ১ম বর্ষ" : "HSC 1st Year";
      case "hsc_2":
        return isBangla ? "এইচএসসি ২য় বর্ষ" : "HSC 2nd Year";
      case "ielts":
        return "IELTS";
      case "medical":
        return "Medical";
      default:
        return cls;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Header user={user} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#6D5EF5] to-[#5B8DEF] text-white text-xs font-bold tracking-wide shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                {isIELTS
                  ? "IELTS PREP ACTIVE"
                  : isMedical
                    ? "MEDICAL TRACK ACTIVE"
                    : isBangla
                      ? "NCTB BANGLA VERSION ACTIVE"
                      : "NCTB ENGLISH VERSION ACTIVE"}
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {isBangla
                    ? `স্বাগতম, ${user.name}!`
                    : `Welcome, ${user.name}!`}
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                  {isBangla
                    ? "আপনার পার্সোনালাইজড লার্নিং জার্নি এখানে শুরু।"
                    : "Your personalized learning journey starts here."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-transparent border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 min-w-[200px]">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {isBangla ? "নিবন্ধিত শ্রেণী" : "REGISTERED CLASS"}
                </p>
                <p className="text-lg font-bold text-slate-800">
                  {getClassName(user.current_class)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Action Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-teal-50/30 rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
            <Brain className="w-64 h-64 text-primary" />
          </div>

          <div className="relative z-10 max-w-xl">
            <p className="text-xs font-extrabold text-purple-500 uppercase tracking-wider mb-2">
              {isBangla ? "পড়াশোনা শুরু করুন" : "Start Learning"}
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3 leading-tight">
              {isIELTS
                ? "Explore IELTS Modules"
                : isMedical
                  ? "Explore Medical Modules"
                  : isBangla
                    ? "বিষয় ও অধ্যায় এক্সপ্লোর করুন"
                    : "Explore Subjects and Chapters"}
            </h2>
            <p className="text-slate-600 mb-8 text-lg">
              {isIELTS
                ? "AI-powered Writing, Reading and Listening practice"
                : isMedical
                  ? "Structured medical study modules"
                  : isBangla
                    ? "আপনার সব বিষয়ের জন্য পার্সোনালাইজড স্টোরি কোয়েস্ট"
                    : "Personalized story quests across all your SSC subjects"}
            </p>
            <Button
              size="lg"
              onClick={() =>
                router.push(
                  isMedical ? "/medical" : isIELTS ? "/ielts" : "/select-subject"
                )
              }
              className="bg-gradient-to-r from-[#6D5EF5] to-[#5B8DEF] text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 font-bold shadow-md shadow-primary/20 group text-lg px-8 h-14"
            >
              {isIELTS || isMedical
                ? "Select Module"
                : isBangla
                  ? "বিষয় নির্বাচন করুন"
                  : "Select Subject"}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            {(isIELTS || isMedical) && (
              <p className="text-sm text-slate-500 mt-2">
                {isMedical ? "Choose a Medical module" : "Choose an IELTS module"}
              </p>
            )}
          </div>
        </div>

        {/* Coming Next Section — only for science (SSC/HSC) users */}
        {!isIELTS && !isMedical && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 px-1">
              {isBangla ? "পরবর্তী ধাপসমূহ" : "Coming Next"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 opacity-70 grayscale-[30%]">
                <Brain className="w-8 h-8 text-primary mb-3" />
                <p className="font-bold text-slate-800">Diagnostic Quiz</p>
                <p className="text-sm text-slate-500 mt-1">
                  {isBangla ? "আপনার জ্ঞান মানচিত্র" : "Your knowledge map"}
                </p>
              </div>
              <div
                onClick={handleStoryQuestClick}
                className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 transition-all duration-200 cursor-pointer relative overflow-hidden group
                  ${startingStory
                    ? "opacity-80 cursor-wait"
                    : "hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5"
                  }
                `}
              >
                {startingStory && (
                  <div className="absolute inset-0 bg-transparent/50 flex items-center justify-center z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
                <Sparkles className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-slate-800">Story Quest</p>
                <p className="text-sm text-slate-500 mt-1">
                  {isBangla ? "অভিজ্ঞতার মাধ্যমে শেখা" : "Learn through experience"}
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 opacity-70 grayscale-[30%]">
                <TrendingUp className="w-8 h-8 text-primary mb-3" />
                <p className="font-bold text-slate-800">Retention Tracker</p>
                <p className="text-sm text-slate-500 mt-1">
                  {isBangla ? "ভুলে যাওয়া পরাজিত করুন" : "Defeat forgetting"}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}