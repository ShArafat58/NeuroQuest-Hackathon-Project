"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function QuizPage({ params }: { params: { session_id: string } }) {
  const router = useRouter();
  const { session_id } = params;

  const [user, setUser] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  // Fetch User
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) setUser(data.user);
        else router.push("/login");
      })
      .catch(() => router.push("/login"));
  }, [router]);

  // Fetch Question
  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quiz/${session_id}/question`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Session or question not found");
          router.push("/dashboard");
          return;
        }
        throw new Error("Failed to fetch question");
      }
      const data = await res.json();
      setQuestion(data.question);
      setSessionData(data.session);
      setSelectedAnswer(null);
      setTimeLeft(60);
      setQuestionStartTime(Date.now());
    } catch (err: any) {
      toast.error(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchQuestion();
    }
  }, [user, session_id]);

  // Timer
  useEffect(() => {
    if (loading || !question) return;
    
    if (timeLeft <= 0) return; // Stop at 0

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, question]);

  const handleNext = async () => {
    if (!selectedAnswer) return;
    setSubmitting(true);
    
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    
    try {
      const res = await fetch(`/api/quiz/${session_id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: question.id,
          selected_answer: selectedAnswer,
          time_taken_seconds: timeTaken > 60 ? 60 : timeTaken
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit answer");
      }

      const data = await res.json();

      if (data.is_complete) {
        // Complete session
        const completeRes = await fetch(`/api/quiz/${session_id}/complete`, { method: "POST" });
        if (!completeRes.ok) throw new Error("Failed to complete quiz");
        
        router.push(`/quiz/${session_id}/results`);
      } else {
        await fetchQuestion();
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user || !question || !sessionData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const isBangla = user.version === "bangla";
  
  // Format numbers to Bangla
  const formatNum = (num: number) => {
    if (!isBangla) return num.toString();
    const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(d => bn[parseInt(d)] || d).join('');
  };

  const currentQNum = formatNum(question.question_index + 1);
  const totalQNum = formatNum(sessionData.total_questions);
  const conceptName = isBangla ? question.concepts?.name_bn : question.concepts?.name_en;

  const timerColor = timeLeft > 30 ? "text-green-600" : timeLeft > 10 ? "text-yellow-500" : "text-red-600";
  const timerPulse = timeLeft <= 10 && timeLeft > 0 ? "animate-pulse" : "";

  const options = [
    { id: 'a', text: question.option_a, label: isBangla ? 'ক' : 'A' },
    { id: 'b', text: question.option_b, label: isBangla ? 'খ' : 'B' },
    { id: 'c', text: question.option_c, label: isBangla ? 'গ' : 'C' },
    { id: 'd', text: question.option_d, label: isBangla ? 'ঘ' : 'D' },
  ];

  const isLastQuestion = question.question_index === sessionData.total_questions - 1;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl flex-1 flex flex-col">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-lg font-bold text-slate-700">
            {isBangla ? `প্রশ্ন ${currentQNum} / ${totalQNum}` : `Question ${currentQNum} / ${totalQNum}`}
          </div>
          
          <div className={`flex items-center gap-2 text-xl font-bold bg-white px-4 py-2 rounded-full border shadow-sm ${timerColor} ${timerPulse}`}>
            <Clock className="w-5 h-5" />
            <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
          </div>
        </div>

        {/* Main Quiz Card */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-lg flex-1 flex flex-col"
          >
            {/* Concept Badge */}
            {conceptName && (
              <div className="mb-6">
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-full">
                  {conceptName}
                </span>
              </div>
            )}

            {/* Question Text */}
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-relaxed mb-10">
              {question.question_text}
            </h2>

            {/* Options */}
            <div className="space-y-4 mb-10 flex-1">
              {options.map((opt) => {
                const isSelected = selectedAnswer === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedAnswer(opt.id)}
                    className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 group
                      ${isSelected 
                        ? 'border-primary bg-primary text-white scale-[1.02] shadow-md' 
                        : 'border-slate-200 bg-white hover:border-primary/50 hover:bg-slate-50 text-slate-700 hover:-translate-y-0.5'
                      }
                    `}
                  >
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors
                      ${isSelected ? 'bg-white text-primary' : 'bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary'}
                    `}>
                      {opt.label}
                    </div>
                    <span className="text-lg font-medium">{opt.text}</span>
                    
                    {isSelected && (
                      <CheckCircle2 className="w-6 h-6 ml-auto text-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-6 border-t border-slate-100">
              <Button
                size="lg"
                disabled={!selectedAnswer || submitting}
                onClick={handleNext}
                className={`px-8 h-14 text-lg font-bold ${
                  selectedAnswer 
                    ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25' 
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {submitting && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                {isLastQuestion ? (
                  <>
                    {isBangla ? "শেষ করুন" : "Submit"}
                    <CheckCircle2 className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    {isBangla ? "পরবর্তী" : "Next"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
