import React from "react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-white py-6 dark:bg-slate-950">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
        <p className="text-center md:text-left">
          <strong>NeuroQuest</strong> &copy; {new Date().getFullYear()} &mdash; All Rights Reserved.
        </p>
        <p className="mt-2 md:mt-0 text-center md:text-right font-medium">
          Team Hackers &bull; Infinity AI BuildFest 2026 &bull; BRAC University
        </p>
      </div>
    </footer>
  );
}
