import React from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ArrowLeft, PenLine, BookOpen, Headphones, Mic } from 'lucide-react';

export default function IELTSHub() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="flex items-center text-white hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">IELTS Modules</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Writing Card */}
          <Link href="/ielts/writing" className="block bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:shadow-xl transition-all">
            <div className="flex items-center mb-4">
              <PenLine className="w-6 h-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-slate-800">Writing</h2>
            </div>
            <p className="text-slate-500 mb-2">AI band score & feedback on your essays</p>
          </Link>
          {/* Reading Card */}
          <Link href="/ielts/reading" className="block bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:shadow-xl transition-all">
            <div className="flex items-center mb-4">
              <BookOpen className="w-6 h-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-slate-800">Reading</h2>
            </div>
            <p className="text-slate-500 mb-2">Practice passages with instant scoring</p>
          </Link>
          {/* Listening Card */}
          <Link href="/ielts/listening" className="block bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:shadow-xl transition-all">
            <div className="flex items-center mb-4">
              <Headphones className="w-6 h-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-slate-800">Listening</h2>
            </div>
            <p className="text-slate-500 mb-2">Listen to AI audio and answer questions</p>
          </Link>
          {/* Speaking Card */}
          <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 opacity-60">
            <div className="flex items-center mb-4">
              <Mic className="w-6 h-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-slate-800">Speaking</h2>
            </div>
            <p className="text-slate-500 mb-2">Coming soon</p>
            <span className="absolute top-2 right-2 bg-yellow-200 text-yellow-800 text-xs font-medium px-2 py-1 rounded">Coming soon</span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}