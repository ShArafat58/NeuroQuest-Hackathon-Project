"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Brain, LogOut, User, Globe, Settings, ChevronDown, Flame, Zap, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getRank } from "@/lib/rank";

interface HeaderProps {
  user?: {
    id: string;
    name: string;
    email: string;
    version: "bangla" | "english";
  };
}

const toBnNum = (num: number) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(n => bnDigits[parseInt(n)] || n).join('');
};

export default function Header({ user: propUser }: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState(propUser || null);
  const [currentLang, setCurrentLang] = useState<"bangla" | "english">("bangla");
  const [stats, setStats] = useState<{ total_xp: number; current_streak: number; longest_streak: number } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Fetch current user details if not passed as a prop
  useEffect(() => {
    if (!propUser) {
      fetch("/api/auth/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.user) {
            setUser(data.user);
            setCurrentLang(data.user.version);
          }
        })
        .catch(() => {});
    } else {
      setUser(propUser);
      setCurrentLang(propUser.version);
    }
  }, [propUser]);

  useEffect(() => {
    if (user) {
      setLoadingStats(true);
      fetch("/api/user/stats")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.success) {
            setStats(data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingStats(false));
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        toast.success(
          currentLang === "bangla" ? "সফলভাবে লগআউট করা হয়েছে!" : "Logged out successfully!"
        );
        router.push("/login");
        router.refresh();
      } else {
        toast.error("Logout failed. Please try again.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred during logout.");
    }
  };

  const toggleLanguage = async () => {
    const nextLang = currentLang === "bangla" ? "english" : "bangla";
    setCurrentLang(nextLang);
    
    if (user) {
      try {
        const res = await fetch("/api/user/change-version", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ new_version: nextLang }),
        });
        if (res.ok) {
          toast.success(
            nextLang === "bangla"
              ? "ভাষা পরিবর্তন করে বাংলা করা হয়েছে"
              : "Language switched to English"
          );
          window.location.reload();
        } else {
          toast.error("Failed to switch language");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to switch language");
      }
    } else {
      toast.success(
        nextLang === "bangla"
          ? "ভাষা পরিবর্তন করে বাংলা করা হয়েছে"
          : "Language switched to English"
      );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const isBangla = user ? user.version === "bangla" : currentLang === "bangla";
  const userRank = stats ? getRank(stats.total_xp) : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left Side: Logo & Brand */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="relative w-8 h-8 flex items-center justify-center bg-primary rounded-lg text-white font-black overflow-hidden">
            <Image src="/logo.svg" alt="N" width={32} height={32} />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-primary leading-none tracking-tight">NeuroQuest</span>
            <span className="text-[10px] text-secondary font-bold tracking-widest uppercase">স্মৃতিযোদ্ধা</span>
          </div>
        </Link>

        {/* Right Side: Stats, Language & User Dropdown */}
        <div className="flex items-center gap-4">
          
          {/* Stats Display */}
          {user && (
            <div className="flex items-center gap-2 mr-2">
              {loadingStats && !stats ? (
                <div className="w-24 h-8 bg-slate-100 animate-pulse rounded-full" />
              ) : stats && userRank ? (
                <>
                  {/* Streak Pill */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: '#FFF4E5', color: '#92400E' }}>
                    <Flame className="w-4 h-4" style={{ color: '#F59E0B' }} />
                    <span className="font-medium">
                      {isBangla ? toBnNum(stats.current_streak) : stats.current_streak}
                      <span className="hidden sm:inline"> {isBangla ? "দিন" : "days"}</span>
                    </span>
                  </div>
                  
                  {/* XP Pill */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: '#EEF0FF', color: '#3C3489' }}>
                    <Zap className="w-4 h-4" style={{ color: '#6D5EF5' }} />
                    <span className="font-medium">
                      {isBangla ? toBnNum(stats.total_xp) : stats.total_xp}
                      <span className="hidden sm:inline"> XP</span>
                    </span>
                  </div>
                  
                  {/* Rank Badge */}
                  <div 
                    className="hidden sm:flex items-center px-3 py-1.5 rounded-full text-sm font-medium" 
                    style={{ backgroundColor: userRank.bg, color: userRank.color }}
                  >
                    {isBangla ? userRank.name : userRank.nameEn}
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* Language Toggle Trigger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 text-slate-700 hover:text-primary transition-colors text-xs font-semibold"
          >
            <Globe className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">{currentLang === "bangla" ? "English" : "বাংলা"}</span>
            <span className="sm:hidden">{currentLang === "bangla" ? "EN" : "BN"}</span>
          </Button>

          {/* User profile dropdown if logged in */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 outline-none p-1 rounded-full hover:bg-slate-100 transition-colors">
                  <Avatar className="w-8 h-8 border border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1 border border-border p-1 bg-white shadow-lg rounded-xl">
                <DropdownMenuLabel className="px-3 py-2 text-xs font-normal">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">{user.name}</p>
                  <p className="text-[11px] text-slate-500 leading-none mt-1 truncate">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem onClick={() => router.push('/progress')} className="flex items-center gap-2 px-3 py-2 text-slate-700 rounded-lg hover:bg-transparent cursor-pointer text-sm">
                  <TrendingUp className="w-4 h-4 text-slate-500" />
                  <span>{currentLang === "bangla" ? "আমার উন্নতি" : "My Progress"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')} className="flex items-center gap-2 px-3 py-2 text-slate-700 rounded-lg hover:bg-transparent cursor-pointer text-sm">
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>{currentLang === "bangla" ? "সেটিংস" : "Settings"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 rounded-lg hover:bg-red-50 cursor-pointer text-sm font-medium"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>{currentLang === "bangla" ? "লগআউট" : "Logout"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold text-sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-gradient-to-r from-[#6D5EF5] to-[#5B8DEF] text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 font-semibold text-sm">
                  Start Free
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
