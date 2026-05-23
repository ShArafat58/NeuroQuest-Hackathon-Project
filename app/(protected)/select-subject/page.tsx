"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Atom, Leaf, Loader2 } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function SelectSubjectPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
          fetchSubjects(data.user.current_class);
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const fetchSubjects = async (grade: string) => {
    try {
      const res = await fetch(`/api/curriculum/subjects?grade=${grade}`);
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const isBangla = user.version === "bangla";

  const getClassName = (cls: string) => {
    switch (cls) {
      case "ssc": return isBangla ? "শ্রেণী ৯-১০ (এসএসসি)" : "Class 9-10 (SSC)";
      case "hsc_1": return isBangla ? "এইচএসসি ১ম বর্ষ" : "HSC 1st Year";
      case "hsc_2": return isBangla ? "এইচএসসি ২য় বর্ষ" : "HSC 2nd Year";
      default: return cls;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header user={user} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-primary hover:underline font-medium text-sm flex items-center">
            &larr; {getClassName(user.current_class)}
          </Link>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
            {isBangla ? "বিষয় নির্বাচন করুন" : "Select Subject"}
          </h1>
          <p className="text-slate-500 text-lg">
            {isBangla ? "আপনি কোন বিষয় পড়তে চান?" : "Which subject would you like to study?"}
          </p>
        </div>

        {/* Subject Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Card 1 - Physics */}
          <Link href="/select-chapter?subject=physics_ssc" className="block group">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 h-full">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Atom className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {isBangla ? "পদার্থবিজ্ঞান" : "Physics"}
              </h2>
              <p className="text-slate-500">
                {isBangla ? "কাজ, শক্তি, গতি এবং আরো অনেক কিছু" : "Work, Energy, Motion, and more"}
              </p>
            </div>
          </Link>

          {/* Card 2 - Biology */}
          <Link href="/select-chapter?subject=biology_ssc" className="block group">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 h-full">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Leaf className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {isBangla ? "জীববিজ্ঞান" : "Biology"}
              </h2>
              <p className="text-slate-500">
                {isBangla ? "কোষ, শক্তি, জীবন প্রক্রিয়া" : "Cells, Energy, Life processes"}
              </p>
            </div>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
