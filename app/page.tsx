import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Lightbulb, Brain, Trophy, ArrowRight, BookOpen, Stars } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import ParallaxBackground from "@/components/ParallaxBackground";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-transparent">
      <ParallaxBackground />
      {/* Dynamic Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-slate-900 py-24 lg:py-36">
          {/* Background image + dark overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1920"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/40" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-xs font-semibold text-indigo-200 w-fit mb-6">
                <Stars className="w-3.5 h-3.5" />
                <span>AI-Native learning in Bangla &amp; English</span>
              </div>

              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
                Learn Once. <br />
                <span className="bg-gradient-to-r from-[#A5B4FC] to-[#C4B5FD] bg-clip-text text-transparent">
                  Remember Forever.
                </span>
              </h1>
              <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-indigo-100 font-bengali leading-snug">
                একবার শিখো। চিরকাল মনে রাখো।
              </h2>

              <p className="mt-6 text-slate-200 text-base sm:text-lg leading-relaxed max-w-2xl">
                NeuroQuest &mdash; Bangladesh's first AI-native narrative learning platform for SSC, HSC, IELTS, and Medical learners. Defeat the cram-test-forget cycle through curriculum-accurate, personalized story quests (with flagship Science tracks fully active, and other tracks expanding).
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-[#6D5EF5] to-[#5B8DEF] text-white hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-200 font-bold group">
                    <span>Start Free</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white bg-transparent hover:bg-white/10 font-bold">
                    Login
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-10 pt-6 text-xs font-semibold text-slate-300 border-t border-white/10">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-indigo-300" />
                  NCTB Curriculum mapped
                </span>
                <span>SSC &bull; HSC &bull; IELTS &bull; Medical</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section className="py-24 bg-white border-y border-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
              <div className="inline-flex flex-col items-center">
                <span className="text-xs uppercase tracking-widest text-[#6D5EF5] font-bold">Scientific Methodology</span>
                <div className="w-12 h-0.5 bg-[#6D5EF5] mt-2 rounded-full" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                How <span className="bg-gradient-to-r from-[#6D5EF5] to-[#5B8DEF] bg-clip-text text-transparent">NeuroQuest Works</span>
              </h2>
              <p className="text-slate-500 text-base sm:text-lg leading-relaxed pt-1">
                We synthesize advanced brain science with interactive narrative quests to make concepts unforgettable—starting with flagship Physics and Biology courses as we expand to other tracks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center p-8 sm:p-10 bg-white rounded-3xl border border-gray-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#6D5EF5] to-[#5B8DEF] text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-purple-500/20">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">Understand Better</h3>
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                  Boring formulas turn into engaging story quests. Solve interactive narrative scenarios where Newton's laws or cell biology become core gameplay mechanics.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center p-8 sm:p-10 bg-white rounded-3xl border border-gray-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#6D5EF5] to-[#5B8DEF] text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-purple-500/20">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">Remember Longer</h3>
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                  Ebbinghaus curve is our target. We automate spaced retrieval quizzes at days 7, 21, and 45 using diverse story variations to lock concepts in long-term memory.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center p-8 sm:p-10 bg-white rounded-3xl border border-gray-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#6D5EF5] to-[#5B8DEF] text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-purple-500/20">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">Achieve Your Goals</h3>
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                  Excel in your SSC and HSC board exams. Track concept-specific masteries and prepare diagnostic analytics to focus your study time on weak links.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Corporate Footer */}
      <Footer />
    </div>
  );
}
