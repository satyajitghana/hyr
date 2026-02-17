"use client";

import { cn } from "@/lib/utils";

interface EtherealShadowsProps {
  className?: string;
  /** Color palette for the blobs. Uses CSS color values. */
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  /** Intensity of the blur effect (higher = softer) */
  blur?: number;
  /** Overall opacity */
  opacity?: number;
  /** Animation speed multiplier (1 = default) */
  speed?: number;
}

export function EtherealShadows({
  className,
  colors,
  blur = 120,
  opacity = 0.35,
  speed = 1,
}: EtherealShadowsProps) {
  const primary = colors?.primary ?? "oklch(0.511 0.262 276.966)";
  const secondary = colors?.secondary ?? "oklch(0.623 0.180 300)";
  const accent = colors?.accent ?? "oklch(0.45 0.15 250)";

  const duration = 20 / speed;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      style={{ opacity }}
    >
      {/* Blob 1 — large, slow drift */}
      <div
        className="absolute rounded-full mix-blend-screen dark:mix-blend-screen"
        style={{
          width: "60%",
          height: "60%",
          top: "-10%",
          left: "-10%",
          background: `radial-gradient(circle at center, ${primary}, transparent 70%)`,
          filter: `blur(${blur}px)`,
          animation: `ethereal-drift-1 ${duration}s ease-in-out infinite`,
        }}
      />

      {/* Blob 2 — mid-size, counter-drift */}
      <div
        className="absolute rounded-full mix-blend-screen dark:mix-blend-screen"
        style={{
          width: "50%",
          height: "50%",
          bottom: "-5%",
          right: "-15%",
          background: `radial-gradient(circle at center, ${secondary}, transparent 70%)`,
          filter: `blur(${blur}px)`,
          animation: `ethereal-drift-2 ${duration * 1.3}s ease-in-out infinite`,
        }}
      />

      {/* Blob 3 — small, faster pulse */}
      <div
        className="absolute rounded-full mix-blend-screen dark:mix-blend-screen"
        style={{
          width: "40%",
          height: "40%",
          top: "30%",
          left: "25%",
          background: `radial-gradient(circle at center, ${accent}, transparent 70%)`,
          filter: `blur(${blur * 1.2}px)`,
          animation: `ethereal-drift-3 ${duration * 0.9}s ease-in-out infinite`,
        }}
      />

      {/* Blob 4 — subtle deep shadow */}
      <div
        className="absolute rounded-full mix-blend-multiply dark:mix-blend-screen"
        style={{
          width: "45%",
          height: "55%",
          top: "10%",
          right: "10%",
          background: `radial-gradient(ellipse at center, ${primary}80, transparent 65%)`,
          filter: `blur(${blur * 1.5}px)`,
          animation: `ethereal-drift-4 ${duration * 1.6}s ease-in-out infinite`,
        }}
      />

      <style jsx>{`
        @keyframes ethereal-drift-1 {
          0%, 100% {
            transform: translate(0%, 0%) scale(1) rotate(0deg);
          }
          25% {
            transform: translate(8%, 12%) scale(1.1) rotate(3deg);
          }
          50% {
            transform: translate(15%, 5%) scale(0.95) rotate(-2deg);
          }
          75% {
            transform: translate(5%, -8%) scale(1.05) rotate(1deg);
          }
        }
        @keyframes ethereal-drift-2 {
          0%, 100% {
            transform: translate(0%, 0%) scale(1) rotate(0deg);
          }
          25% {
            transform: translate(-12%, -8%) scale(1.08) rotate(-3deg);
          }
          50% {
            transform: translate(-5%, 10%) scale(0.92) rotate(4deg);
          }
          75% {
            transform: translate(8%, 5%) scale(1.12) rotate(-1deg);
          }
        }
        @keyframes ethereal-drift-3 {
          0%, 100% {
            transform: translate(0%, 0%) scale(1);
            opacity: 0.6;
          }
          33% {
            transform: translate(-15%, 10%) scale(1.15);
            opacity: 1;
          }
          66% {
            transform: translate(10%, -12%) scale(0.85);
            opacity: 0.5;
          }
        }
        @keyframes ethereal-drift-4 {
          0%, 100% {
            transform: translate(0%, 0%) scale(1) rotate(0deg);
          }
          30% {
            transform: translate(-10%, 8%) scale(1.1) rotate(5deg);
          }
          60% {
            transform: translate(5%, -10%) scale(0.9) rotate(-3deg);
          }
        }
      `}</style>
    </div>
  );
}
