"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Atom, Leaf, Globe, FlaskConical, Landmark, Globe2, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// প্রতিটা subject-এর icon, রঙ ও ছোট বর্ণনা (code দিয়ে map)।
// নতুন subject add করলে এখানে একটা entry যোগ করলেই হবে; না দিলে DEFAULT_META ব্যবহার হবে।
const SUBJECT_META: Record<
  string,
  { icon: any; bg: string; fg: string; descBn: string; descEn: string }
> = {
  physics_ssc: {
    icon: Atom,
    bg: "bg-indigo-100",
    fg: "text-indigo-600",
    descBn: "কাজ, শক্তি, গতি এবং আরো অনেক কিছু",
    descEn: "Work, Energy, Motion, and more",
  },
  biology_ssc: {
    icon: Leaf,
    bg: "bg-green-100",
    fg: "text-green-600",
    descBn: "কোষ, শক্তি, জীবন প্রক্রিয়া",
    descEn: "Cells, Energy, Life processes",
  },
  ict_ssc: {
    icon: Globe,
    bg: "bg-sky-100",
    fg: "text-sky-600",
    descBn: "ইন্টারনেট, ওয়েব ও ব্রাউজার",
    descEn: "Internet, Web, and Browsers",
  },
  chemistry_ssc: {
    icon: FlaskConical,
    bg: "bg-rose-100",
    fg: "text-rose-600",
    descBn: "পদার্থের অবস্থা, ব্যাপন ও পাতন",
    descEn: "States of Matter, Diffusion, and more",
  },
  history_ssc: {
    icon: Landmark,
    bg: "bg-amber-100",
    fg: "text-amber-700",
    descBn: "মুক্তিযুদ্ধ, গণআন্দোলন ও সভ্যতা",
    descEn: "Liberation War, Mass Movements & Civilization",
  },
  geography_ssc: {
    icon: Globe2,
    bg: "bg-teal-100",
    fg: "text-teal-700",
    descBn: "মহাবিশ্ব, পৃথিবী ও পরিবেশ",
    descEn: "Universe, Earth & Environment",
  },
};

const DEFAULT_META = {
  icon: BookOpen,
  bg: "bg-slate-100",
  fg: "text-slate-600",
  descBn: "শেখা শুরু করুন",
  descEn: "Start learning",
};

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

        {/* Subject Cards — DB থেকে dynamic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {subjects.map((subject) => {
            const meta = SUBJECT_META[subject.code] || DEFAULT_META;
            const Icon = meta.icon;
            return (
              <Link
                key={subject.code}
                href={`/select-chapter?subject=${subject.code}`}
                className="block group"
              >
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 h-full">
                  <div className={`w-16 h-16 ${meta.bg} ${meta.fg} rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {isBangla ? subject.name_bn : subject.name_en}
                  </h2>
                  <p className="text-slate-500">
                    {isBangla ? meta.descBn : meta.descEn}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Subject না থাকলে */}
        {subjects.length === 0 && (
          <p className="text-center text-slate-400 mt-10">
            {isBangla ? "কোনো বিষয় পাওয়া যায়নি।" : "No subjects found."}
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
}