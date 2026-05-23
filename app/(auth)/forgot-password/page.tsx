"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Brain, KeyRound, Mail, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        toast.error("Failed to process request. Please try again.");
      } else {
        toast.success("If account exists, reset code sent.");
        setIsSuccess(true);
        // Automatically redirect to reset password page after 3 seconds
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
        }, 3000);
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

        {isSuccess ? (
          /* Success State Card */
          <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in duration-300 w-full">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-slate-900 font-sans">Reset Code Sent!</h1>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                If your email exists in our records, a 6-digit password reset code has been sent.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs text-slate-500 font-medium">
              Redirecting you to enter the reset code...
            </div>
            <Link
              href={`/reset-password?email=${encodeURIComponent(getValues("email"))}`}
              className="text-sm font-bold text-primary hover:underline flex items-center justify-center gap-1"
            >
              <span>Click here if not redirected</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Request Reset Form */
          <div className="w-full flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary mb-6">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>

            <div className="text-center space-y-2 mb-6">
              <h1 className="text-2xl font-extrabold text-slate-900">Forgot Password</h1>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Enter your email address and we&apos;ll dispatch a 6-digit recovery code.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 font-semibold">{errors.email.message}</p>
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
                    Sending Code...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <span>Send Reset Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Back link */}
            <Link
              href="/login"
              className="mt-6 text-sm text-slate-500 hover:text-slate-700 font-semibold hover:underline"
            >
              &larr; Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
