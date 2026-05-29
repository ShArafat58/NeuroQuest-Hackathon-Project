"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Brain, Lock, Mail, Loader2, ArrowRight, KeyRound } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Read email from search params to securely bind code search
  const [email, setEmail] = useState(searchParams.get("email") || "");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: "",
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: data.code,
          password: data.password,
          confirm_password: data.confirm_password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Password reset failed. Please check the code.");
      } else {
        toast.success("Password updated successfully! Please login with your new password.");
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

        {/* Form Icon & Headings */}
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-6 animate-pulse">
          <KeyRound className="w-8 h-8" />
        </div>

        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">Set New Password</h1>
          <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
            Enter the 6-digit verification code sent to your email to establish a new password.
          </p>
        </div>

        {/* Reset Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
          {/* Email Bind (Allows override if missing from search param) */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-slate-700">Account Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 border-slate-200"
                disabled={!!searchParams.get("email")}
              />
            </div>
          </div>

          {/* Reset Code */}
          <div className="space-y-1.5">
            <Label htmlFor="code" className="text-xs font-bold text-slate-700">6-Digit Reset Code</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="code"
                placeholder="e.g. 123456"
                maxLength={6}
                className="pl-10 font-mono tracking-[4px] text-slate-800 font-bold"
                {...register("code")}
              />
            </div>
            {errors.code && (
              <p className="text-xs text-red-500 font-semibold">{errors.code.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-bold text-slate-700">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="Min 8 chars, 1 letter + 1 number"
                className="pl-10"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 font-semibold">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm_password" className="text-xs font-bold text-slate-700">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="confirm_password"
                type="password"
                placeholder="Repeat your password"
                className="pl-10"
                {...register("confirm_password")}
              />
            </div>
            {errors.confirm_password && (
              <p className="text-xs text-red-500 font-semibold">{errors.confirm_password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-11 shadow-md shadow-primary/10 mt-2"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating Password...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <span>Reset Password</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Back Link */}
        <Link
          href="/login"
          className="mt-6 text-sm text-slate-500 hover:text-slate-700 font-semibold hover:underline"
        >
          &larr; Back to login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
          <div className="text-slate-400 text-sm font-medium">Loading...</div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
