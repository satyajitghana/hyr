"use client";

import { NumberTicker } from "@/components/ui/number-ticker";
import { Ripple } from "@/components/ui/ripple";
import { BlurFade } from "@/components/ui/blur-fade";

const stats = [
  { value: 10000, suffix: "+", label: "Resumes Optimized", color: "text-primary" },
  { value: 95, suffix: "%", label: "ATS Pass Rate", color: "text-emerald-500" },
  { value: 3, suffix: "x", label: "More Interviews", color: "text-amber-500" },
  { value: 50, suffix: "%", label: "Time Saved", color: "text-blue-500" },
];

export function Stats() {
  return (
    <section className="relative overflow-hidden px-4 py-24 md:py-32">
      {/* Ripple background effect */}
      <Ripple
        mainCircleSize={210}
        mainCircleOpacity={0.08}
        numCircles={6}
      />

      <div className="relative z-10 mx-auto max-w-5xl">
        <BlurFade inView>
          <h2 className="mb-16 text-center font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Numbers that speak
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              for themselves
            </span>
          </h2>
        </BlurFade>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, idx) => (
            <BlurFade key={stat.label} delay={0.1 + idx * 0.1} inView>
              <div className="group text-center">
                <div
                  className={`font-display text-4xl font-extrabold tracking-tight sm:text-5xl ${stat.color} transition-transform group-hover:scale-105`}
                >
                  <NumberTicker value={stat.value} />
                  {stat.suffix}
                </div>
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
