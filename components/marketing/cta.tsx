"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { RetroGrid } from "@/components/ui/retro-grid";
import { BlurFade } from "@/components/ui/blur-fade";

export function CTA() {
  return (
    <section className="relative overflow-hidden px-4 py-24 md:py-32">
      {/* Retro grid background */}
      <RetroGrid
        angle={65}
        cellSize={50}
        opacity={0.25}
        lightLineColor="oklch(0.511 0.262 276.966 / 0.4)"
        darkLineColor="oklch(0.623 0.262 276.966 / 0.25)"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-background/80 to-background" />

      {/* Grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.04]">
        <svg className="h-full w-full">
          <filter id="cta-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.80"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#cta-grain)" />
        </svg>
      </div>

      <div className="relative z-10">
        <BlurFade inView>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Ready to land your
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                dream job?
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Join thousands of job seekers who&apos;ve already transformed their
              job search with Hyr. It only takes 30 seconds to get started.
            </p>
            <div className="mt-10">
              <Link href="/app">
                <ShimmerButton className="mx-auto h-14 px-10 text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    Start for Free
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </ShimmerButton>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. Free forever for basic features.
            </p>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
