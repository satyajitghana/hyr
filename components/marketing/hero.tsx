"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { FlipWords } from "@/components/ui/flip-words";
import { Spotlight } from "@/components/ui/spotlight";
import { Button } from "@/components/ui/button";

const COMPANIES = ["Google", "Meta", "Stripe", "OpenAI", "Apple", "Netflix"];

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-24">
      <Spotlight className="absolute -top-40 left-0 md:-top-20 md:left-60" />

      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgxMDAsMTAwLDEwMCwwLjA4KSIvPjwvc3ZnPg==')] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_80%)]" />
      </div>

      <div className="mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
        >
          <Sparkles className="h-4 w-4" />
          AI-Powered Resume Optimization
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Get{" "}
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            Hyr
          </span>
          -ed at
          <br />
          <FlipWords
            words={COMPANIES}
            duration={2500}
            className="text-primary"
          />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          Upload your resume, paste any job description, and let AI tailor your
          resume perfectly. Beat ATS systems. Auto-apply to dream jobs.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
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
              className="h-12 rounded-full px-8"
            >
              See How It Works
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-16 text-sm text-muted-foreground"
        >
          Trusted by 10,000+ job seekers worldwide
        </motion.div>
      </div>
    </section>
  );
}
