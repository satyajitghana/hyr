"use client";

import { motion } from "motion/react";
import { FileText, Shield, Zap, Wand2, BarChart3, Send } from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { BorderBeam } from "@/components/ui/border-beam";

const features = [
  {
    Icon: Wand2,
    name: "Resume Tailoring",
    description:
      "AI rewrites your resume for every job description. Match keywords, tone, and requirements automatically.",
    className: "md:col-span-2",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
    ),
    href: "/app/tailor",
    cta: "Start Tailoring",
  },
  {
    Icon: Shield,
    name: "ATS Optimizer",
    description:
      "Beat the bots. Get a detailed ATS compatibility score and actionable fixes to pass every screening.",
    className: "md:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
    ),
    href: "/app/resume",
    cta: "Optimize Resume",
  },
  {
    Icon: Send,
    name: "Auto Apply",
    description:
      "Set your preferences and let Hyr automatically apply to matching jobs while you sleep.",
    className: "md:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
    ),
    href: "/app/jobs",
    cta: "Browse Jobs",
  },
  {
    Icon: BarChart3,
    name: "Application Tracker",
    description:
      "Track every application from submitted to offer. Never lose track of where you stand.",
    className: "md:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
    ),
    href: "/app/applications",
    cta: "Track Applications",
  },
  {
    Icon: FileText,
    name: "Smart Resume Builder",
    description:
      "Upload any PDF resume and we'll parse it into a structured, editable format. Edit sections inline and export as a clean PDF.",
    className: "md:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
    ),
    href: "/app/resume",
    cta: "Upload Resume",
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Features
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Everything you need to
            <br />
            <span className="text-primary">land your dream job</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            From resume optimization to automated applications, Hyr handles the
            entire job search process.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <BentoGrid>
            {features.map((feature, idx) => (
              <div key={feature.name} className={`relative ${feature.className}`}>
                {idx === 0 && <BorderBeam duration={8} size={200} />}
                <BentoCard {...feature} />
              </div>
            ))}
          </BentoGrid>
        </motion.div>
      </div>
    </section>
  );
}
