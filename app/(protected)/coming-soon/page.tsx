"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function ComingSoonPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const isBangla = user.version === "bangla";

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Header user={user} />

      <main className="flex-1 flex flex-col items-center justify-center container mx-auto px-4 py-12 max-w-3xl text-center">
        <div className="bg-white rounded-2xl p-10 md:p-16 border border-gray-100 shadow-xl w-full">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
            {isBangla ? "Diagnostic Quiz শীঘ্রই আসছে!" : "Diagnostic Quiz Coming Soon!"}
          </h1>
          
          <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">
            {isBangla 
              ? "আমরা আপনার জন্য পার্সোনালাইজড লার্নিং কোয়েস্ট তৈরি করছি। পরবর্তী আপডেটে এই ফিচারটি পাবেন।" 
              : "We're crafting your personalized learning quest. This feature is in our next sprint."}
          </p>

          <Button 
            size="lg" 
            variant="outline"
            className="border-primary/20 text-primary hover:bg-primary/5 font-bold px-8 h-12"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {isBangla ? "ড্যাশবোর্ডে ফিরে যান" : "Back to Dashboard"}
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
