"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Brain, KeyRound, Mail, Loader2, ArrowRight, Lock, HelpCircle } from "lucide-react";

type Step = "email" | "question" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/lookup-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to process request. Please try again.");
      } else {
        setSecurityQuestion(result.security_question);
        setStep("question");
      }
    } catch (_err) {
      toast.error("An unexpected error occurred. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityAnswer) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/verify-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          security_answer: securityAnswer,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Verification failed. Please try again.");
      } else {
        setStep("reset");
      }
    } catch (_err) {
      toast.error("An unexpected error occurred. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;

    // Client-side validations
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      toast.error("Password must contain at least 1 letter and 1 number");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/set-new-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          security_answer: securityAnswer,
          password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Password reset failed. Please try again.");
      } else {
        toast.success("Password updated successfully! Please login.");
        router.push("/login");
        router.refresh();
      }
    } catch (_err) {
      toast.error("An unexpected error occurred. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 55%, #312E81 100%)" }}>
      {/* Decorative glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl shadow-black/40 flex flex-col items-center">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-2 mb-8">
          <Brain className="w-8 h-8 text-indigo-300 fill-indigo-300/10" />
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-lg leading-none text-white">NeuroQuest</span>
            <span className="text-[10px] text-indigo-300 font-bold tracking-widest uppercase">স্মৃতিযোদ্ধা</span>
          </div>
        </Link>

        {step === "email" && (
          /* Step 1: Email Form */
          <div className="w-full flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-indigo-500/15 border border-white/10 flex items-center justify-center text-indigo-300 mb-6">
              <Mail className="w-8 h-8 text-indigo-300" />
            </div>

            <div className="text-center space-y-2 mb-6">
              <h1 className="text-2xl font-extrabold text-white">Forgot Password</h1>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
                Enter your email address to look up your security question.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4 w-full">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-slate-200">Email Address / ইমেইল ঠিকানা</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus-visible:ring-indigo-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
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
                    Finding Account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <span>Next / পরবর্তী</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        )}

        {step === "question" && (
          /* Step 2: Answer Security Question */
          <div className="w-full flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-indigo-500/15 border border-white/10 flex items-center justify-center text-indigo-300 mb-6">
              <HelpCircle className="w-8 h-8 text-indigo-300" />
            </div>

            <div className="text-center space-y-2 mb-6">
              <h1 className="text-2xl font-extrabold text-white">Security Question</h1>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
                Answer your security question to verify your identity.
              </p>
            </div>

            <form onSubmit={handleQuestionSubmit} className="space-y-4 w-full">
              {/* Plain Security Question Box */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-sm font-semibold text-white text-center leading-relaxed">
                {securityQuestion}
              </div>

              {/* Security Answer Input */}
              <div className="space-y-1.5">
                <Label htmlFor="security_answer" className="text-xs font-bold text-slate-200">Security Answer / নিরাপত্তা উত্তর</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="security_answer"
                    type="text"
                    placeholder="Enter your answer"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus-visible:ring-indigo-400"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    required
                  />
                </div>
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
                    Verifying Answer...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <span>Verify Answer / উত্তর যাচাই করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-center text-xs text-slate-400 hover:text-white font-bold hover:underline mt-2 transition-all"
              >
                &larr; Back to Email Lookup
              </button>
            </form>
          </div>
        )}

        {step === "reset" && (
          /* Step 3: Set New Password Form */
          <div className="w-full flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-400/20 flex items-center justify-center text-amber-300 mb-6">
              <KeyRound className="w-8 h-8 text-amber-300" />
            </div>

            <div className="text-center space-y-2 mb-6">
              <h1 className="text-2xl font-extrabold text-white">Set New Password</h1>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
                Enter your new password below.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 w-full">
              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-slate-200">New Password / নতুন পাসওয়ার্ড</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min 8 chars, 1 letter + 1 number"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus-visible:ring-indigo-400"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm_password" className="text-xs font-bold text-slate-200">Confirm New Password / পাসওয়ার্ড নিশ্চিত করুন</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="Repeat your password"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus-visible:ring-indigo-400"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
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
                    Resetting Password...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <span>Reset Password / পাসওয়ার্ড পরিবর্তন করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Back link */}
        <Link
          href="/login"
          className="mt-6 text-sm text-slate-300 hover:text-white font-semibold hover:underline"
        >
          &larr; Back to login
        </Link>
      </div>
    </div>
  );
}