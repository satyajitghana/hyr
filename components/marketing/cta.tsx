"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { EtherealShadows } from "@/components/ui/ethereal-shadows";
import { BlurFade } from "@/components/ui/blur-fade";

export function CTA() {
  return (
    <section className="relative overflow-hidden px-4 py-24 md:py-32">
      {/* Ethereal shadow blobs */}
      <EtherealShadows
        colors={{
          primary: "oklch(0.511 0.262 276.966)",
          secondary: "oklch(0.623 0.180 300)",
          accent: "oklch(0.55 0.20 260)",
        }}
        blur={100}
        opacity={0.3}
        speed={0.6}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-background/80 to-background" />

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
