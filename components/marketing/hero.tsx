"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { FlipWords } from "@/components/ui/flip-words";
import { Spotlight } from "@/components/ui/spotlight";
import { DotPattern } from "@/components/ui/dot-pattern";
import { EtherealShadows } from "@/components/ui/ethereal-shadows";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { SparklesText } from "@/components/ui/sparkles-text";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

const COMPANIES = ["Google", "Meta", "Stripe", "OpenAI", "Apple", "Netflix"];

export function Hero() {
  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 pt-24 pb-16">
      {/* Layer 1: Dot pattern background */}
      <DotPattern
        width={24}
        height={24}
        cr={1}
        className="opacity-30 dark:opacity-20 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_70%)]"
      />

      {/* Layer 2: Ethereal shadow blobs */}
      <EtherealShadows
        blur={140}
        opacity={0.4}
        speed={0.8}
      />

      {/* Layer 3: Spotlight effects */}
      <Spotlight className="absolute -top-40 left-0 md:-top-20 md:left-60" />

      {/* Layer 4: Radial gradient overlay */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background/80 to-background" />

      {/* Content */}
      <div className="relative z-20 mx-auto max-w-5xl text-center">
        <BlurFade delay={0.1} inView>
          <AnimatedGradientText className="mb-8 inline-flex">
            <Sparkles className="mr-2 h-4 w-4" />
            AI-Powered Resume Optimization
          </AnimatedGradientText>
        </BlurFade>

        <BlurFade delay={0.2} inView>
          <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Get{" "}
            <SparklesText
              className="inline text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
              colors={{ first: "#7c3aed", second: "#a78bfa" }}
            >
              Hyr
            </SparklesText>
            -ed at
            <br />
            <FlipWords
              words={COMPANIES}
              duration={2500}
              className="text-primary"
            />
          </h1>
        </BlurFade>

        <BlurFade delay={0.3} inView>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
            Upload your resume, paste any job description, and let AI tailor your
            resume perfectly. Beat ATS systems. Auto-apply to dream jobs.
          </p>
        </BlurFade>

        <BlurFade delay={0.4} inView>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/app">
              <ShimmerButton className="h-12 px-8 text-base font-semibold">
                <span className="flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </span>
              </ShimmerButton>
            </Link>
            <Link href="#how-it-works">
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-full px-8 backdrop-blur-sm"
              >
                See How It Works
              </Button>
            </Link>
          </div>
        </BlurFade>

        <BlurFade delay={0.6} inView>
          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              10,000+ resumes optimized
            </div>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <div className="hidden items-center gap-2 sm:flex">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              95% ATS pass rate
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
