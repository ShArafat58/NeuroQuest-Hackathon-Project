import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Lightbulb, Brain, Trophy, ArrowRight, BookOpen, Stars } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Dynamic Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-br from-indigo-50 via-white to-teal-50/50">
          {/* Subtle decorative background circles */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              {/* Left Side: Headline & CTAs (with subtle glassmorphic card wrapper) */}
              <div className="flex flex-col space-y-6 max-w-xl bg-white/40 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-sm">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary w-fit animate-pulse">
                  <Stars className="w-3.5 h-3.5" />
                  <span>AI-Native learning in Bangla &amp; English</span>
                </div>
                
                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    Learn Once. <br />
                    <span className="text-primary bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                      Remember Forever.
                    </span>
                  </h1>
                  <h2 className="text-2xl sm:text-3xl font-bold text-secondary-600 font-bengali leading-snug">
                    একবার শিখো। চিরকাল মনে রাখো।
                  </h2>
                </div>

                <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                  NeuroQuest &mdash; Bangladesh's first AI-native narrative learning platform for science students. Defeat the cram-test-forget cycle through curriculum-accurate, personalized story quests that fight the Ebbinghaus forgetting curve.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white font-bold shadow-md shadow-primary/20 group">
                      <span>Start Free</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-100 font-bold">
                      Login
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-6 pt-4 text-xs font-semibold text-slate-500 border-t border-slate-200/50">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4 text-primary" />
                    NCTB Curriculum mapped
                  </span>
                  <span>SSC &bull; HSC Science</span>
                </div>
              </div>

              {/* Right Side: cover-image.png (displays without cropping) */}
              <div className="flex justify-center items-center w-full">
                <div className="relative w-full max-w-[600px] h-[350px] sm:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden bg-slate-100/50 border border-slate-200/80 p-2 shadow-xl shadow-slate-200/50">
                  <div className="relative w-full h-full rounded-xl overflow-hidden bg-white">
                    <Image
                      src="/cover-image.png"
                      alt="Student transformation: Before & After learning with NeuroQuest story-quests"
                      fill
                      priority
                      className="object-contain p-4"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section className="py-20 bg-white border-y border-slate-100">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h3 className="text-xs uppercase tracking-widest text-primary font-bold">Scientific Methodology</h3>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">How NeuroQuest Works</h2>
              <p className="text-slate-500 text-base">
                We synthesize advanced brain science with interactive narrative quests to make complex Physics and Biology concepts unforgettable.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-primary mb-6">
                  <Lightbulb className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Understand Better</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Boring formulas turn into engaging story quests. Solve interactive narrative scenarios where Newton's laws or cell biology become core gameplay mechanics.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-primary mb-6">
                  <Brain className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Remember Longer</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Ebbinghaus curve is our target. We automate spaced retrieval quizzes at days 7, 21, and 45 using diverse story variations to lock concepts in long-term memory.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-primary mb-6">
                  <Trophy className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Achieve Your Goals</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
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
