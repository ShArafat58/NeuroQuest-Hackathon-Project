import React from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ArrowLeft, Activity } from 'lucide-react';

export default function MedicalHub() {
    return (
        <div className="flex min-h-screen flex-col bg-transparent">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-8">
                <div className="flex items-center gap-4 mb-2">
                    <Link href="/dashboard" className="flex items-center text-primary hover:underline">
                        <ArrowLeft className="w-4 h-4" />
                        <span>← Back to Dashboard</span>
                    </Link>
                </div>

                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">Medical Modules</h1>
                    <p className="text-slate-500">Structured study modules for medical foundations.</p>
                </div>

                {/* PART 1 | Basic Principles */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">Part 1</span>
                        <span className="text-slate-300">|</span>
                        <h2 className="text-lg font-bold text-slate-800">Basic Principles</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Chapter 1 — clickable */}
                        <Link
                            href="/medical/metabolic-response"
                            className="block bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center mb-4">
                                <Activity className="w-6 h-6 text-primary mr-2" />
                                <h3 className="text-xl font-semibold text-slate-800">
                                    Chapter 1: Metabolic response
                                </h3>
                            </div>
                            <p className="text-slate-500 mb-2">
                                Work through a clinical case applying the metabolic response to injury.
                            </p>
                        </Link>

                        {/* Coming soon placeholder */}
                        <div className="relative bg-white rounded-2xl p-8 border border-dashed border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 opacity-60 flex items-center justify-center min-h-[140px]">
                            <p className="text-slate-400 text-sm text-center">More chapters coming soon</p>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-slate-400 italic">
                    More parts and chapters are being added soon. Stay tuned!
                </p>
            </main>
            <Footer />
        </div>
    );
}