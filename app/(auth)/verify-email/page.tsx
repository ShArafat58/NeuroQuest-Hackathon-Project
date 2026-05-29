"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyEmailSchema, type VerifyEmailInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Brain, ShieldCheck, Mail, Loader2, ArrowRight } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: "",
    },
  });

  const codeVal = watch("code");

  // Timer countdown logic for Resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const onSubmit = async (data: VerifyEmailInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: data.code,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Verification failed. Please try again.");
      } else {
        toast.success("Email verified successfully! Welcome to NeuroQuest.");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (_err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return;

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success("A new 6-digit verification code has been dispatched!");
        setCountdown(60);
        setCanResend(false);
      } else {
        const result = await res.json();
        toast.error(result.error || "Failed to resend verification code. Please try again.");
      }
    } catch (_err) {
      toast.error("Failed to resend verification code. Please check your connection.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white border border-slate-200/80 p-8 rounded-2xl shadow-xl shadow-slate-100/50 flex flex-col items-center">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-2 mb-8">
          <Brain className="w-8 h-8 text-primary fill-primary/10" />
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-lg leading-none text-slate-800">NeuroQuest</span>
            <span className="text-[10px] text-secondary font-bold tracking-widest uppercase">স্মৃতিযোদ্ধা</span>
          </div>
        </Link>

        {/* Header Icons & Headings */}
        <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary mb-6">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>

        <div className="text-center space-y-2 mb-6 w-full">
          <h1 className="text-2xl font-extrabold text-slate-900">Verify Your Email</h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            We sent a 6-digit verification code to <br />
            <span className="font-bold text-slate-800 break-all">{email || "your email address"}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-xs font-bold text-slate-700 block text-center">
              Enter 6-Digit OTP Code
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-400" />
              <Input
                id="code"
                placeholder="123456"
                maxLength={6}
                className="pl-10 text-center tracking-[10px] font-mono text-lg font-bold h-11 border-slate-200"
                {...register("code")}
              />
            </div>
            {errors.code && (
              <p className="text-xs text-red-500 font-semibold text-center">{errors.code.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || codeVal.length !== 6}
            className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-11 shadow-md shadow-primary/10"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying OTP...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <span>Verify &amp; Launch Journey</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Resend Countdown */}
        <div className="mt-8 text-center text-sm">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-primary hover:underline font-bold transition-all"
            >
              Resend verification code
            </button>
          ) : (
            <p className="text-slate-500">
              Didn&apos;t receive the code? Resend in <span className="font-bold text-slate-700">{countdown}s</span>
            </p>
          )}
        </div>

        {/* Back link */}
        <Link href="/signup" className="mt-6 text-xs text-slate-400 hover:text-slate-600 font-semibold hover:underline">
          &larr; Back to sign up
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
          <div className="text-slate-400 text-sm font-medium">Loading...</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
