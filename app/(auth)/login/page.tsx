"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Brain, Mail, Lock, Loader2, ArrowRight, Info, X } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const [isLoading, setIsLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerText, setBannerText] = useState("Login required to access this page");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (reason === "auth_required") {
      setShowBanner(true);
      const isBn = typeof navigator !== "undefined" &&
        (navigator.language.startsWith("bn") ||
          navigator.languages?.some(lang => lang.startsWith("bn")));

      if (isBn) {
        setBannerText("এই পেজ দেখতে লগইন করুন");
      } else {
        setBannerText("Login required to access this page");
      }
    }
  }, [reason]);

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 403 && result.email) {
          toast.error("Please verify your email first.");
          router.push(`/verify-email?email=${encodeURIComponent(result.email)}`);
        } else {
          toast.error(result.error || "Wrong email or password");
        }
      } else {
        toast.success("Welcome back to NeuroQuest!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (_err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 flex-col overflow-hidden" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 55%, #312E81 100%)" }}>
      {/* Decorative glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Banner placed above the card */}
      {showBanner && (
        <div className="relative z-10 w-full max-w-md mb-4 bg-indigo-500/15 border border-indigo-400/30 text-indigo-100 p-4 rounded-xl flex items-center justify-between shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-indigo-300 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{bannerText}</span>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-indigo-300 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl shadow-black/40 flex flex-col">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-2 mb-8 self-center">
          <Brain className="w-8 h-8 text-indigo-300 fill-indigo-300/10" />
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-lg leading-none text-white">NeuroQuest</span>
            <span className="text-[10px] text-indigo-300 font-bold tracking-widest uppercase">স্মৃতিযোদ্ধা</span>
          </div>
        </Link>

        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl font-extrabold text-white">Welcome Back</h1>
          <p className="text-sm text-slate-300">
            Log in to continue your personalized story quests.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-slate-200">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus-visible:ring-indigo-400"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-400 font-semibold">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-xs font-bold text-slate-200">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-indigo-300 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus-visible:ring-indigo-400"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-400 font-semibold">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#6D5EF5] to-[#5B8DEF] text-white hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-200 font-bold h-11 shadow-md shadow-primary/20 mt-2"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging in...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Links to signup */}
        <div className="text-center mt-6 text-sm text-slate-300">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-indigo-300 hover:underline font-bold transition-all">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 55%, #312E81 100%)" }}>
          <div className="text-slate-300 text-sm font-medium">Loading...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}