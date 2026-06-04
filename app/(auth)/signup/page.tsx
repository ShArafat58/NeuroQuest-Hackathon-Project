"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Brain,
  User,
  Mail,
  Calendar,
  Lock,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Loader2,
  HelpCircle,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: "",
      email: "",
      birthdate: "",
      password: "",
      confirm_password: "",
      version: "bangla",
      current_class: "ssc",
      security_question: "",
      security_answer: "",
    },
  });

  const selectedVersion = watch("version");
  const selectedClass = watch("current_class");

  useEffect(() => {
    if (selectedClass === "ielts" || selectedClass === "medical") {
      setValue("version", "english");
    }
  }, [selectedClass, setValue]);

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Signup failed. Please try again.");
      } else {
        toast.success("Account created successfully!");
        router.push('/dashboard');
      }
    } catch (_err) {
      toast.error("An unexpected error occurred. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-transparent">
      {/* 1. Left Side: Brand Panel */}
      <div className="hidden lg:flex w-5/12 bg-primary text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background visual art */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-2 w-fit">
          <Brain className="w-10 h-10 text-white fill-white/10" />
          <div className="flex flex-col">
            <span className="font-black text-2xl leading-none">NeuroQuest</span>
            <span className="text-[10px] text-white/80 font-bold tracking-widest uppercase mt-0.5">স্মৃতিযোদ্ধা</span>
          </div>
        </Link>

        {/* Brand Core tagline & illustrations */}
        <div className="space-y-6 my-auto max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white/90">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SSC • HSC • IELTS • Medical Prep</span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight">
            Learn Once. <br />
            Remember Forever.
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Stop studying to forget. Our personalized narrative learning quests integrate with spaced retrieval mechanics to convert complex concepts into natural, lifelong intuition—supporting multiple academic tracks with Science as our flagship.
          </p>

          <div className="space-y-3 pt-6 border-t border-white/10 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <span>Personalized story quest pathways per chapter</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <span>Spaced revision quizzes at day 7, 21, and 45</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <span>Comprehensive dashboard for mock exam analytics</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-white/60">
          NeuroQuest &copy; 2026 &mdash; Infinity AI BuildFest
        </div>
      </div>

      {/* 2. Right Side: Signup Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-lg bg-white border border-gray-100/80 p-8 rounded-2xl shadow-xl shadow-slate-100/50">
          <div className="text-center lg:text-left space-y-2 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Create Account</h1>
            <p className="text-sm text-slate-500">
              Join NeuroQuest and begin your multi-track learning journey today.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-xs font-bold text-slate-700">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="full_name"
                  placeholder="e.g. Adnan Rahman"
                  className="pl-10"
                  {...register("full_name")}
                />
              </div>
              {errors.full_name && (
                <p className="text-xs text-red-500 font-semibold">{errors.full_name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. adnan@gmail.com"
                  className="pl-10"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 font-semibold">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Birthdate */}
              <div className="space-y-1.5">
                <Label htmlFor="birthdate" className="text-xs font-bold text-slate-700">Birthdate</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="birthdate"
                    type="date"
                    className="pl-10"
                    {...register("birthdate")}
                  />
                </div>
                {errors.birthdate && (
                  <p className="text-xs text-red-500 font-semibold">{errors.birthdate.message}</p>
                )}
              </div>

              {/* Class Select */}
              <div className="space-y-1.5">
                <Label htmlFor="current_class" className="text-xs font-bold text-slate-700">Current Class</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-slate-400 z-10" />
                  <Controller
                    control={control}
                    name="current_class"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-border">
                          <SelectItem value="ssc" className="cursor-pointer">Class 9-10 (SSC)</SelectItem>
                          <SelectItem value="hsc_1" className="cursor-pointer">HSC 1st Year</SelectItem>
                          <SelectItem value="hsc_2" className="cursor-pointer">HSC 2nd Year</SelectItem>
                          <SelectItem value="ielts" className="cursor-pointer">IELTS</SelectItem>
                          <SelectItem value="medical" className="cursor-pointer">Medical</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                {errors.current_class && (
                  <p className="text-xs text-red-500 font-semibold">{errors.current_class.message}</p>
                )}
              </div>
            </div>

            {/* Version Radio Group */}
            {selectedClass !== "ielts" && selectedClass !== "medical" && (
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Select NCTB Version</Label>
                <Controller
                  control={control}
                  name="version"
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      {/* Bangla Card */}
                      <div className="relative">
                        <RadioGroupItem
                          value="bangla"
                          id="v-bangla"
                          className="sr-only"
                        />
                        <Label
                          htmlFor="v-bangla"
                          className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all-custom text-left space-y-1.5 ${selectedVersion === "bangla"
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-gray-100 bg-white hover:bg-transparent"
                            }`}
                        >
                          <span className="text-sm font-bold text-slate-900">Bangla Version</span>
                          <span className="text-[11px] text-slate-500 leading-tight">
                            আমি বাংলা মাধ্যমে পড়াশোনা করি। (Sample: মহাকর্ষ বল)
                          </span>
                        </Label>
                      </div>

                      {/* English Card */}
                      <div className="relative">
                        <RadioGroupItem
                          value="english"
                          id="v-english"
                          className="sr-only"
                        />
                        <Label
                          htmlFor="v-english"
                          className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all-custom text-left space-y-1.5 ${selectedVersion === "english"
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-gray-100 bg-white hover:bg-transparent"
                            }`}
                        >
                          <span className="text-sm font-bold text-slate-900">English Version</span>
                          <span className="text-[11px] text-slate-500 leading-tight">
                            I study in English version. (Sample: Gravitation)
                          </span>
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                {errors.version && (
                  <p className="text-xs text-red-500 font-semibold">{errors.version.message}</p>
                )}
              </div>
            )}

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-slate-700">Password</Label>
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
              <Label htmlFor="confirm_password" className="text-xs font-bold text-slate-700">Confirm Password</Label>
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

            {/* Security Question Select */}
            <div className="space-y-1.5">
              <Label htmlFor="security_question" className="text-xs font-bold text-slate-700">নিরাপত্তা প্রশ্ন / Security Question</Label>
              <div className="relative">
                <HelpCircle className="absolute left-3 top-3 w-4 h-4 text-slate-400 z-10" />
                <Controller
                  control={control}
                  name="security_question"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="একটি প্রশ্ন নির্বাচন করুন / Select a question" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-border">
                        <SelectItem value="তোমার প্রথম স্কুলের নাম? / Name of your first school?" className="cursor-pointer">
                          তোমার প্রথম স্কুলের নাম? / Name of your first school?
                        </SelectItem>
                        <SelectItem value="তোমার প্রিয় শিক্ষকের নাম? / Your favourite teacher's name?" className="cursor-pointer">
                          তোমার প্রিয় শিক্ষকের নাম? / Your favourite teacher's name?
                        </SelectItem>
                        <SelectItem value="তোমার জন্মশহরের নাম? / Your city of birth?" className="cursor-pointer">
                          তোমার জন্মশহরের নাম? / Your city of birth?
                        </SelectItem>
                        <SelectItem value="তোমার প্রথম পোষা প্রাণীর নাম? / Your first pet's name?" className="cursor-pointer">
                          তোমার প্রথম পোষা প্রাণীর নাম? / Your first pet's name?
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {errors.security_question && (
                <p className="text-xs text-red-500 font-semibold">{errors.security_question.message}</p>
              )}
            </div>

            {/* Security Answer Input */}
            <div className="space-y-1.5">
              <Label htmlFor="security_answer" className="text-xs font-bold text-slate-700">নিরাপত্তা উত্তর / Security Answer</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="security_answer"
                  type="text"
                  placeholder="আপনার উত্তর লিখুন / Enter your answer"
                  className="pl-10"
                  {...register("security_answer")}
                />
              </div>
              {errors.security_answer && (
                <p className="text-xs text-red-500 font-semibold">{errors.security_answer.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#6D5EF5] to-[#5B8DEF] text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 font-bold h-11 shadow-md shadow-primary/10 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <span>Sign Up &amp; Begin Quests</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Links to login */}
          <div className="text-center mt-6 text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-bold transition-all">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
