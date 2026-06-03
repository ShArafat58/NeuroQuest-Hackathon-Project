"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Activity } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function MetabolicResponseCaseQuest() {
    const [user, setUser] = useState<any>(null);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => (res.ok ? res.json() : null))
            .then((d) => {
                if (d && d.user) setUser(d.user);
            })
            .catch(() => { });
    }, []);

    const loadCase = async () => {
        setLoading(true);
        setError("");
        setData(null);
        setAnswers({});
        setChecked(false);
        try {
            const res = await fetch(`/api/medical/case-gen?t=${Date.now()}`, { cache: "no-store" });
            if (!res.ok) throw new Error("failed");
            const d = await res.json();
            setData(d);
        } catch (e) {
            setError("Could not load a case. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCase();
    }, []);

    const score =
        data && checked
            ? data.questions.reduce(
                (acc: number, q: any, i: number) => acc + (answers[i] === q.answer ? 1 : 0),
                0
            )
            : 0;

    return (
        <div className="flex min-h-screen flex-col bg-transparent">
            <Header user={user} />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/medical" className="text-indigo-600 hover:underline font-medium text-sm">
                        ← Back to Modules
                    </Link>
                    <button onClick={loadCase} className="text-sm text-indigo-600 hover:underline">
                        New case
                    </button>
                </div>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">Clinical Case Quest</h1>
                        <p className="text-slate-500 text-sm">Chapter 1: Metabolic response to injury</p>
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
                        {/* Patient intro */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 mb-6">
                            <h2 className="font-bold text-slate-900 mb-2">{data.title}</h2>
                            <p className="text-slate-700 leading-relaxed">{data.patient}</p>
                        </div>

                        {/* Questions */}
                        <div className="space-y-4">
                            {data.questions.map((q: any, i: number) => {
                                const correct = checked && answers[i] === q.answer;
                                return (
                                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                        {q.phase && (
                                            <span className="inline-block mb-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-1 rounded">
                                                {q.phase}
                                            </span>
                                        )}
                                        {q.scenario && (
                                            <p className="text-slate-600 italic text-sm mb-3">{q.scenario}</p>
                                        )}
                                        <p className="font-medium text-slate-800 mb-3">
                                            {i + 1}. {q.question}
                                        </p>
                                        <div className="space-y-2">
                                            {(q.options || []).map((opt: string, j: number) => (
                                                <label
                                                    key={j}
                                                    className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer text-sm ${answers[i] === opt ? "border-indigo-400 bg-indigo-50" : "border-gray-100"
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
                                                {q.concept && (
                                                    <p className="text-xs text-slate-400 mt-1">Concept: {q.concept}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {!checked ? (
                            <button
                                onClick={() => setChecked(true)}
                                className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl px-6 py-3 transition"
                            >
                                Check answers
                            </button>
                        ) : (
                            <>
                                <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center">
                                    <p className="text-slate-500 text-sm">Your score</p>
                                    <p className="text-4xl font-extrabold text-indigo-600">
                                        {score} / {data.questions.length}
                                    </p>
                                </div>
                                {Array.isArray(data.key_points) && data.key_points.length > 0 && (
                                    <div className="mt-4 bg-indigo-50 rounded-2xl p-6 border border-gray-100">
                                        <h3 className="font-bold text-indigo-700 mb-2">Key points to remember</h3>
                                        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                                            {data.key_points.map((k: string, i: number) => (
                                                <li key={i}>{k}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}