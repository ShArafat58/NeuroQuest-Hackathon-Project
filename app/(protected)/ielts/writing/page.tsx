"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowLeft } from "lucide-react";

const prompts = [
  "Some people believe students should study science subjects until they leave school, while others think they should focus only on subjects they are best at. Discuss both views and give your own opinion.",
  "In many countries the use of mobile phones in public places such as restaurants and public transport has become a problem. What are the causes, and what measures can address it?",
  "Some people think governments should spend money on public services rather than on arts such as music and painting. To what extent do you agree or disagree?",
  "Many young people move to cities for work, leaving rural areas with ageing populations. What problems does this cause, and how can they be solved?",
  "Some believe technology has made people less social, while others argue it has helped people connect. Discuss both views and give your own opinion.",
];

export default function WritingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [essay, setEssay] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const currentPrompt = prompts[currentIdx];

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) setUser(data.user);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const count = essay.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(count);
  }, [essay]);

  const handleNewQuestion = () => {
    setCurrentIdx((i) => (i + 1) % prompts.length);
    setEssay("");
    setResult(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ielts/writing-eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentPrompt, essay }),
      });
      const text = await res.text();
      const cleaned = text.replace(/```json\s*/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(cleaned);
      setResult(data);
    } catch (e) {
      console.error(e);
      alert("Error evaluating essay. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Header user={user} />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <button
          onClick={() => router.push("/ielts")}
          className="inline-flex items-center gap-1 text-indigo-600 hover:underline text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Modules
        </button>

        <h1 className="text-2xl font-extrabold text-slate-900">IELTS Writing — Task 2</h1>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <p className="font-semibold mb-2">Prompt:</p>
          <p className="italic text-slate-700 mb-4">{currentPrompt}</p>
          <button
            onClick={handleNewQuestion}
            className="mb-4 border border-slate-300 hover:bg-transparent text-slate-700 font-medium rounded-xl px-4 py-2 text-sm transition"
          >
            New Question
          </button>
          <textarea
            className="w-full h-48 p-3 border border-gray-100 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Write your essay here (at least 150 words)..."
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
          />
          <div className={`text-sm mt-1 ${wordCount >= 150 ? "text-green-600" : "text-slate-500"}`}>
            Word count: {wordCount} {wordCount < 150 ? "(min 150)" : ""}
          </div>
          <button
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl px-6 py-3 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={wordCount < 150 || loading}
            onClick={handleSubmit}
          >
            {loading ? "Evaluating..." : "Submit Essay"}
          </button>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <h2 className="text-xl font-bold mb-4">Result</h2>
            <p className="text-3xl font-extrabold text-indigo-600 mb-4">
              Overall Band: {result.overall_band}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {Array.isArray(result.criteria) &&
                result.criteria.map((c: any, i: number) => (
                  <div key={i} className="p-3 border border-gray-100 rounded-xl bg-transparent">
                    <p className="font-semibold text-slate-800">{c.name}</p>
                    <p className="text-indigo-600 font-bold">Band: {c.band}</p>
                    <p className="text-sm text-slate-600">{c.comment}</p>
                  </div>
                ))}
            </div>
            {Array.isArray(result.strengths) && (
              <div className="mb-3">
                <p className="font-semibold text-green-700">Strengths:</p>
                <ul className="list-disc list-inside text-sm text-slate-700">
                  {result.strengths.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(result.improvements) && (
              <div className="mb-3">
                <p className="font-semibold text-amber-700">Improvements:</p>
                <ul className="list-disc list-inside text-sm text-slate-700">
                  {result.improvements.map((imp: string, i: number) => (
                    <li key={i}>{imp}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(result.corrections) && (
              <div className="mb-3">
                <p className="font-semibold text-slate-800">Corrections:</p>
                <ul className="list-disc list-inside text-sm text-slate-700">
                  {result.corrections.map((cor: any, i: number) => (
                    <li key={i}>
                      &quot;{cor.original}&quot; → &quot;{cor.suggestion}&quot; ({cor.reason})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.model_paragraph && (
              <div className="mb-2">
                <p className="font-semibold text-indigo-700">Model Paragraph:</p>
                <p className="italic text-sm text-slate-700">{result.model_paragraph}</p>
              </div>
            )}
            <p className="text-sm text-slate-400 mt-4">
              This is an AI practice estimate aligned to IELTS criteria — not an official IELTS score.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}