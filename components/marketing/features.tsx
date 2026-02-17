"use client";

import Link from "next/link";
import {
  FileText,
  Shield,
  Wand2,
  BarChart3,
  Send,
  Zap,
} from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { DotPattern } from "@/components/ui/dot-pattern";
import { BorderBeam } from "@/components/ui/border-beam";
import { BlurFade } from "@/components/ui/blur-fade";

const features = [
  {
    icon: Wand2,
    title: "Resume Tailoring",
    description:
      "AI rewrites your resume for every job description. Match keywords, tone, and requirements automatically.",
    href: "/app/tailor",
    gradient: "from-violet-500/20 to-purple-500/5",
    iconColor: "text-violet-500",
    highlight: true,
  },
  {
    icon: Shield,
    title: "ATS Optimizer",
    description:
      "Beat the bots. Get a detailed ATS compatibility score and actionable fixes to pass every screening.",
    href: "/app/resume",
    gradient: "from-emerald-500/20 to-green-500/5",
    iconColor: "text-emerald-500",
  },
  {
    icon: Send,
    title: "Auto Apply",
    description:
      "Set your preferences and let Hyr automatically apply to matching jobs while you sleep.",
    href: "/app/jobs",
    gradient: "from-amber-500/20 to-orange-500/5",
    iconColor: "text-amber-500",
  },
  {
    icon: BarChart3,
    title: "Application Tracker",
    description:
      "Track every application from submitted to offer. Kanban-style board keeps you organized.",
    href: "/app/applications",
    gradient: "from-blue-500/20 to-cyan-500/5",
    iconColor: "text-blue-500",
  },
  {
    icon: FileText,
    title: "Smart Resume Builder",
    description:
      "Upload any PDF and we'll parse it into a structured, editable format. Edit inline and export clean PDFs.",
    href: "/app/resume",
    gradient: "from-pink-500/20 to-rose-500/5",
    iconColor: "text-pink-500",
  },
  {
    icon: Zap,
    title: "Instant Optimization",
    description:
      "One-click optimizations powered by AI. Fix formatting, add keywords, and improve readability in seconds.",
    href: "/app/resume",
    gradient: "from-yellow-500/20 to-amber-500/5",
    iconColor: "text-yellow-500",
  },
];

export function Features() {
  return (
    <section id="features" className="relative px-4 py-24 md:py-32 overflow-hidden">
      {/* Subtle dot pattern background */}
      <DotPattern
        width={32}
        height={32}
        cr={0.8}
        className="opacity-20 dark:opacity-10 [mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_70%)]"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <BlurFade inView>
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              Features
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Everything you need to
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                land your dream job
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              From resume optimization to automated applications, Hyr handles
              the entire job search process.
            </p>
          </div>
        </BlurFade>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <BlurFade key={feature.title} delay={0.1 + idx * 0.05} inView>
              <Link href={feature.href} className="block h-full">
                <MagicCard
                  className="group relative h-full cursor-pointer overflow-hidden border-border/50"
                  gradientColor="oklch(0.511 0.262 276.966 / 0.07)"
                >
                  {feature.highlight && (
                    <BorderBeam duration={8} size={150} />
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                  <div className="relative p-6">
                    <div
                      className={`mb-4 inline-flex rounded-xl bg-background p-3 shadow-sm ring-1 ring-border/50 ${feature.iconColor}`}
                    >
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </MagicCard>
              </Link>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
