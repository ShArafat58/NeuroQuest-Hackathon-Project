"use client";

import React, { useEffect, useRef, useState } from "react";

interface BlobConfig {
  id: string;
  color: string;
  depth: number;
  initialX: string;
  initialY: string;
  size: string;
}

export default function ParallaxBackground() {
  return (
    <div
      className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{
        background: "linear-gradient(135deg, #112D60 0%, #DD83E0 100%)",
        minHeight: "100vh", // Ensure it covers the full viewport height
        height: "100%", // Ensure it covers the full scroll height
      }}
    ></div>
  );
}
