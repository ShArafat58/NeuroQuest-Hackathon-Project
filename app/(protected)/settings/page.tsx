"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound, Save, User, Lock, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { changePasswordSchema, ChangePasswordInput } from "@/lib/validators";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingClass, setIsChangingClass] = useState(false);
  const [isChangingVersion, setIsChangingVersion] = useState(false);

  // Editable preferences
  const [selectedClass, setSelectedClass] = useState<string>("ssc");
  const [selectedVersion, setSelectedVersion] = useState<string>("bangla");

  useEffect(() => {
    if (selectedClass === "ielts" || selectedClass === "medical") {
      setSelectedVersion("english");
    }
  }, [selectedClass]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
          setSelectedClass(data.user.current_class);
          setSelectedVersion(data.user.version);
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const onChangePassword = async (data: ChangePasswordInput) => {
    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok) {
        toast.success(result.message);
        setTimeout(() => {
          router.push("/login");
        }, 1000);
      } else {
        toast.error(result.error || "Failed to change password");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveClass = async () => {
    if (selectedClass === user.current_class) return;
    setIsChangingClass(true);
    try {
      const res = await fetch("/api/user/change-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_class: selectedClass }),
      });
      const result = await res.json();

      if (res.ok) {
        toast.success(user.version === "bangla" ? "শ্রেণী আপডেট হয়েছে" : "Class updated");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to change class");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setIsChangingClass(false);
    }
  };

  const handleSaveVersion = async () => {
    if (selectedVersion === user.version) return;
    setIsChangingVersion(true);
    try {
      const res = await fetch("/api/user/change-version", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_version: selectedVersion }),
      });
      const result = await res.json();

      if (res.ok) {
        toast.success("Version updated");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to change version");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setIsChangingVersion(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const isBangla = user.version === "bangla";
  const initials = user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const signupDate = new Date(user.created_at);
  const isValidDate = !isNaN(signupDate.getTime()) && user.created_at !== null && user.created_at !== undefined;
  const memberSince = isValidDate
    ? signupDate.toLocaleDateString(isBangla ? 'bn-BD' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Header user={user} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">
          {isBangla ? "সেটিংস" : "Settings"}
        </h1>

        {/* Section 1: Account Information */}
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 px-6 py-4 flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF0FF] flex items-center justify-center text-[#6D5EF5] shrink-0">
              <User className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg font-bold text-slate-900 tracking-tight">
              {isBangla ? "অ্যাকাউন্ট তথ্য" : "Account Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 border-2 border-[#6D5EF5]/20">
                <AvatarFallback className="bg-[#EEF0FF] text-[#6D5EF5] text-2xl font-black">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
                <p className="text-slate-500">{user.email}</p>
                {memberSince && (
                  <p className="text-xs text-slate-400 mt-2">
                    {isBangla ? `সদস্য: ${memberSince}` : `Member since: ${memberSince}`}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Change Password */}
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 px-6 py-4 flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF0FF] flex items-center justify-center text-[#6D5EF5] shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg font-bold text-slate-900 tracking-tight">
              {isBangla ? "পাসওয়ার্ড পরিবর্তন" : "Change Password"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">{isBangla ? "বর্তমান পাসওয়ার্ড" : "Current Password"}</Label>
                <Input type="password" {...register("current_password")} className="rounded-xl border-gray-200 focus-visible:ring-purple-400 focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:border-transparent h-11 transition-all duration-200" />
                {errors.current_password && <p className="text-xs text-red-500">{errors.current_password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">{isBangla ? "নতুন পাসওয়ার্ড" : "New Password"}</Label>
                <Input type="password" {...register("new_password")} className="rounded-xl border-gray-200 focus-visible:ring-purple-400 focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:border-transparent h-11 transition-all duration-200" />
                {errors.new_password && <p className="text-xs text-red-500">{errors.new_password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">{isBangla ? "নতুন পাসওয়ার্ড নিশ্চিত করুন" : "Confirm New Password"}</Label>
                <Input type="password" {...register("confirm_password")} className="rounded-xl border-gray-200 focus-visible:ring-purple-400 focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:border-transparent h-11 transition-all duration-200" />
                {errors.confirm_password && <p className="text-xs text-red-500">{errors.confirm_password.message}</p>}
              </div>
              <Button type="submit" disabled={isChangingPassword} className="bg-gradient-to-r from-[#6D5EF5] to-[#5B8DEF] hover:shadow-lg hover:shadow-purple-500/25 text-white font-bold rounded-xl transition-all duration-200 h-11 px-6 disabled:bg-gray-100 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none w-full sm:w-auto mt-2">
                {isChangingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isBangla ? "পাসওয়ার্ড পরিবর্তন করুন" : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Section 3: Learning Preferences */}
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 px-6 py-4 flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF0FF] flex items-center justify-center text-[#6D5EF5] shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg font-bold text-slate-900 tracking-tight">
              {isBangla ? "শিক্ষাগত সেটিংস" : "Learning Preferences"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-8">

            {/* 3a: Class */}
            <div className="space-y-4">
              <Label className="text-base font-bold text-slate-800">
                {isBangla ? "আপনার শ্রেণী" : "Your Class"}
              </Label>
              <RadioGroup value={selectedClass} onValueChange={setSelectedClass} className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {['ssc', 'hsc_1', 'hsc_2', 'ielts', 'medical'].map((cls) => (
                  <div key={cls}>
                    <RadioGroupItem value={cls} id={`class-${cls}`} className="peer sr-only" />
                    <Label
                      htmlFor={`class-${cls}`}
                      className="flex flex-col items-center justify-center rounded-xl border-2 border-gray-100 bg-white p-4 hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer transition-all duration-200 peer-data-[state=checked]:border-[#6D5EF5] peer-data-[state=checked]:bg-purple-50 peer-data-[state=checked]:text-[#3C3489]"
                    >
                      <span className="font-bold">
                        {cls === 'ssc'
                          ? (isBangla ? 'এসএসসি' : 'SSC')
                          : cls === 'hsc_1'
                            ? (isBangla ? 'এইচএসসি ১ম বর্ষ' : 'HSC 1st Year')
                            : cls === 'hsc_2'
                              ? (isBangla ? 'এইচএসসি ২য় বর্ষ' : 'HSC 2nd Year')
                              : cls === 'ielts'
                                ? 'IELTS'
                                : 'Medical'}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="pt-2">
                <Button
                  onClick={handleSaveClass}
                  disabled={isChangingClass || selectedClass === user.current_class}
                  className="bg-gradient-to-r from-[#6D5EF5] to-[#5B8DEF] hover:shadow-lg hover:shadow-purple-500/25 text-white font-bold rounded-xl transition-all duration-200 h-11 px-6 disabled:bg-gray-100 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isChangingClass ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isBangla ? "শ্রেণী পরিবর্তন সংরক্ষণ করুন" : "Save Class Change"}
                </Button>
              </div>
            </div>

            {/* 3b: NCTB Version */}
            {selectedClass !== "ielts" && selectedClass !== "medical" && (
              <>
                <hr className="border-gray-100" />
                <div className="space-y-4">
                  <Label className="text-base font-bold text-slate-800">
                    {isBangla ? "এনসিটিবি সংস্করণ" : "NCTB Version"}
                  </Label>
                  <RadioGroup value={selectedVersion} onValueChange={setSelectedVersion} className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm">
                    {['bangla', 'english'].map((ver) => (
                      <div key={ver}>
                        <RadioGroupItem value={ver} id={`ver-${ver}`} className="peer sr-only" />
                        <Label
                          htmlFor={`ver-${ver}`}
                          className="flex flex-col items-center justify-center rounded-xl border-2 border-gray-100 bg-white p-4 hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer transition-all duration-200 peer-data-[state=checked]:border-[#6D5EF5] peer-data-[state=checked]:bg-purple-50 peer-data-[state=checked]:text-[#3C3489]"
                        >
                          <span className="font-bold">
                            {ver === 'bangla' ? 'Bangla Version' : 'English Version'}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <div className="pt-2">
                    <Button
                      onClick={handleSaveVersion}
                      disabled={isChangingVersion || selectedVersion === user.version}
                      className="bg-gradient-to-r from-[#6D5EF5] to-[#5B8DEF] hover:shadow-lg hover:shadow-purple-500/25 text-white font-bold rounded-xl transition-all duration-200 h-11 px-6 disabled:bg-gray-100 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      {isChangingVersion ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      {isBangla ? "সংস্করণ সংরক্ষণ করুন" : "Save Version"}
                    </Button>
                  </div>
                </div>
              </>
            )}

          </CardContent>
        </Card>

      </main>

      <Footer />
    </div>
  );
}
