"use client";

import { motion } from "motion/react";
import { Upload, FileSearch, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Resume",
    description:
      "Drag and drop your PDF resume. Our AI parses it into a structured format you can edit anytime.",
  },
  {
    icon: FileSearch,
    title: "Paste the Job Description",
    description:
      "Copy and paste the job listing you're applying for. Our AI analyzes the requirements, keywords, and company culture.",
  },
  {
    icon: Download,
    title: "Get Your Tailored Resume",
    description:
      "Download a perfectly tailored resume that matches the job description. Review changes, accept or reject, and export as PDF.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/30 px-4 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            How It Works
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Three steps to your
            <br />
            <span className="text-primary">perfect resume</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent md:block" />

          <div className="grid gap-12 md:gap-16">
            {steps.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`flex flex-col items-center gap-6 md:flex-row ${
                  idx % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1 text-center md:text-left">
                  <div
                    className={`${
                      idx % 2 === 1 ? "md:text-right" : ""
                    }`}
                  >
                    <span className="mb-2 inline-block font-mono text-sm font-semibold text-primary">
                      Step {idx + 1}
                    </span>
                    <h3 className="font-display text-2xl font-bold">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border bg-background shadow-lg">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>

                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
