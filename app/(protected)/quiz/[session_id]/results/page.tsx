"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Button } from "@/components/ui/button";

export default function QuizResultsPage({ params }: { params: { session_id: string } }) {
  const router = useRouter();
  const { session_id } = params;

  const [user, setUser] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startingStory, setStartingStory] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) setUser(data.user);
        else router.push("/login");
      })
      .catch(() => router.push("/login"));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    
    fetch(`/api/quiz/${session_id}/results`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load results");
        return res.json();
      })
      .then(data => {
        setResults(data);
      })
      .catch(err => {
        toast.error(err.message);
        router.push("/dashboard");
      })
      .finally(() => setLoading(false));
  }, [user, session_id, router]);

  const handleStartStoryQuest = async () => {
    if (!results?.session?.chapter_id) return;
    setStartingStory(true);
    try {
      const res = await fetch("/api/story/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapter_id: results.session.chapter_id })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to start story quest");
      }
      const data = await res.json();
      router.push(`/story/${data.session_id}`);
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setStartingStory(false);
    }
  };

  if (loading || !user || !results) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const { session, proficiencies } = results;
  const isBangla = user.version === "bangla";

  // Score Color Logic
  const getScoreColor = (score: number) => {
    if (score < 40) return "#DC2626"; // Red
    if (score < 70) return "#EAB308"; // Yellow
    return "#16A34A"; // Green
  };

  const getScoreColorClass = (score: number) => {
    if (score < 40) return "text-red-600";
    if (score < 70) return "text-yellow-500";
    return "text-green-600";
  };

  // Prepare chart data
  const chartData = proficiencies.map((p: any) => ({
    name: isBangla ? p.concepts.name_bn : p.concepts.name_en,
    score: p.proficiency_score,
    color: getScoreColor(p.proficiency_score)
  }));

  const formatNum = (num: number) => {
    if (!isBangla) return num.toString();
    const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(d => bn[parseInt(d)] || d).join('');
  };

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
            {isBangla ? "তোমার জ্ঞান-মানচিত্র" : "Your Knowledge Map"}
          </h1>
          <p className="text-slate-500 text-lg mb-8">
            {isBangla ? session.chapters.title_bn : session.chapters.title_en}
          </p>

          <div className="flex flex-col items-center justify-center py-6">
            <span className={`text-7xl md:text-8xl font-black tracking-tighter ${getScoreColorClass(session.overall_score)}`}>
              {formatNum(session.overall_score)}%
            </span>
            <span className="text-slate-400 font-bold uppercase tracking-widest mt-4">
              {isBangla ? "মোট স্কোর" : "Overall Score"}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Concept Breakdown Chart */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              {isBangla ? "ধারণা-ভিত্তিক বিশ্লেষণ" : "Concept-wise Analysis"}
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="name" width={150} tick={{ fill: '#64748B', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#F1F5F9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Right Column: Insight & Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-6"
          >
            {/* AI Insight */}
            <div className="bg-primary/5 border-l-4 border-primary rounded-r-2xl p-6 relative">
              <Sparkles className="w-6 h-6 text-primary absolute top-6 right-6 opacity-20" />
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-1" />
                <p className="text-slate-700 italic leading-relaxed text-lg font-medium">
                  "{session.ai_insight}"
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex-1 flex flex-col justify-end gap-4 mt-8">
              <Button 
                onClick={handleStartStoryQuest} 
                disabled={startingStory}
                className="w-full h-14 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white text-lg font-bold shadow-lg shadow-primary/30"
              >
                {startingStory ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  isBangla ? "✨ স্টোরি কোয়েস্ট শুরু করো" : "✨ Start Your Story Quest"
                )}
                {!startingStory && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => router.push("/dashboard")}
                className="w-full h-12 text-slate-500 hover:text-slate-700 font-semibold"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {isBangla ? "ড্যাশবোর্ডে ফিরে যাও" : "Back to Dashboard"}
              </Button>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
