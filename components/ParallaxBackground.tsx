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

const BLOBS: BlobConfig[] = [
  {
    id: "purple",
    color: "radial-gradient(circle, rgba(109, 94, 245, 0.22) 0%, rgba(250, 249, 255, 0) 70%)",
    depth: 90,
    initialX: "10%",
    initialY: "15%",
    size: "450px",
  },
  {
    id: "blue",
    color: "radial-gradient(circle, rgba(91, 141, 239, 0.2) 0%, rgba(250, 249, 255, 0) 70%)",
    depth: 140,
    initialX: "55%",
    initialY: "50%",
    size: "500px",
  },
  {
    id: "teal",
    color: "radial-gradient(circle, rgba(29, 158, 117, 0.18) 0%, rgba(250, 249, 255, 0) 70%)",
    depth: 55,
    initialX: "15%",
    initialY: "75%",
    size: "400px",
  },
  {
    id: "coral",
    color: "radial-gradient(circle, rgba(226, 75, 74, 0.16) 0%, rgba(250, 249, 255, 0) 70%)",
    depth: 180,
    initialX: "70%",
    initialY: "10%",
    size: "350px",
  },
];

export default function ParallaxBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track mouse coordinates normalized from -0.5 to 0.5
  const mouseRef = useRef({ x: 0, y: 0 });
  const easedRef = useRef({ x: 0, y: 0 });
  const rAFRef = useRef<number | null>(null);

  const [disableMotion, setDisableMotion] = useState(false);

  useEffect(() => {
    // 1. Accessibility check for reduced motion
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleReducedMotionChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setDisableMotion(e.matches);
    };
    handleReducedMotionChange(reducedMotionQuery);
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    // 2. Touch screen detection
    const isTouchDevice = 
      "ontouchstart" in window || 
      navigator.maxTouchPoints > 0;

    if (reducedMotionQuery.matches || isTouchDevice) {
      setDisableMotion(true);
      return () => {
        reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);
      };
    }

    // 3. Mouse move tracking
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normalize mouse coordinates to range [-0.5, 0.5]
      mouseRef.current.x = e.clientX / innerWidth - 0.5;
      mouseRef.current.y = e.clientY / innerHeight - 0.5;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 4. Animation loop using requestAnimationFrame and Lerp
    const updateMotion = () => {
      const lerpFactor = 0.08;
      
      easedRef.current.x += (mouseRef.current.x - easedRef.current.x) * lerpFactor;
      easedRef.current.y += (mouseRef.current.y - easedRef.current.y) * lerpFactor;

      // Apply transforms directly via ref to avoid React state re-renders
      if (containerRef.current) {
        BLOBS.forEach((blob) => {
          const element = containerRef.current?.querySelector(
            `[data-blob-id="${blob.id}"]`
          ) as HTMLDivElement;
          
          if (element) {
            const tx = easedRef.current.x * blob.depth;
            const ty = easedRef.current.y * blob.depth;
            element.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
          }
        });
      }

      rAFRef.current = requestAnimationFrame(updateMotion);
    };

    rAFRef.current = requestAnimationFrame(updateMotion);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);
      if (rAFRef.current) {
        cancelAnimationFrame(rAFRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 -z-10 overflow-hidden pointer-events-none bg-[#FAF9FF]"
      style={{ minHeight: "100%" }}
    >
      {BLOBS.map((blob) => (
        <div
          key={blob.id}
          data-blob-id={blob.id}
          className="absolute rounded-full pointer-events-none transition-transform duration-100 ease-out"
          style={{
            top: blob.initialY,
            left: blob.initialX,
            width: blob.size,
            height: blob.size,
            backgroundImage: blob.color,
            transform: "translate3d(0px, 0px, 0px)",
            willChange: disableMotion ? "auto" : "transform",
          }}
        />
      ))}
    </div>
  );
}
