"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Zap,
  Droplets,
  Settings,
  Apple,
  Lightbulb,
  TreeDeciduous,
  Eye,
  Sun,
  Moon,
  Sparkles,
  HelpCircle,
  Trophy,
  Loader2,
  ArrowRight,
  Check,
  X,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

// ═══════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

interface SceneData {
  id: string;
  scene_index: number;
  title_bn: string;
  title_en: string;
  narrative_bn: string;
  narrative_en: string;
  question_bn: string;
  question_en: string;
  options: {
    a: { bn: string; en: string };
    b: { bn: string; en: string };
    c: { bn: string; en: string };
  };
  icon_name: string;
}

interface SubmitResult {
  is_correct: boolean;
  correct_option: "a" | "b" | "c";
  explanation_bn: string;
  explanation_en: string;
  is_session_complete: boolean;
  next_scene_index: number | null;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  version: "bangla" | "english";
}

interface SceneTheme {
  gradient: string;
  particleType: string;
  textColor: string;
  cardBg: string;
  accentColor: string;
  isDark: boolean;
}

// ═══════════════════════════════════════════════════════════════
// 1. SCENE THEME SYSTEM — per-icon visual atmosphere
// ═══════════════════════════════════════════════════════════════

const SCENE_THEMES: Record<string, SceneTheme> = {
  zap: {
    gradient: "from-slate-900 via-purple-950 to-blue-950",
    particleType: "rain",
    textColor: "text-slate-100",
    cardBg: "bg-slate-900/90 border-purple-500/20 backdrop-blur-xl",
    accentColor: "text-purple-400",
    isDark: true,
  },
  droplets: {
    gradient: "from-sky-50 via-blue-100 to-cyan-100",
    particleType: "drops",
    textColor: "text-slate-800",
    cardBg: "bg-white/90 border-blue-200/60 backdrop-blur-xl",
    accentColor: "text-blue-500",
    isDark: false,
  },
  settings: {
    gradient: "from-blue-100 via-cyan-100 to-teal-100",
    particleType: "gears",
    textColor: "text-slate-800",
    cardBg: "bg-white/90 border-cyan-200/60 backdrop-blur-xl",
    accentColor: "text-cyan-600",
    isDark: false,
  },
  apple: {
    gradient: "from-orange-100 via-yellow-100 to-amber-100",
    particleType: "mangoes",
    textColor: "text-slate-800",
    cardBg: "bg-white/90 border-amber-200/60 backdrop-blur-xl",
    accentColor: "text-orange-500",
    isDark: false,
  },
  lightbulb: {
    gradient: "from-slate-900 via-amber-950/50 to-stone-900",
    particleType: "glow",
    textColor: "text-slate-100",
    cardBg: "bg-slate-900/90 border-amber-500/20 backdrop-blur-xl",
    accentColor: "text-amber-400",
    isDark: true,
  },
  "tree-deciduous": {
    gradient: "from-amber-50 via-yellow-100 to-orange-50",
    particleType: "leaves",
    textColor: "text-slate-800",
    cardBg: "bg-white/90 border-orange-200/60 backdrop-blur-xl",
    accentColor: "text-yellow-600",
    isDark: false,
  },
  eye: {
    gradient: "from-emerald-50 via-green-100 to-teal-50",
    particleType: "cells",
    textColor: "text-slate-800",
    cardBg: "bg-white/90 border-green-200/60 backdrop-blur-xl",
    accentColor: "text-green-600",
    isDark: false,
  },
  sun: {
    gradient: "from-amber-100 via-orange-100 to-yellow-100",
    particleType: "rays",
    textColor: "text-slate-800",
    cardBg: "bg-white/90 border-orange-200/60 backdrop-blur-xl",
    accentColor: "text-orange-600",
    isDark: false,
  },
  moon: {
    gradient: "from-slate-950 via-indigo-950 to-slate-900",
    particleType: "stars",
    textColor: "text-slate-100",
    cardBg: "bg-slate-900/90 border-indigo-500/20 backdrop-blur-xl",
    accentColor: "text-indigo-400",
    isDark: true,
  },
  sparkles: {
    gradient: "from-purple-50 via-pink-100 to-rose-50",
    particleType: "sparkles",
    textColor: "text-slate-800",
    cardBg: "bg-white/90 border-pink-200/60 backdrop-blur-xl",
    accentColor: "text-pink-500",
    isDark: false,
  },
};

