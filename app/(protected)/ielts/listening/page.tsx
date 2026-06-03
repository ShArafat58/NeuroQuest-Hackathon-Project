"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Headphones, Play, RotateCcw } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const TFNG_OPTIONS = ["True", "False", "Not Given"];

export default function IeltsListeningPage() {
    const [user, setUser] = useState<any>(null);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [checked, setChecked] = useState(false);
    const [hasPlayed, setHasPlayed] = useState(false);

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => (res.ok ? res.json() : null))
            .then((d) => {
                if (d && d.user) setUser(d.user);
            })
            .catch(() => { });
    }, []);

    const stopAudio = () => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
    };

    const playAudio = () => {
        if (!data || typeof window === "undefined" || !("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(data.passage);
        utterance.lang = "en-US";
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
        setHasPlayed(true);
    };

    const loadRecording = async () => {
        stopAudio();
        setLoading(true);
        setError("");
        setData(null);
        setAnswers({});
        setChecked(false);
        setHasPlayed(false);
        try {
            const res = await fetch("/api/ielts/listening-gen");
            if (!res.ok) throw new Error("failed");
            const d = await res.json();
            setData(d);
        } catch (e) {
            setError("Could not load a recording. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecording();
        return () => stopAudio(); // stop audio when leaving the page
    }, []);

    const score =
        data && checked
            ? data.questions.reduce(
                (acc: number, q: any, i: number) => acc + (answers[i] === q.answer ? 1 : 0),
                0
            )
            : 0;

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Header user={user} />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/ielts" className="text-indigo-600 hover:underline font-medium text-sm">
                        ← Back to Modules
                    </Link>
                    <button onClick={loadRecording} className="text-sm text-indigo-600 hover:underline">
                        New recording
                    </button>
                </div>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <Headphones className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">IELTS Listening Practice</h1>
                        <p className="text-slate-500 text-sm">Play the recording, listen carefully, then answer.</p>
                    </div>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                )}

                {error && <p className="text-red-600 text-sm">{error}</p>}

                {data && !loading && (
                    <>
                        {/* Audio player */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 text-center">
                            <p className="text-slate-500 text-sm mb-3">🎧 Recording: {data.title}</p>
                            <button
                                onClick={playAudio}
                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl px-6 py-3 transition"
                            >
                                {hasPlayed ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                {hasPlayed ? "Replay" : "Play Recording"}
                            </button>
                            <p className="text-xs text-slate-400 mt-3">
                                Use headphones for best results. You can replay as needed.
                            </p>
                        </div>

                        {/* Questions */}
                        <div className="space-y-4">
                            {data.questions.map((q: any, i: number) => {
                                const opts = q.type === "tfng" ? TFNG_OPTIONS : q.options || [];
                                const correct = checked && answers[i] === q.answer;
                                return (
                                    <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                                        <p className="font-medium text-slate-800 mb-3">
                                            {i + 1}. {q.question}
                                        </p>
                                        <div className="space-y-2">
                                            {opts.map((opt: string, j: number) => (
                                                <label
                                                    key={j}
                                                    className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer text-sm ${answers[i] === opt ? "border-indigo-400 bg-indigo-50" : "border-slate-200"
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`q-${i}`}
                                                        checked={answers[i] === opt}
                                                        disabled={checked}
                                                        onChange={() => setAnswers((a) => ({ ...a, [i]: opt }))}
                                                    />
                                                    <span className="text-slate-700">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {checked && (
                                            <div className="mt-3 text-sm">
                                                <p className={correct ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                                                    {correct ? "Correct" : `Incorrect — answer: ${q.answer}`}
                                                </p>
                                                <p className="text-slate-500">{q.explanation}</p>
                                                {q.skill && <p className="text-xs text-slate-400 mt-1">Skill: {q.skill}</p>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {!checked ? (
                            <button
                                onClick={() => {
                                    stopAudio();
                                    setChecked(true);
                                }}
                                className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl px-6 py-3 transition"
                            >
                                Check answers
                            </button>
                        ) : (
                            <>
                                <div className="mt-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
                                    <p className="text-slate-500 text-sm">Your score</p>
                                    <p className="text-4xl font-extrabold text-indigo-600">
                                        {score} / {data.questions.length}
                                    </p>
                                </div>
                                {/* Reveal transcript after checking */}
                                <div className="mt-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                                    <h3 className="font-bold text-slate-900 mb-2">Transcript</h3>
                                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{data.passage}</p>
                                </div>
                            </>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}
