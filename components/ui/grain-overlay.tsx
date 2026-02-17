"use client";

import { cn } from "@/lib/utils";

interface GrainOverlayProps {
  className?: string;
  opacity?: number;
}

export function GrainOverlay({ className, opacity = 0.03 }: GrainOverlayProps) {
  return (
    <div
      className={cn("pointer-events-none fixed inset-0 z-50", className)}
      style={{ opacity }}
    >
      <svg className="h-full w-full">
        <filter id="grain-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.80"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-filter)" />
      </svg>
    </div>
  );
}