const DEFAULT_THEME: SceneTheme = {
  gradient: "from-slate-50 via-purple-50 to-blue-50",
  particleType: "glow",
  textColor: "text-slate-800",
  cardBg: "bg-white/90 border-slate-200 backdrop-blur-xl",
  accentColor: "text-primary",
  isDark: false,
};

// ═══════════════════════════════════════════════════════════════
// ICON MAP
// ═══════════════════════════════════════════════════════════════

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  droplets: Droplets,
  settings: Settings,
  apple: Apple,
  lightbulb: Lightbulb,
  "tree-deciduous": TreeDeciduous,
  eye: Eye,
  sun: Sun,
  moon: Moon,
  sparkles: Sparkles,
};

// ═══════════════════════════════════════════════════════════════
// 2. PARTICLE EFFECTS ENGINE — pure Framer Motion, no canvas
// ═══════════════════════════════════════════════════════════════

const SceneParticles = React.memo(function SceneParticles({ type }: { type: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Rain — vertical streaks */}
      {type === "rain" &&
        Array.from({ length: 22 }).map((_, i) => (
          <motion.div
            key={`r-${i}`}
            className="absolute w-px h-8 bg-purple-400/30"
            style={{ left: `${i * 4.5 + Math.random() * 2}%`, top: -40, willChange: "transform" }}
            animate={{ y: ["0vh", "110vh"] }}
            transition={{ duration: 0.9 + Math.random() * 0.6, repeat: Infinity, ease: "linear", delay: Math.random() * 1.4 }}
          />
        ))}

      {/* Water drops */}
      {type === "drops" &&
        Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`d-${i}`}
            className="absolute w-2 h-2 rounded-full bg-cyan-400/25"
            style={{ left: `${i * 10 + Math.random() * 3}%`, top: -20, willChange: "transform" }}
            animate={{ y: ["0vh", "110vh"], x: [0, Math.random() * 14 - 7, 0] }}
            transition={{ duration: 5 + Math.random() * 3, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 4 }}
          />
        ))}

      {/* Rotating gears */}
      {type === "gears" &&
        [
          { s: 180, x: "8%", y: "18%", dur: 28, dir: 1 },
          { s: 260, x: "72%", y: "52%", dur: 38, dir: -1 },
        ].map((g, i) => (
          <motion.div
            key={`g-${i}`}
            className="absolute text-cyan-500/[0.04]"
            style={{ left: g.x, top: g.y, width: g.s, height: g.s, willChange: "transform" }}
            animate={{ rotate: g.dir * 360 }}
            transition={{ duration: g.dur, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
          </motion.div>
        ))}

      {/* Falling leaves */}
      {type === "leaves" &&
        Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`l-${i}`}
            className="absolute w-3 h-4 bg-orange-400/15 rounded-tl-full rounded-br-full"
            style={{ left: `${i * 8 + Math.random() * 3}%`, top: -25, willChange: "transform" }}
            animate={{ y: ["0vh", "110vh"], x: [`0vw`, `${Math.random() * 16 - 4}vw`], rotate: [0, 240] }}
            transition={{ duration: 7 + Math.random() * 4, repeat: Infinity, ease: "easeOut", delay: Math.random() * 5 }}
          />
        ))}

      {/* Firefly glow */}
      {type === "glow" &&
        Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={`fw-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-yellow-400/30 blur-[1px]"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, willChange: "transform" }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.08, 0.65, 0.08] }}
            transition={{ duration: 2.5 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2.5 }}
          />
        ))}

      {/* Floating cells */}
      {type === "cells" &&
        Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`c-${i}`}
            className="absolute w-4 h-4 rounded-full bg-green-400/[0.07] border border-green-400/10"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, willChange: "transform" }}
            animate={{ x: [0, Math.random() * 40 - 20, 0], y: [0, Math.random() * 40 - 20, 0] }}
            transition={{ duration: 14 + Math.random() * 8, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

      {/* Sun rays */}
      {type === "rays" &&
        Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`ray-${i}`}
            className="absolute w-px h-60 bg-gradient-to-t from-orange-400/10 to-transparent origin-bottom"
            style={{ left: "50%", top: "8%", willChange: "transform" }}
            animate={{ rotate: [`${i * 45}deg`, `${i * 45 + 360}deg`] }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          />
        ))}

      {/* Twinkling stars */}
      {type === "stars" &&
        Array.from({ length: 28 }).map((_, i) => (
          <motion.div
            key={`s-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, willChange: "transform" }}
            animate={{ opacity: [0.08, 0.85, 0.08] }}
            transition={{ duration: 1.5 + Math.random() * 1.5, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
          />
        ))}

      {/* Sparkle bursts */}
      {type === "sparkles" &&
        Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`sp-${i}`}
            className="absolute text-pink-400/20"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, willChange: "transform" }}
            animate={{ scale: [0, 1.1, 0], opacity: [0, 0.5, 0] }}
            transition={{ duration: 2.2 + Math.random() * 1.5, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 3 }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        ))}

      {/* Falling mangoes */}
      {type === "mangoes" &&
        Array.from({ length: 7 }).map((_, i) => (
          <motion.div
            key={`m-${i}`}
            className="absolute w-4 h-6 bg-gradient-to-b from-orange-400/12 to-yellow-500/12 rounded-full"
            style={{ left: `${i * 14 + Math.random() * 4}%`, top: -30, willChange: "transform" }}
            animate={{ y: ["0vh", "110vh"], x: [`0vw`, `${Math.random() * 14 - 3}vw`], rotate: [0, 70] }}
            transition={{ duration: 5 + Math.random() * 2, repeat: Infinity, ease: "easeIn", delay: Math.random() * 3.5 }}
          />
        ))}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════
