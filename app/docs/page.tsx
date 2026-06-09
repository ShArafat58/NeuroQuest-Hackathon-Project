"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Sparkles,
  ShieldAlert,
  Lightbulb,
  Activity,
  Eye,
  BookOpen,
  Table,
  Code2,
  Compass,
  Layers,
  Database,
  Cpu,
  ShieldCheck,
  Milestone,
  Users,
  History,
  Brain,
  Mail,
  ArrowRight
} from "lucide-react";

// ==========================================
// B. VISIBILITY CONTROL
// ==========================================
const DOCS_ENABLED = true;
const START_DATE = "2026-06-09T00:00:00+06:00";
const END_DATE = "2026-06-14T23:59:59+06:00";

const sections = [
  { id: "hero", label: "Introduction", icon: Sparkles },
  { id: "problem", label: "The Problem", icon: ShieldAlert },
  { id: "solution", label: "The Solution", icon: Lightbulb },
  { id: "why-now", label: "Why Now", icon: Activity },
  { id: "overview", label: "Product Overview", icon: Eye },
  { id: "coverage", label: "Curriculum Coverage", icon: BookOpen },
  { id: "matrix", label: "Feature Matrix", icon: Table },
  { id: "tech-stack", label: "Technology Stack", icon: Code2 },
  { id: "architecture", label: "System Architecture", icon: Compass },
  { id: "data-flow", label: "Data Flow", icon: Layers },

  { id: "ai-layer", label: "AI Layer", icon: Cpu },
  { id: "security", label: "Security & Auth", icon: ShieldCheck },
  { id: "roadmap", label: "Roadmap", icon: Milestone },
  { id: "team", label: "Team Buddhi.exe", icon: Users },

  { id: "vision", label: "Our Vision", icon: Brain },
];

