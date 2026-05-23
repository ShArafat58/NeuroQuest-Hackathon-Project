import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NeuroQuest | স্মৃতিযোদ্ধা — AI-Native Science Learning",
  description:
    "Defeat the cram-test-forget cycle. NeuroQuest is Bangladesh's first AI-native narrative learning platform for Class 9-10 (SSC) and HSC science students, mapped directly to the NCTB curriculum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body
        className={`${inter.className} min-h-full flex flex-col bg-background text-foreground antialiased`}
      >
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1 flex flex-col">{children}</div>
        </div>
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}