// 3. TYPEWRITER ANIMATION COMPONENTS
// ═══════════════════════════════════════════════════════════════
// 🔧 BUG FIX (23 May 2026): Changed TypewriterTitle from character-level
// to word-level split. Character-level (Array.from(text)) was breaking
// Bangla conjuncts (যুক্তাক্ষর like গ্র, দ্য, ক্ষ) because they are
// multi-codepoint clusters. Word-level split keeps conjuncts intact while
// preserving the cinematic reveal animation.
// ═══════════════════════════════════════════════════════════════

function TypewriterTitle({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <motion.h1
      className={`text-2xl md:text-3xl font-black leading-tight ${className}`}
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-2"
          variants={{
            hidden: { opacity: 0, y: 14 },
            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 14 } },
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
}

function TypewriterParagraph({
  text,
  onComplete,
  className = "",
}: {
  text: string;
  onComplete?: () => void;
  className?: string;
}) {
  const words = text.split(" ");
  return (
    <motion.div
      className={`leading-[1.85] whitespace-pre-line flex flex-wrap ${className}`}
      initial="hidden"
      animate="visible"
      onAnimationComplete={onComplete}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.025, delayChildren: 0.5 } } }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="mr-1.5 inline-block"
          variants={{
            hidden: { opacity: 0, y: 6 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
          }}
        >
          {w || "\u00A0"}
        </motion.span>
      ))}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. CONFETTI BURST — for correct answers & completion
// ═══════════════════════════════════════════════════════════════

