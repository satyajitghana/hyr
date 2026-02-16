"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export function CTA() {
  return (
    <section className="relative px-4 py-24 md:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Ready to land your
          <br />
          <span className="text-primary">dream job?</span>
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
      </motion.div>
    </section>
  );
}