export default function DocsPage() {
  const [mounted, setMounted] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const start = new Date(START_DATE);
    const end = new Date(END_DATE);
    const inWindow = now >= start && now <= end;
    setIsAvailable(DOCS_ENABLED && inWindow);
  }, []);

  // Track active section on scroll
  useEffect(() => {
    if (!isAvailable) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120; // Offset for header

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAvailable]);

  // Smooth scroll handler
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offset = 90; // Offset for the fixed header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSection(id);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex space-x-2 justify-center items-center">
            <div className="h-3.5 w-3.5 bg-[#6D5EF5] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-3.5 w-3.5 bg-[#6D5EF5] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-3.5 w-3.5 bg-[#6D5EF5] rounded-full animate-bounce"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-5 bg-white p-8 rounded-3xl shadow-xl border border-slate-100/80">
            <div className="w-16 h-16 bg-[#6D5EF5]/10 rounded-2xl flex items-center justify-center mx-auto text-[#6D5EF5]">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Access Restricted</h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                This page is not available right now.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Header />

      <div className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 relative">

          {/* STICKY SIDEBAR NAVIGATION */}
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold px-3 mb-4">Documentation</h2>
            <nav className="space-y-1">
              {sections.map((sec) => {
                const IconComponent = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={(e) => scrollToSection(e, sec.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                      ? "bg-[#6D5EF5]/10 text-[#6D5EF5] border-l-4 border-[#6D5EF5]"
                      : "text-slate-600 hover:text-[#6D5EF5] hover:bg-slate-50"
                      }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="truncate">{sec.label}</span>
                  </a>
                );
              })}
            </nav>
          </aside>

          {/* MAIN DOCUMENTATION CONTENT */}
          <main className="flex-1 min-w-0 bg-white border border-slate-100 rounded-3xl p-6 md:p-10 shadow-sm space-y-16">

            {/* 1. HERO SECTION */}
            <section id="hero" className="scroll-mt-24 space-y-6 pb-8 border-b border-slate-100">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6D5EF5]/10 border border-[#6D5EF5]/20 text-xs font-bold text-[#6D5EF5]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Technical Specifications & Pitch Deck</span>
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  NeuroQuest <span className="text-[#6D5EF5] font-bengali font-bold">(স্মৃতিযোদ্ধা)</span>
                </h1>
                <p className="text-xl md:text-2xl font-bold text-slate-700 font-bengali">
                  Learn Once. Remember Forever.
                </p>
              </div>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-3xl">
                NeuroQuest is Bangladeshi AI-native narrative learning platform built specifically to align with the national NCTB secondary and higher secondary science curricula. It uses immersive storyline quests, adaptive diagnostic profiling, and brain-science methodologies to counter academic performance drop-offs.
              </p>
            </section>

            {/* 2. THE PROBLEM */}
            <section id="problem" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">The Problem</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-2">
                  <h3 className="font-bold text-slate-800">The Cram-Test-Forget Cycle</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Students are trapped in an educational loop where information is memorized purely for exams and forgotten immediately after, leading to poor conceptual retention.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-2">
                  <h3 className="font-bold text-slate-800">Lack of Personalization</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    One-size-fits-all classrooms fail to detect specific conceptual weaknesses, resulting in students accumulating unrecognized knowledge gaps.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-2">
                  <h3 className="font-bold text-slate-800">Passive Engagement</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Dry textbook prose struggles to compete with active digital distractions, rendering traditional reading and rote-learning methods highly ineffective.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-2">
                  <h3 className="font-bold text-slate-800">Cultural Disconnect</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Imported learning platforms lack contextual relevance. Abstract science theories are rarely mapped onto the daily lives and environments of Bangladeshi pupils.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. THE SOLUTION */}
            <section id="solution" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#6D5EF5]/10 text-[#6D5EF5] rounded-lg">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">The Solution</h2>
              </div>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                NeuroQuest targets these learning challenges directly with an integrated, multi-layer system mapping NCTB targets:
              </p>
              <div className="space-y-4">
                <div className="border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row gap-4 hover:border-slate-200 transition-colors">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-violet-50 text-[#6D5EF5] flex items-center justify-center font-bold">1</div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800">AI Diagnostic Assessments</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Rather than static testing, students undergo Gemini-powered, concept-aligned diagnostic evaluations. This dynamically pinpoints exact weaknesses across granular syllabus concepts.
                    </p>
                  </div>
                </div>
                <div className="border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row gap-4 hover:border-slate-200 transition-colors">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-violet-50 text-[#6D5EF5] flex items-center justify-center font-bold">2</div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800">Story-Quest Gameplay</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Abstract physics formulas and biological processes are translated into immersive, local story adventures. For example, learning force, work, and power by saving a village from monsoon storms in Sirajganj, or bioenergetics to revive a failing mango orchard in Rajshahi.
                    </p>
                  </div>
                </div>
                <div className="border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row gap-4 hover:border-slate-200 transition-colors">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-violet-50 text-[#6D5EF5] flex items-center justify-center font-bold">3</div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800">AI Study Assistant</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      A context-aware AI study assistant is available on every page. It reads the weak concepts of each student and gives personalized, bilingual guidance and crucially, it never reveals direct answers to quizzes or story choices. Instead it explains the underlying concept and guides students to reason it out, teaching genuine understanding rather than shortcuts.
                    </p>
                  </div>
                </div>
                <div className="border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row gap-4 hover:border-slate-200 transition-colors">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-violet-50 text-[#6D5EF5] flex items-center justify-center font-bold">4</div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800">Motivation &amp; Progress Tracking</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      To keep learners engaged, NeuroQuest turns real study activity into XP, daily streaks, and rank tiers (নবীন → যোদ্ধা → বীর → মহাবীর). A personal My Progress dashboard then visualizes growth ,a concept-mastery breakdown (strong / developing / weak) and a diagnostic score-trend graph over time so students can see their improvement and stay motivated.
                    </p>
                  </div>
                </div>
                <div className="border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row gap-4 hover:border-slate-200 transition-colors relative overflow-hidden">
                  <div className="absolute right-3 top-3 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-purple-100 text-purple-800 rounded">
                    Roadmap
                  </div>
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">5</div>
                  <div className="space-y-1 pr-12">
                    <h3 className="font-bold text-slate-800">Automated Spaced Retrieval</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      To permanently counter the forgetting curve, the platform schedules periodic retrieval quizzes at intervals (7, 21, and 45 days), dynamically tracking proficiency decay.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. WHY NOW */}
            <section id="why-now" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Why Now</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-2">
                  <div className="font-bold text-slate-800">Next-Gen AI Capabilities</div>
                  <p className="text-slate-600 leading-relaxed">
                    Google Gemini multi-model chains allow the generation of customized, contextually correct academic questions and student chatbot interactions at near-zero latency.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-2">
                  <div className="font-bold text-slate-800">Bangla Localization Need</div>
                  <p className="text-slate-600 leading-relaxed">
                    There is a critical shortage of high-quality, interactive, bilingual (English & Bangla) learning materials aligned specifically to NCTB guidelines.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-2">
                  <div className="font-bold text-slate-800">Low-Bandwidth Optimized</div>
                  <p className="text-slate-600 leading-relaxed">
                    By relying on Tailwind, lightweight SVG graphics, and static edge-rendering without heavy 3D game engines, NeuroQuest is fully accessible on low-end smartphones.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. PRODUCT OVERVIEW */}
            <section id="overview" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#6D5EF5]/10 text-[#6D5EF5] rounded-lg">
                  <Eye className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Product Overview</h2>
              </div>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                NeuroQuest bridges textbook reading and active retention. Once a student selects their target chapter, they take an AI-driven Diagnostic Assessment. Based on their performance, they enter a Narrative Story Quest designed to apply those concepts practically, reinforced by real-time progression statistics (XP, streak, rank) and a personalized AI study companion.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="border border-slate-100 rounded-2xl p-6 space-y-3">
                  <h3 className="font-bold text-slate-800">Target User Cohorts</h3>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6D5EF5]"></span>
                      <span>SSC & HSC Science Students (旗舰 Flagship)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6D5EF5]"></span>
                      <span>IELTS candidates (Academic/General tracks)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6D5EF5]"></span>
                      <span>Medical Admission aspirants</span>
                    </li>
                  </ul>
                </div>
                <div className="border border-slate-100 rounded-2xl p-6 space-y-3">
                  <h3 className="font-bold text-slate-800">Core Use Cases</h3>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6D5EF5]"></span>
                      <span>Personalized concept mastery tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6D5EF5]"></span>
                      <span>Bilingual narrative chapter reinforcement</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6D5EF5]"></span>
                      <span>Frictionless diagnostic mock examinations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 6. CURRICULUM COVERAGE */}
            <section id="coverage" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#6D5EF5]/10 text-[#6D5EF5] rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Curriculum Coverage</h2>
              </div>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                The platform includes structured syllabus mapping database schemas seeded with syllabus nodes.
              </p>

              <div className="space-y-4">


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="border border-slate-100 p-5 rounded-2xl space-y-3">
                    <h3 className="font-bold text-slate-800">SSC Science (6 Subjects)</h3>
                    <p className="text-slate-500 text-xs">Physics, Biology, ICT, Chemistry, History, Geography. (2 chapters each seeded).</p>
                    <div className="text-[#6D5EF5] font-semibold text-xs">Six subjects (two chapters each) are Live</div>
                  </div>
                  <div className="border border-slate-100 p-5 rounded-2xl space-y-3">
                    <h3 className="font-bold text-slate-800">IELTS Practice Track</h3>
                    <p className="text-slate-500 text-xs">Writing, Reading, and Listening modules are live; Speaking evaluation is planned.</p>
                    <div className="text-purple-600 font-semibold text-xs">Speaking (Roadmap)</div>
                  </div>
                  <div className="border border-slate-100 p-5 rounded-2xl space-y-3">
                    <h3 className="font-bold text-slate-800">Medical Track</h3>
                    <p className="text-slate-500 text-xs">Advanced clinical scenario case-studies matching textbook topics.</p>
                    <div className="text-amber-600 font-semibold text-xs">Early Beta (1 chapter)</div>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. FEATURE MATRIX */}
            <section id="matrix" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#6D5EF5]/10 text-[#6D5EF5] rounded-lg">
                  <Table className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Feature Matrix</h2>
              </div>
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold">
                      <th className="p-4">Feature Module</th>
                      <th className="p-4">Functional Description</th>
                      <th className="p-4">Development Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="p-4 font-bold text-slate-800">Diagnostic Quiz</td>
                      <td className="p-4 text-xs">6 dynamic, concept-aligned multiple-choice questions matching difficulty curves.</td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">Live</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-slate-800">Story Quest Play</td>
                      <td className="p-4 text-xs">Immersive 5-scene gameplay storylines for Physics and Biology.</td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">Live</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-slate-800">Knowledge Map &amp; Proficiency</td>
                      <td className="p-4 text-xs">Calculates student proficiency tiers per concept and shows them.</td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">Live</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-slate-800">XP / Streak / Rank</td>
                      <td className="p-4 text-xs">Streak tracking, daily check-in rewards, and XP updates.</td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">Live</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-slate-800">AI Study Chatbot</td>
                      <td className="p-4 text-xs">Context-aware assistant guiding weak concepts with safety boundaries.</td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">Live</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-slate-800">IELTS Tracks</td>
                      <td className="p-4 text-xs">Writing, Reading, and Listening module assessments.</td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">Live</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-slate-800">IELTS Speaking</td>
                      <td className="p-4 text-xs">Adaptive verbal mock simulations and scoring patterns.</td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-full">Roadmap</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-slate-800">Medical Track</td>
                      <td className="p-4 text-xs">Clinical scenarios case generation and review pages.</td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">Early (1 chapter)</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-slate-800">Curriculum MCP Server</td>
                      <td className="p-4 text-xs">Bridges NCTB curriculum seeds to external AI editors via stdio.</td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">Live</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-slate-800">Spaced Retrieval Loop</td>
                      <td className="p-4 text-xs">Automated reminders at days 7, 21, and 45 based on forgetting rates.</td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-full">Roadmap</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-slate-800">Vector Search / RAG</td>
                      <td className="p-4 text-xs">pgvector database embeddings mapping exact textbook paragraphs.</td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-full">Roadmap</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 8. TECHNOLOGY STACK */}
            <section id="tech-stack" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#6D5EF5]/10 text-[#6D5EF5] rounded-lg">
                  <Code2 className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Technology Stack</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="border border-slate-100 p-4 rounded-xl">
                  <div className="font-bold text-slate-800 mb-1">Frontend</div>
                  <div className="text-xs text-slate-500">Next.js 14 (App Router), TypeScript, TailwindCSS, Framer Motion</div>
                </div>
                <div className="border border-slate-100 p-4 rounded-xl">
                  <div className="font-bold text-slate-800 mb-1">Backend Runtime</div>
                  <div className="text-xs text-slate-500">Node.js, Vercel Edge compatible serverless functions</div>
                </div>
                <div className="border border-slate-100 p-4 rounded-xl">
                  <div className="font-bold text-slate-800 mb-1">Database &amp; Storage</div>
                  <div className="text-xs text-slate-500">Supabase, PostgreSQL, local session JWTs</div>
                </div>
                <div className="border border-slate-100 p-4 rounded-xl">
                  <div className="font-bold text-slate-800 mb-1">AI Services</div>
                  <div className="text-xs text-slate-500">Google Gemini API SDK (multi-model fallbacks)</div>
                </div>
                <div className="border border-slate-100 p-4 rounded-xl">
                  <div className="font-bold text-slate-800 mb-1">Validation</div>
                  <div className="text-xs text-slate-500">Zod structure enforcement, React Hook Form</div>
                </div>
                <div className="border border-slate-100 p-4 rounded-xl">
                  <div className="font-bold text-slate-800 mb-1">Security / Crytpo</div>
                  <div className="text-xs text-slate-500">bcryptjs, jose (lightweight JWTs)</div>
                </div>
                <div className="border border-slate-100 p-4 rounded-xl">
                  <div className="font-bold text-slate-800 mb-1">MCP Integration</div>
                  <div className="text-xs text-slate-500">Stdio transport, custom TS server, Schema Inspector</div>
                </div>
                <div className="border border-slate-100 p-4 rounded-xl">
                  <div className="font-bold text-slate-800 mb-1">Hosting</div>
                  <div className="text-xs text-slate-500">Netlify hosting pipeline</div>
                </div>
              </div>
            </section>

            {/* 9. SYSTEM ARCHITECTURE */}
            <section id="architecture" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#6D5EF5]/10 text-[#6D5EF5] rounded-lg">
                  <Compass className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Architecture</h2>
              </div>
              <p className="text-slate-600 text-sm">
                A layered view of NeuroQuest: the Next.js client passes through edge middleware and API route handlers into the core service layer, which talks to Google Gemini and the Supabase database. A standalone MCP server reads curriculum data separately.
              </p>

              <div className="w-full">
                <svg viewBox="0 0 860 570" fill="none" className="w-full h-auto border border-slate-100 rounded-2xl bg-slate-50/50 p-4">
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#6D5EF5" />
                    </marker>
                    <marker id="arrowGray" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748B" />
                    </marker>
                    <linearGradient id="gUI" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6D5EF5" /><stop offset="100%" stopColor="#5B8DEF" />
                    </linearGradient>
                    <linearGradient id="gMid" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                    <linearGradient id="gApi" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#2563EB" />
                    </linearGradient>
                    <linearGradient id="gSvc" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                    <linearGradient id="gGem" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="gDb" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366F1" /><stop offset="100%" stopColor="#4F46E5" />
                    </linearGradient>
                    <linearGradient id="gMcp" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#64748B" /><stop offset="100%" stopColor="#475569" />
                    </linearGradient>
                  </defs>

                  {/* Client */}
                  <rect x="150" y="24" width="560" height="66" rx="12" fill="url(#gUI)" />
                  <text x="430" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="sans-serif">Client — Next.js 14 (App Router)</text>
                  <text x="430" y="71" textAnchor="middle" fill="#E0E7FF" fontSize="10" fontFamily="sans-serif">Landing · Auth · Dashboard · Quiz · Story · Progress · Chatbot</text>

                  {/* Middleware */}
                  <rect x="250" y="128" width="360" height="58" rx="12" fill="url(#gMid)" />
                  <text x="430" y="153" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Edge Middleware — JWT (jose)</text>
                  <text x="430" y="170" textAnchor="middle" fill="#FEF3C7" fontSize="10" fontFamily="sans-serif">Protects all (protected) routes</text>

                  {/* API */}
                  <rect x="150" y="224" width="560" height="66" rx="12" fill="url(#gApi)" />
                  <text x="430" y="252" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="sans-serif">API Route Handlers (Edge / Node)</text>
                  <text x="430" y="271" textAnchor="middle" fill="#DBEAFE" fontSize="10" fontFamily="sans-serif">auth · curriculum · diagnostic · story · chat · user · student · admin</text>

                  {/* Services */}
                  <rect x="150" y="328" width="560" height="66" rx="12" fill="url(#gSvc)" />
                  <text x="430" y="356" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="sans-serif">Core Services &amp; Logic</text>
                  <text x="430" y="375" textAnchor="middle" fill="#EDE9FE" fontSize="10" fontFamily="sans-serif">Diagnostic Agent · computeProficiency() · XP &amp; Rank · PDF chunking</text>

                  {/* Gemini */}
                  <rect x="150" y="440" width="250" height="74" rx="12" fill="url(#gGem)" />
                  <text x="275" y="472" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Google Gemini API</text>
                  <text x="275" y="490" textAnchor="middle" fill="#D1FAE5" fontSize="9.5" fontFamily="sans-serif">Multi-model fallback · Diagnostic + Chatbot</text>

                  {/* Supabase */}
                  <rect x="430" y="440" width="250" height="74" rx="12" fill="url(#gDb)" />
                  <text x="555" y="472" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Supabase (PostgreSQL)</text>
                  <text x="555" y="490" textAnchor="middle" fill="#E0E7FF" fontSize="9.5" fontFamily="sans-serif">15 tables</text>

                  {/* MCP */}
                  <rect x="705" y="440" width="125" height="74" rx="12" fill="url(#gMcp)" />
                  <text x="767" y="472" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold" fontFamily="sans-serif">MCP Server</text>
                  <text x="767" y="490" textAnchor="middle" fill="#E2E8F0" fontSize="9.5" fontFamily="sans-serif">read-only (ANON)</text>

                  {/* Arrows */}
                  <path d="M 430 90 L 430 125" stroke="#6D5EF5" strokeWidth="2" markerEnd="url(#arrow)" />
                  <path d="M 430 186 L 430 221" stroke="#6D5EF5" strokeWidth="2" markerEnd="url(#arrow)" />
                  <path d="M 430 290 L 430 325" stroke="#6D5EF5" strokeWidth="2" markerEnd="url(#arrow)" />
                  <path d="M 395 394 L 290 437" stroke="#6D5EF5" strokeWidth="2" markerEnd="url(#arrow)" />
                  <path d="M 465 394 L 545 437" stroke="#6D5EF5" strokeWidth="2" markerEnd="url(#arrow)" />
                  <path d="M 705 477 L 684 477" stroke="#64748B" strokeWidth="2" markerEnd="url(#arrowGray)" />

                  <text x="430" y="548" textAnchor="middle" fill="#64748B" fontSize="11" fontFamily="sans-serif" fontStyle="italic">
                    Fig 1: NeuroQuest layered architecture — Client → Middleware → API → Services → Gemini &amp; Supabase
                  </text>
                </svg>
              </div>
            </section>

            {/* 10. DATA FLOW */}
            <section id="data-flow" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#6D5EF5]/10 text-[#6D5EF5] rounded-lg">
                  <Layers className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Data Flow</h2>
              </div>
              <p className="text-slate-600 text-sm">
                Shows the flow from initial student diagnostic test down to concept updates and active storyline gameplay:
              </p>

              <div className="w-full">
                <svg viewBox="0 0 800 180" fill="none" className="w-full h-auto border border-slate-100 rounded-2xl bg-slate-50/50 p-4">
                  <defs>
                    <marker id="arrow-flow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#6D5EF5" />
                    </marker>
                    <linearGradient id="gradient-step" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6D5EF5" />
                      <stop offset="100%" stopColor="#5B8DEF" />
                    </linearGradient>
                  </defs>

                  <rect x="10" y="45" width="100" height="50" rx="8" fill="url(#gradient-step)" />
                  <text x="60" y="75" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Student Input</text>

                  <path d="M 110 70 L 124 70" stroke="#6D5EF5" strokeWidth="2" markerEnd="url(#arrow-flow)" />

                  <rect x="130" y="45" width="115" height="50" rx="8" fill="url(#gradient-step)" />
                  <text x="187.5" y="70" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Diagnostic Quiz</text>
                  <text x="187.5" y="82" textAnchor="middle" fill="#E0E7FF" fontSize="9" fontFamily="sans-serif">(6 Adaptive MCQs)</text>

                  <path d="M 245 70 L 259 70" stroke="#6D5EF5" strokeWidth="2" markerEnd="url(#arrow-flow)" />

                  <rect x="265" y="45" width="125" height="50" rx="8" fill="url(#gradient-step)" />
                  <text x="327.5" y="70" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Proficiency Engine</text>
                  <text x="327.5" y="82" textAnchor="middle" fill="#E0E7FF" fontSize="9" fontFamily="sans-serif">(Weak/Dev/Strong)</text>

                  <path d="M 390 70 L 404 70" stroke="#6D5EF5" strokeWidth="2" markerEnd="url(#arrow-flow)" />

                  <rect x="410" y="45" width="115" height="50" rx="8" fill="url(#gradient-step)" />
                  <text x="467.5" y="70" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Knowledge Map</text>
                  <text x="467.5" y="82" textAnchor="middle" fill="#E0E7FF" fontSize="9" fontFamily="sans-serif">(Visualization)</text>

                  <path d="M 525 70 L 539 70" stroke="#6D5EF5" strokeWidth="2" markerEnd="url(#arrow-flow)" />

                  <rect x="545" y="45" width="115" height="50" rx="8" fill="url(#gradient-step)" />
                  <text x="602.5" y="70" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Story Quest</text>
                  <text x="602.5" y="82" textAnchor="middle" fill="#E0E7FF" fontSize="9" fontFamily="sans-serif">(Active Gameplay)</text>

                  <path d="M 660 70 L 674 70" stroke="#6D5EF5" strokeWidth="2" markerEnd="url(#arrow-flow)" />

                  <rect x="680" y="45" width="105" height="50" rx="8" fill="url(#gradient-step)" />
                  <text x="732.5" y="75" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Progress Ledger</text>

                  <text x="400" y="140" textAnchor="middle" fill="#64748B" fontSize="11" fontFamily="sans-serif" fontStyle="italic">
                    Fig 2: Learning Loop and Data Flow Sequence
                  </text>
                </svg>
              </div>
            </section>

            {/* 11. DATABASE SCHEMA
            <section id="database" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#6D5EF5]/10 text-[#6D5EF5] text-indigo-600 rounded-lg">
                  <Database className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Database Schema</h2>
              </div>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                NeuroQuest is backed by 15 PostgreSQL tables organized across 3 key migrations inside Supabase:
              </p>

              <div className="space-y-4 text-sm">
                <div className="border border-slate-100 p-5 rounded-2xl">
                  <div className="font-bold text-slate-800 mb-2">Migration 1: User Accounts &amp; Auth Sessions</div>
                  <ul className="space-y-1.5 list-disc pl-5 text-slate-600">
                    <li><code>users</code>: Base user profile schema containing credentials, age settings (13-25 limit), language flags, XP, and streak logs.</li>
                    <li><b>Password recovery via security question:</b> at signup the user sets a security question &amp; answer; if they forget their password, they reset it by correctly answering that question (no email OTP).</li>
                    <li><code>sessions</code>: Session mapping persistence with custom secure JWT tokens.</li>
                  </ul>
                </div>

                <div className="border border-slate-100 p-5 rounded-2xl">
                  <div className="font-bold text-slate-800 mb-2">Migration 2: Textbook Curriculum Mapping</div>
                  <ul className="space-y-1.5 list-disc pl-5 text-slate-600">
                    <li><code>subjects</code>: Global subjects metadata lookup map.</li>
                    <li><code>chapters</code>: Textbook pages range targets and indexing flags.</li>
                    <li><code>concepts</code>: 5 detailed sub-concept tags defined per chapter with difficulty indicators.</li>
                    <li><code>chapter_chunks</code>: Textbook paragraphs split dynamically into 500-token chunks.</li>
                    <li><code>student_selections</code>: Caches the currently selected active subject and chapter per user.</li>
                  </ul>
                </div>

                <div className="border border-slate-100 p-5 rounded-2xl">
                  <div className="font-bold text-slate-800 mb-2">Migration 3: Performance &amp; Narrative Gameplay Logs</div>
                  <ul className="space-y-1.5 list-disc pl-5 text-slate-600">
                    <li><code>diagnostic_sessions</code>: Assessment attempt metadata tracking final score and feedback keys.</li>
                    <li><code>diagnostic_questions</code>: System evaluation MCQs mapped to difficulty parameters.</li>
                    <li><code>diagnostic_answers</code>: Detailed logs tracking which options student select and response times.</li>
                    <li><code>concept_proficiency</code>: Core ledger mapping mastery levels (weak, developing, strong) per concept.</li>
                    <li><code>story_scenes</code>: Library of interactive narrative scripts and choices.</li>
                    <li><code>story_sessions</code>: Active session metrics tracking completion levels and indices.</li>
                    <li><code>story_progress</code>: Step-by-step transaction logs tracking user input choices.</li>
                  </ul>
                </div>
              </div>
            </section> */}

            {/* 12. AI LAYER */}
            <section id="ai-layer" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#6D5EF5]/10 text-[#6D5EF5] rounded-lg">
                  <Cpu className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AI Layer (Generative Engine)</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-2">
                  <h3 className="font-bold text-slate-800 text-sm">Google Gemini Integration</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Rather than relying on vector indices (RAG/embeddings are currently on the roadmap), the platform utilizes concept-indexed context injection. It directly maps structured concept definitions from textbooks into prompt parameters.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="border border-slate-100 p-5 rounded-xl space-y-2">
                    <h4 className="font-bold text-slate-800">Multi-Model Fallback Chain</h4>
                    <p className="text-slate-600 leading-relaxed">
                      To improve resilience against API request limits or failures, the diagnostic prompt engine runs a try-catch cascade. If the primary model fails, it falls back to alternative models in sequence.
                    </p>
                  </div>
                  <div className="border border-slate-100 p-5 rounded-xl space-y-2">
                    <h4 className="font-bold text-slate-800">Ethical AI Chatbot Guardrails</h4>
                    <p className="text-slate-600 leading-relaxed">
                      The study assistant utilizes custom system instructions to block cheating. The chatbot is programmed to refuse to reveal direct answers for quizzes or story choices. Instead, it explains underlying scientific concepts, guiding the user to solve it themselves.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 13. SECURITY MEASURES */}
            <section id="security" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#6D5EF5]/10 text-[#6D5EF5] rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Security &amp; Auth</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="border border-slate-100 p-5 rounded-2xl space-y-2">
                  <h3 className="font-bold text-slate-800">Session JWT &amp; Cookie Security</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Authentication uses custom secure JWTs (via the <code>jose</code> library). These are saved in HttpOnly, secure, SameSite cookies to protect student credentials from cross-site scripting (XSS) extraction.
                  </p>
                </div>
                <div className="border border-slate-100 p-5 rounded-2xl space-y-2">
                  <h3 className="font-bold text-slate-800">Route Interception</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A Next.js Edge Middleware checks routes on requests. If invalid/expired tokens are detected on protected paths (like <code>/dashboard</code>, <code>/quiz</code>, <code>/story</code>), session cookies are cleared and users are redirected to login.
                  </p>
                </div>
                <div className="border border-slate-100 p-5 rounded-2xl space-y-2">
                  <h3 className="font-bold text-slate-800">Cryptographic Password Protection</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All user passwords are encrypted with <code>bcryptjs</code> before database entry. Reset flows require verification questions and numeric verification codes.
                  </p>
                </div>
                <div className="border border-slate-100 p-5 rounded-2xl space-y-2">
                  <h3 className="font-bold text-slate-800">Data Sanitization</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Inputs are validated using Zod, preventing SQL injection and layout crashes. Correct options and explanations for active story scenes are omitted in API payloads to prevent inspection leakage.
                  </p>
                </div>
              </div>
            </section>

            {/* 14. ROADMAP */}
            <section id="roadmap" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#6D5EF5]/10 text-[#6D5EF5] rounded-lg">
                  <Milestone className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Roadmap</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div className="border-l-4 border-indigo-500 pl-4 space-y-1">
                  <h3 className="font-bold text-slate-800">Short-Term Goals</h3>
                  <p className="text-slate-600">
                    NeuroQuest tackles the cram-test-forget cycle head-on: an AI diagnostic pinpoints each student's weak concepts, builds a personalized knowledge map, and turns Physics and Biology into living, memorable bilingual story-quests: reinforced by XP, streaks, and ranks that keep students coming back. Our immediate focus is deepening this core loop: shipping the spaced-retrieval reminders that complete the "remember forever" promise, expanding story-quest content to more chapters and subjects, and hardening data security (Row-Level Security) to keep student data safe.
                  </p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4 space-y-1">
                  <h3 className="font-bold text-slate-800">Medium-Term Goals</h3>
                  <p className="text-slate-600">
                    Next, we widen the advantage for learners: semantic textbook search (pgvector embeddings) so students can ask any syllabus question and get curriculum-accurate answers; an IELTS Speaking module powered by speech recognition for complete four-skill preparation; and a content-creator portal that lets teachers and contributors add localized lessons quickly meaning more subjects, chapters, and tracks reaching more students, faster.
                  </p>
                </div>
                <div className="border-l-4 border-[#6D5EF5] pl-4 space-y-1">
                  <h3 className="font-bold text-slate-800">Long-Term Vision</h3>
                  <p className="text-slate-600">
                    For the long term, NeuroQuest will be a sustainable platform and business: a native mobile app (iOS/Android) to reach Bangladesh's mass student base on low-end, low-bandwidth devices; a teacher and school dashboard that opens a B2B revenue channel; positioning as a complementary "retention layer" alongside platforms like 10 Minute School and Shikho rather than a competitor; a freemium-to-subscription model; and expansion across the full NCTB curriculum — with NRB diaspora experts advising on scale. The goal is a defensible, revenue-generating model that keeps the platform affordable for the students who need it most.
                  </p>
                </div>
              </div>
            </section>

            {/* 15. TEAM SHOWCASE */}
            <section id="team" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#6D5EF5]/10 text-[#6D5EF5] rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Team Buddhi.exe</h2>
              </div>
              <p className="text-slate-600 text-sm">
                The developers and designers behind NeuroQuest:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 
                  TODO: Replace initials with actual images once available.
                  Add photos to /public/team/ and set the paths below.
                */}

                <TeamMemberCard name="Meherun Ritu" role="Team leader, Communication lead, Business Analyst" email="ritunesa@gmail.com" initials="MR" />
                <TeamMemberCard name="Tahsin Shuborna" role="UI/UX designer ,Frontend developer ,Project Coordinator" email="shujaanat06@gmail.com" initials="TS" />
                <TeamMemberCard name="Shahriar Hossain Arafat" role="Backend/Database/Scraper Engineer, Full stack developer, Communication lead " email="shahriararafat20@gmail.com" initials="SHA" />
                <TeamMemberCard name="Farjana Nabila" role="Product Strategist " email="nabila@gmail.com" initials="FN" />
              </div>
            </section>

            {/* 16. CHANGELOG
            <section id="changelog" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#6D5EF5]/10 text-[#6D5EF5] rounded-lg">
                  <History className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Changelog</h2>
              </div>

              <div className="space-y-6 text-sm text-slate-600">
                <div className="border-b border-slate-100 pb-4 space-y-1">
                  <span className="text-[#6D5EF5] font-bold text-xs">23 May 2026</span>
                  <h3 className="font-bold text-slate-800">Quiz Question Style Refactor</h3>
                  <p className="text-xs">
                    Cleaned up diagnostic quiz generation to produce straightforward, factual multiple-choice assessments. Removed overlapping scenario-based elements to differentiate the quizzes from Story Quests.
                  </p>
                </div>
                <div className="border-b border-slate-100 pb-4 space-y-1">
                  <span className="text-[#6D5EF5] font-bold text-xs">May 2026 (Initial Release)</span>
                  <h3 className="font-bold text-slate-800">Story Quest APIs &amp; Page Frameworks</h3>
                  <p className="text-xs">
                    Built gameplay routers (<code>POST /api/story/start</code>, <code>POST /api/story/submit-choice</code>, <code>GET /api/story/next-scene</code>) and integrated interactive results graph components using Recharts.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#6D5EF5] font-bold text-xs">June 2026 (Pre-Final)</span>
                  <h3 className="font-bold text-slate-800">Gamification, Chatbot &amp; Progress Systems</h3>
                  <p className="text-xs">
                    Added streak calculations, rank classifications, and user progress pages. Deployed personalized, floating AI study companion with academic honor guardrails to prevent answer leaks.
                  </p>
                </div>
              </div>
            </section> */}

            {/* 17. OUR VISION */}
            <section id="vision" className="scroll-mt-24 bg-gradient-to-r from-[#6D5EF5] to-[#5B8DEF] text-white p-8 rounded-3xl space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6" />
                <h2 className="text-xl font-bold">Our Vision</h2>
              </div>
              <p className="text-sm md:text-base leading-relaxed opacity-95">
                We believe that education is not about passing tests; it is about building structures of understanding that last. By combining story narratives with cognitive science mechanisms and AI-native personalization, NeuroQuest aims to bridge the digital resource gap and empower every student in Bangladesh to achieve long-term mastery.
              </p>
            </section>

          </main>

        </div>
      </div>

      <Footer />
    </div>
  );
}

// ==========================================
// TEAM MEMBER CARD COMPONENT
// ==========================================
function TeamMemberCard({
  name,
  role,
  email,
  imagePath,
  initials
}: {
  name: string;
  role: string;
  email: string;
  imagePath?: string;
  initials: string;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center space-y-4">
      {/* 96px uniform circular avatar */}
      <div className="relative w-24 h-24 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
        {imagePath && !imageError ? (
          <img
            src={imagePath}
            alt={name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#6D5EF5] to-[#5B8DEF] text-white text-xl font-bold tracking-wider">
            {initials}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-slate-800 text-base leading-tight">{name}</h3>
        <p className="text-[#6D5EF5] text-[10px] font-bold uppercase tracking-wider">{role}</p>
        <p className="text-slate-500 text-xs mt-2 flex items-center gap-1.5 justify-center">
          <Mail className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate max-w-[140px]">{email}</span>
        </p>
      </div>
    </div>
  );
}
