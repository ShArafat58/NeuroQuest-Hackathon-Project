"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Flame,
  Trophy,
  BookOpen,
  TrendingUp,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getRank } from "@/lib/rank";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const toBnNum = (num: number) => {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((n) => bnDigits[parseInt(n)] || n)
    .join("");
};

interface ProgressData {
  stats: {
    total_xp: number;
    current_streak: number;
    longest_streak: number;
  };
  concept_breakdown: {
    strong: number;
    developing: number;
    weak: number;
  };
  quests_completed: number;
  score_trend: {
    label: string;
    score: number;
    date: string;
  }[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  version: "bangla" | "english";
}

export default function ProgressPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch user to check language preferences
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((authData) => {
        if (authData && authData.user) {
          setUser(authData.user);
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"));

    // 2. Fetch progress data
    fetch("/api/user/progress")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d) setData(d);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [router]);

  const isBangla = user ? user.version === "bangla" : true;

  // Format numbers conditionally based on language
  const formatNum = (num: number) => {
    return isBangla ? toBnNum(num) : num.toString();
  };

  const rank = data ? getRank(data.stats.total_xp) : null;

  const conceptTotal = data
    ? data.concept_breakdown.strong +
    data.concept_breakdown.developing +
    data.concept_breakdown.weak
    : 0;

  const conceptBar = (
    count: number,
    labelBn: string,
    labelEn: string,
    color: string
  ) => {
    const pct = conceptTotal > 0 ? Math.round((count / conceptTotal) * 100) : 0;
    const label = isBangla ? labelBn : labelEn;
    return (
      <div key={labelEn} className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">{label}</span>
          <span className="font-bold" style={{ color }}>
            {formatNum(count)}
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              backgroundColor: color,
              minWidth: count > 0 ? "12px" : "0px",
            }}
          />
        </div>
      </div>
    );
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen flex-col bg-transparent">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  // Format quiz labels dynamically (কুইজ ১ vs Quiz 1)
  const scoreTrendData = data?.score_trend.map((session, idx) => {
    const numStr = isBangla ? toBnNum(idx + 1) : (idx + 1).toString();
    return {
      ...session,
      label: isBangla ? `কুইজ ${numStr}` : `Quiz ${numStr}`,
    };
  }) || [];

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Header user={user} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-8">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isBangla ? "আমার উন্নতি" : "My Progress"}
            </h1>
            <p className="text-white mt-1">
              {isBangla
                ? "তোমার শেখার অগ্রগতি এক নজরে"
                : "Your learning progress at a glance"}
            </p>
          </div>
        </div>

        {/* Top Row — 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* XP Card */}
          <div className="rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200" style={{ backgroundColor: "#EEF0FF" }}>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5" style={{ color: "#6D5EF5" }} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isBangla ? "মোট XP" : "Total XP"}
              </span>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: "#3C3489" }}>
              {data ? formatNum(data.stats.total_xp) : "0"}
            </p>
          </div>

          {/* Streak Card */}
          <div className="rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200" style={{ backgroundColor: "#FFF4E5" }}>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5" style={{ color: "#F59E0B" }} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isBangla ? "স্ট্রিক" : "Streak"}
              </span>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: "#92400E" }}>
              {data
                ? isBangla
                  ? `${formatNum(data.stats.current_streak)} দিন`
                  : `${formatNum(data.stats.current_streak)} days`
                : isBangla
                  ? "০ দিন"
                  : "0 days"}
            </p>
          </div>

          {/* Rank Card */}
          <div className="rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200" style={{ backgroundColor: "#E1F5EE" }}>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5" style={{ color: "#1D9E75" }} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isBangla ? "র্যাংক" : "Rank"}
              </span>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: "#0F6E56" }}>
              {rank ? (isBangla ? rank.name : rank.nameEn) : "—"}
            </p>
          </div>

          {/* Quests Completed Card */}
          <div className="rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200" style={{ backgroundColor: "#FBEAF0" }}>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5" style={{ color: "#C9365C" }} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isBangla ? "কোয়েস্ট শেষ" : "Quests Done"}
              </span>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: "#993556" }}>
              {data ? formatNum(data.quests_completed) : "0"}
            </p>
          </div>
        </div>

        {/* Middle Row — Concept Breakdown + Score Trend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Concept Breakdown Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <h2 className="text-lg font-bold text-slate-900 mb-5 tracking-tight">
              {isBangla ? "কনসেপ্ট দক্ষতা" : "Concept Mastery"}
            </h2>
            {conceptTotal === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <TrendingUp className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-400 leading-relaxed">
                  {isBangla
                    ? "এখনো ডেটা নেই — একটা কুইজ দিয়ে শুরু করো"
                    : "No data yet — start with a quiz to begin tracker"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {conceptBar(
                  data!.concept_breakdown.strong,
                  "শক্তিশালী",
                  "Strong",
                  "#1D9E75"
                )}
                {conceptBar(
                  data!.concept_breakdown.developing,
                  "উন্নতিশীল",
                  "Developing",
                  "#EF9F27"
                )}
                {conceptBar(
                  data!.concept_breakdown.weak,
                  "দুর্বল",
                  "Weak",
                  "#E24B4A"
                )}
              </div>
            )}
          </div>

          {/* Score Trend Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <h2 className="text-lg font-bold text-slate-900 mb-5 tracking-tight">
              {isBangla ? "ডায়াগনস্টিক স্কোর ট্রেন্ড" : "Diagnostic Score Trend"}
            </h2>
            {!data || data.score_trend.length < 2 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <TrendingUp className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-400 leading-relaxed">
                  {data && data.score_trend.length === 1
                    ? isBangla
                      ? "আরো একটি কুইজ দিলে ট্রেন্ড দেখা যাবে"
                      : "Take one more quiz to see a trend"
                    : isBangla
                      ? "এখনো ডেটা নেই — একটা কুইজ দিয়ে শুরু করো"
                      : "No data yet — start with a quiz to see trend"}
                </p>
              </div>
            ) : (
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={scoreTrendData}
                    margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fill: "#9197A8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: "#9197A8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #E5E7EB",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: "13px",
                      }}
                      formatter={(value) => [
                        `${formatNum(Number(value) || 0)}%`,
                        isBangla ? "স্কোর" : "Score",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#6D5EF5"
                      strokeWidth={2.5}
                      dot={{
                        r: 5,
                        fill: "#6D5EF5",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 7,
                        fill: "#6D5EF5",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