function ConfettiBurst({ count = 30 }: { count?: number }) {
  const colors = ["bg-emerald-400", "bg-yellow-400", "bg-green-400", "bg-sky-400", "bg-pink-400", "bg-purple-400"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 select-none">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
        const radius = 55 + Math.random() * 130;
        const xT = Math.cos((angle * Math.PI) / 180) * radius;
        const yT = Math.sin((angle * Math.PI) / 180) * radius - 60;
        return (
          <motion.div
            key={i}
            className={`absolute w-2.5 h-2.5 ${colors[i % colors.length]} rounded-sm`}
            style={{ left: "50%", top: "55%", willChange: "transform" }}
            initial={{ scale: 0.1, opacity: 1, x: 0, y: 0 }}
            animate={{ x: xT, y: yT, scale: [0.1, 1.1, 0.3], opacity: [1, 1, 0], rotate: [0, Math.random() * 360] }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function StoryQuestPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const session_id = params?.session_id as string;

  // State — identical to original
  const [user, setUser] = useState<UserProfile | null>(null);
  const [scene, setScene] = useState<SceneData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<"a" | "b" | "c" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // NEW: narrative typing finished flag
  const [narrativeReady, setNarrativeReady] = useState(false);

  // ─── Auth ──────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) setUser(data.user);
        else router.push("/login");
      })
      .catch(() => router.push("/login"));
  }, [router]);

  // ─── Scene Fetcher (unchanged logic) ──────────────────────
  const fetchScene = async (index: number) => {
    setIsLoading(true);
    setError(null);
    setNarrativeReady(false);
    try {
      const res = await fetch(`/api/story/next-scene?session_id=${session_id}&scene_index=${index}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Scene not found / দৃশ্যপটটি পাওয়া যায়নি");
        const errData = await res.json();
        throw new Error(errData.error_en || "Failed to fetch scene");
      }
      const data = await res.json();
      setScene(data.current_scene);
      setCurrentSceneIndex(data.current_scene_index);
      setSelectedOption(null);
      setSubmitResult(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Connection error";
      console.error(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Initial Fetch ────────────────────────────────────────
  useEffect(() => {
    if (user && session_id) {
      const qi = searchParams.get("scene_index");
      fetchScene(qi ? parseInt(qi, 10) : 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, session_id]);

  // Safety fallback: if typewriter is slow, reveal questions after 3.5s
  useEffect(() => {
    if (scene) {
      const t = setTimeout(() => setNarrativeReady(true), 3500);
      return () => clearTimeout(t);
    }
  }, [scene?.id]);

  // ─── Derived ──────────────────────────────────────────────
  const isBangla = user?.version === "bangla";
  const theme: SceneTheme = scene ? (SCENE_THEMES[scene.icon_name] || DEFAULT_THEME) : DEFAULT_THEME;
  const IconComponent = scene ? (ICON_MAP[scene.icon_name] || HelpCircle) : HelpCircle;

  const formatNum = (num: number) => {
    if (!isBangla) return num.toString();
    const bn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return num.toString().split("").map((d) => bn[parseInt(d, 10)] || d).join("");
  };

  // ─── Submit (unchanged logic) ─────────────────────────────
  const handleSubmit = async () => {
    if (!selectedOption || isSubmitting || !scene) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/story/submit-choice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id, scene_id: scene.id, selected_option: selectedOption }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error_en || "Submission failed");
      }
      const data: SubmitResult = await res.json();
      setSubmitResult(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (!submitResult) return;
    if (submitResult.is_session_complete) setIsComplete(true);
    else if (submitResult.next_scene_index) fetchScene(submitResult.next_scene_index);
  };

  // ═══════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════

  if (isLoading && !scene && !error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
        <p className="mt-4 text-sm font-semibold text-purple-300/70 animate-pulse">
          {isBangla ? "গল্পের দৃশ্যপট লোড হচ্ছে..." : "Loading Story Scene..."}
        </p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // ERROR STATE
  // ═══════════════════════════════════════════════════════════

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 rounded-3xl p-8 max-w-md border border-purple-500/20 shadow-2xl text-center space-y-6"
        >
          <div className="w-16 h-16 bg-purple-950/40 text-purple-400 rounded-2xl flex items-center justify-center mx-auto border border-purple-500/20">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">
            {isBangla ? "ত্রুটি দেখা দিয়েছে" : "Error Occurred"}
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">{error}</p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => fetchScene(currentSceneIndex)} className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white">
              {isBangla ? "আবার চেষ্টা করুন" : "Retry"}
            </Button>
            <Button variant="ghost" onClick={() => router.push("/dashboard")} className="w-full text-slate-400">
              {isBangla ? "ড্যাশবোর্ডে ফিরে যান" : "Back to Dashboard"}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user || !scene) return null;

  // ═══════════════════════════════════════════════════════════
  // COMPLETION / TROPHY CELEBRATION
  // ═══════════════════════════════════════════════════════════

  if (isComplete) {
    return (
      <div className="min-h-screen bg-slate-950 py-16 px-4 flex items-center justify-center relative overflow-hidden">
        <SceneParticles type="sparkles" />
        <ConfettiBurst count={80} />

        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          className="bg-slate-900/90 border border-purple-500/25 rounded-3xl p-10 max-w-lg shadow-2xl text-center space-y-8 backdrop-blur-xl relative z-10"
        >
          {/* Animated trophy */}
          <div className="relative w-28 h-28 mx-auto">
            <motion.div
              animate={{ rotate: [0, 8, -8, 8, 0], y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              className="w-28 h-28 bg-yellow-400/10 text-yellow-500 rounded-3xl flex items-center justify-center border border-yellow-500/25"
            >
              <Trophy className="w-14 h-14 drop-shadow-[0_0_12px_rgba(234,179,8,0.3)]" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute -top-3 -right-3 w-9 h-9 bg-purple-600 text-white rounded-full flex items-center justify-center border border-purple-400/20"
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              {isBangla ? "অভিনন্দন! 🎉" : "Congratulations! 🎉"}
            </h1>
            <p className="text-lg font-bold text-purple-300">
              {isBangla
                ? "তুমি সফলভাবে স্টোরি কোয়েস্ট জার্নি সম্পন্ন করেছ!"
                : "You have successfully completed the Story Quest journey!"}
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              {isBangla
                ? "বিজ্ঞান ধারণার নতুন দিগন্ত আজ তোমার স্পর্শে উন্মোচিত হয়েছে।"
                : "A new horizon of scientific concepts has opened up through your actions today."}
            </p>
          </div>

          <div className="bg-slate-950/50 rounded-2xl p-6 border border-purple-500/10 grid grid-cols-2 gap-4">
            <div className="text-center">
              <span className="block text-3xl font-black text-slate-100">{formatNum(5)}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {isBangla ? "দৃশ্য সম্পন্ন" : "Scenes Completed"}
              </span>
            </div>
            <div className="text-center border-l border-slate-800">
              <span className="block text-3xl font-black text-green-400">{isBangla ? "১০০%" : "100%"}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {isBangla ? "অংশগ্রহণ" : "Participation"}
              </span>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Button
              size="lg"
              onClick={() => router.push("/dashboard")}
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-lg shadow-lg shadow-purple-500/20 rounded-2xl"
            >
              {isBangla ? "ড্যাশবোর্ডে যাও" : "Go to Dashboard"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // ACTIVE CINEMATIC GAMEPLAY
  // ═══════════════════════════════════════════════════════════

  return (
    <div className={`min-h-screen py-10 px-4 flex flex-col items-center relative overflow-hidden transition-colors duration-1000 bg-gradient-to-br ${theme.gradient}`}>
      {/* Themed Particles */}
      <SceneParticles type={theme.particleType} />

      <div className="w-full max-w-3xl relative z-10 flex-1 flex flex-col">
        {/* ─── Top Bar ────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme.isDark ? "bg-white/10 text-white" : "bg-primary/10 text-primary"}`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.isDark ? "text-slate-400" : "text-slate-500"}`}>
                Story Quest
              </span>
              <h4 className={`text-sm font-extrabold ${theme.isDark ? "text-slate-200" : "text-slate-800"}`}>
                {isBangla
                  ? `দৃশ্য ${formatNum(scene.scene_index)} / ${formatNum(5)}`
                  : `Scene ${formatNum(scene.scene_index)} / ${formatNum(5)}`}
              </h4>
            </div>
          </div>

          {/* Progress dots */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm shadow-sm select-none ${theme.isDark ? "bg-white/5 border-white/10" : "bg-white/50 border-white/30"}`}>
            {Array.from({ length: 5 }).map((_, idx) => {
              const step = idx + 1;
              const isActive = step === scene.scene_index;
              const isDone = step < scene.scene_index;
              return (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-500 ${isActive
                      ? "w-6 bg-gradient-to-r from-purple-500 to-indigo-500"
                      : isDone
                        ? "w-2.5 bg-green-500"
                        : `w-2 ${theme.isDark ? "bg-slate-700" : "bg-slate-300"}`
                    }`}
                />
              );
            })}
          </div>
        </div>

        {/* ─── Scene Content ──────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="space-y-6 flex-1 flex flex-col"
          >
            {/* Narrative Card */}
            <div className={`rounded-3xl p-8 md:p-10 border shadow-2xl space-y-8 flex-1 ${theme.cardBg}`}>
              {/* Icon + Title */}
              <div className="flex items-center gap-5">
                <motion.div
                  initial={{ rotate: -180, scale: 0.7, opacity: 0 }}
                  animate={{
                    rotate: 0,
                    scale: [1, 1.04, 1],
                    opacity: 1,
                    boxShadow: [
                      "0 0 0px rgba(124,58,237,0)",
                      "0 0 18px rgba(124,58,237,0.25)",
                      "0 0 0px rgba(124,58,237,0)",
                    ],
                  }}
                  transition={{
                    rotate: { duration: 0.7, ease: "easeOut" },
                    scale: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
                    boxShadow: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
                    opacity: { duration: 0.5 },
                  }}
                  className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                >
                  <IconComponent className="w-8 h-8" />
                </motion.div>

                <TypewriterTitle
                  text={isBangla ? scene.title_bn : scene.title_en}
                  className={theme.isDark ? "text-slate-100" : "text-slate-900"}
                />
              </div>

              {/* Narrative — word-by-word typewriter */}
              <TypewriterParagraph
                text={isBangla ? scene.narrative_bn : scene.narrative_en}
                onComplete={() => setNarrativeReady(true)}
                className={`border-l-4 pl-6 py-2 text-lg md:text-xl font-normal ${theme.isDark ? "text-slate-300 border-slate-700/50" : "text-slate-700 border-slate-200/60"
                  }`}
              />

              {/* Decision Section — stagger entrance after narrative */}
              <AnimatePresence>
                {narrativeReady && (
                  <motion.div
                    initial={{ opacity: 0, y: 35 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="space-y-6"
                  >
                    {/* Question */}
                    <div className={`rounded-2xl p-6 border ${theme.isDark ? "bg-purple-500/5 border-purple-500/10" : "bg-purple-500/[0.03] border-purple-500/10"}`}>
                      <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${theme.isDark ? "text-purple-400" : "text-purple-500"}`}>
                        {isBangla ? "সিদ্ধান্তের সময়" : "Time to Decide"}
                      </span>
                      <p className={`text-lg md:text-xl font-bold leading-snug ${theme.isDark ? "text-slate-100" : "text-slate-900"}`}>
                        {isBangla ? scene.question_bn : scene.question_en}
                      </p>
                    </div>

                    {/* Options — staggered entrance */}
                    <motion.div
                      className="space-y-3"
                      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}
                      initial="hidden"
                      animate="show"
                    >
                      {(["a", "b", "c"] as const).map((key) => {
                        const opt = scene.options[key];
                        const isSel = selectedOption === key;
                        const done = submitResult !== null;

                        // Dynamic option styling
                        let border = theme.isDark ? "border-slate-700/60 hover:border-purple-500/40" : "border-slate-200 hover:border-purple-400/40";
                        let bg = "bg-transparent";
                        let txt = theme.isDark ? "text-slate-300" : "text-slate-700";
                        let badge = theme.isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500";

                        if (isSel && !done) {
                          border = "border-purple-500 ring-2 ring-purple-500/20";
                          bg = theme.isDark ? "bg-purple-500/[0.06]" : "bg-purple-50/60";
                          txt = "text-purple-500 font-bold";
                          badge = "bg-purple-500 text-white";
                        }

                        if (done) {
                          const isRight = key === submitResult.correct_option;
                          const isWrong = isSel && !isRight;
                          if (isRight) {
                            border = "border-green-500 ring-2 ring-green-500/15";
                            bg = theme.isDark ? "bg-green-500/[0.06]" : "bg-green-50/60";
                            txt = "text-green-500 font-bold";
                            badge = "bg-green-500 text-white";
                          } else if (isWrong) {
                            border = "border-red-500 ring-2 ring-red-500/15";
                            bg = theme.isDark ? "bg-red-500/[0.04]" : "bg-red-50/40";
                            txt = "text-red-500";
                            badge = "bg-red-500 text-white";
                          } else {
                            border = "border-transparent opacity-40";
                            txt = "text-slate-400";
                            badge = theme.isDark ? "bg-slate-800 text-slate-600" : "bg-slate-100 text-slate-400";
                          }
                        }

                        return (
                          <motion.button
                            key={key}
                            disabled={done}
                            variants={{
                              hidden: { opacity: 0, y: 16 },
                              show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } },
                            }}
                            whileHover={!done ? { scale: 1.012, y: -3 } : {}}
                            onClick={() => setSelectedOption(key)}
                            className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 relative ${border} ${bg}`}
                          >
                            {/* Confetti on correct + selected */}
                            {done && key === submitResult.correct_option && isSel && submitResult.is_correct && (
                              <ConfettiBurst count={28} />
                            )}

                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${badge}`}>
                              {key.toUpperCase()}
                            </div>
                            <span className={`text-base md:text-lg leading-snug flex-1 ${txt}`}>
                              {isBangla ? opt.bn : opt.en}
                            </span>

                            {isSel && !done && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center shrink-0"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </motion.div>
                            )}

                            {done && key === submitResult.correct_option && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.25, 1] }}
                                className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center shadow-sm shrink-0"
                              >
                                <Check className="w-4 h-4" />
                              </motion.div>
                            )}

                            {done && isSel && key !== submitResult.correct_option && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.25, 1] }}
                                className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─── Bottom Actions ─────────────────────────── */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {submitResult === null
                  ? narrativeReady && (
                    <motion.div
                      key="submit"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="flex justify-end pt-4"
                    >
                      <Button
                        size="lg"
                        disabled={!selectedOption || isSubmitting}
                        onClick={handleSubmit}
                        className={`w-full sm:w-auto px-10 h-14 text-lg font-bold rounded-2xl transition-all duration-300 shadow-lg ${selectedOption
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/20"
                            : `${theme.isDark ? "bg-slate-800 text-slate-600" : "bg-slate-200 text-slate-400"} cursor-not-allowed`
                          }`}
                      >
                        {isSubmitting && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                        {isBangla ? "উত্তর জমা দাও" : "Submit Answer"}
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  )
                  : (
                    <motion.div
                      key="reveal"
                      initial={{ opacity: 0, scale: 0.96, y: 25 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 220, damping: 18 }}
                      className="space-y-6"
                    >
                      {/* Explanation card */}
                      <div
                        className={`rounded-3xl p-6 md:p-8 border shadow-lg backdrop-blur-md ${submitResult.is_correct
                            ? "bg-green-500/10 border-green-500/25"
                            : "bg-amber-500/10 border-amber-500/25"
                          }`}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${submitResult.is_correct ? "bg-green-500 text-white" : "bg-amber-500 text-white"
                              }`}
                          >
                            {submitResult.is_correct ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                          </div>
                          <h3 className={`text-lg md:text-xl font-black ${theme.isDark ? "text-slate-100" : "text-slate-900"}`}>
                            {submitResult.is_correct
                              ? isBangla ? "চমৎকার! সঠিক সিদ্ধান্ত 🎉" : "Excellent Decision! 🎉"
                              : isBangla ? "প্রায় পেরেছিলে! 💡" : "Almost got it! 💡"}
                          </h3>
                        </div>

                        {/* Explanation with word-fade */}
                        <TypewriterParagraph
                          text={isBangla ? submitResult.explanation_bn : submitResult.explanation_en}
                          className={`border-transparent pl-0 text-base md:text-lg leading-relaxed font-normal ${submitResult.is_correct
                              ? theme.isDark ? "text-green-200/85" : "text-green-800/85"
                              : theme.isDark ? "text-amber-200/85" : "text-amber-800/85"
                            }`}
                        />
                      </div>

                      {/* Next / Complete button */}
                      <div className="flex justify-end pt-2">
                        <Button
                          size="lg"
                          onClick={handleNextStep}
                          className="w-full sm:w-auto px-10 h-14 text-lg font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-2xl shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.015]"
                        >
                          {submitResult.is_session_complete ? (
                            <>
                              {isBangla ? "যাত্রা শেষ!" : "Journey Complete!"}
                              <Trophy className="w-5 h-5" />
                            </>
                          ) : (
                            <>
                              {isBangla ? "পরবর্তী দৃশ্য" : "Next Scene"}
                              <ArrowRight className="w-5 h-5" />
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
