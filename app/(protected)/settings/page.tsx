"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound, Save } from "lucide-react";
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const isBangla = user.version === "bangla";
  const initials = user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const memberSince = new Date(user.created_at).toLocaleDateString(isBangla ? 'bn-BD' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header user={user} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">
          {isBangla ? "সেটিংস" : "Settings"}
        </h1>

        {/* Section 1: Account Information */}
        <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle>{isBangla ? "অ্যাকাউন্ট তথ্য" : "Account Information"}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
                <p className="text-slate-500">{user.email}</p>
                <p className="text-xs text-slate-400 mt-2">
                  {isBangla ? `সদস্য: ${memberSince}` : `Member since: ${memberSince}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Change Password */}
        <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-slate-500" />
              {isBangla ? "পাসওয়ার্ড পরিবর্তন" : "Change Password"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>{isBangla ? "বর্তমান পাসওয়ার্ড" : "Current Password"}</Label>
                <Input type="password" {...register("current_password")} />
                {errors.current_password && <p className="text-xs text-red-500">{errors.current_password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{isBangla ? "নতুন পাসওয়ার্ড" : "New Password"}</Label>
                <Input type="password" {...register("new_password")} />
                {errors.new_password && <p className="text-xs text-red-500">{errors.new_password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{isBangla ? "নতুন পাসওয়ার্ড নিশ্চিত করুন" : "Confirm New Password"}</Label>
                <Input type="password" {...register("confirm_password")} />
                {errors.confirm_password && <p className="text-xs text-red-500">{errors.confirm_password.message}</p>}
              </div>
              <Button type="submit" disabled={isChangingPassword} className="bg-primary hover:bg-primary/90 text-white font-bold w-full sm:w-auto">
                {isChangingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isBangla ? "পাসওয়ার্ড পরিবর্তন করুন" : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Section 3: Learning Preferences */}
        <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle>{isBangla ? "শিক্ষাগত সেটিংস" : "Learning Preferences"}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            
            {/* 3a: Class */}
            <div className="space-y-4">
              <Label className="text-base font-bold text-slate-800">
                {isBangla ? "আপনার শ্রেণী" : "Your Class"}
              </Label>
              <RadioGroup value={selectedClass} onValueChange={setSelectedClass} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['ssc', 'hsc_1', 'hsc_2'].map((cls) => (
                  <div key={cls}>
                    <RadioGroupItem value={cls} id={`class-${cls}`} className="peer sr-only" />
                    <Label
                      htmlFor={`class-${cls}`}
                      className="flex flex-col items-center justify-center rounded-xl border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                    >
                      <span className="font-bold text-slate-900">
                        {cls === 'ssc' ? (isBangla ? 'এসএসসি' : 'SSC') : cls === 'hsc_1' ? (isBangla ? 'এইচএসসি ১ম বর্ষ' : 'HSC 1st Year') : (isBangla ? 'এইচএসসি ২য় বর্ষ' : 'HSC 2nd Year')}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs font-medium text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 inline-block">
                {isBangla ? "সতর্কতা: শ্রেণী পরিবর্তন আপনার বর্তমান বিষয় ও অধ্যায় নির্বাচন রিসেট করবে।" : "Warning: Changing class will reset your subject and chapter selection."}
              </p>
              <div>
                <Button 
                  onClick={handleSaveClass} 
                  disabled={isChangingClass || selectedClass === user.current_class}
                  variant="outline"
                  className="font-bold"
                >
                  {isChangingClass ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isBangla ? "শ্রেণী সংরক্ষণ করুন" : "Save Class"}
                </Button>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* 3b: NCTB Version */}
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
                      className="flex flex-col items-center justify-center rounded-xl border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                    >
                      <span className="font-bold text-slate-900">
                        {ver === 'bangla' ? 'Bangla Version' : 'English Version'}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <div>
                <Button 
                  onClick={handleSaveVersion} 
                  disabled={isChangingVersion || selectedVersion === user.version}
                  variant="outline"
                  className="font-bold"
                >
                  {isChangingVersion ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isBangla ? "সংস্করণ সংরক্ষণ করুন" : "Save Version"}
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>

      </main>

      <Footer />
    </div>
  );
}
