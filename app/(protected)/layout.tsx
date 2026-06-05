"use client";

import React from "react";
import { usePathname } from "next/navigation";
import ChatWidget from "@/components/ChatWidget";
import ParallaxBackground from "@/components/ParallaxBackground";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStoryPage = pathname ? pathname.startsWith("/story") : false;

  return (
    <div className="relative min-h-screen flex flex-col bg-transparent isolate">
      {!isStoryPage && <ParallaxBackground />}
      {children}
      <ChatWidget />
    </div>
  );
}
