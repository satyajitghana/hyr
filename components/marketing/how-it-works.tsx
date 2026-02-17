"use client";

import { FileSearch, Sparkles } from "lucide-react";
import { UploadIcon } from "@/components/ui/upload";
import { DownloadIcon } from "@/components/ui/download";
import { GridPattern } from "@/components/ui/grid-pattern";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";

const steps = [
  {
    icon: "upload" as const,
    title: "Upload Your Resume",
    description:
      "Drag and drop your PDF resume. Our AI parses it into a structured format you can edit anytime.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    icon: "file-search" as const,
    title: "Paste the Job Description",
    description:
      "Copy and paste the job listing you're applying for. Our AI analyzes requirements, keywords, and culture.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  {
    icon: "sparkles" as const,
    title: "AI Tailors Your Resume",
    description:
      "Watch as AI rewrites sections, adds keywords, and optimizes formatting. Review every change before saving.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
  {
    icon: "download" as const,
    title: "Download & Apply",
    description:
      "Export your tailored resume as a clean PDF. Or let Hyr auto-apply to matching jobs for you.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
];

function StepIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "upload":
      return <UploadIcon size={24} className={className} />;
    case "download":
      return <DownloadIcon size={24} className={className} />;
    case "file-search":
      return <FileSearch className={`h-6 w-6 ${className}`} />;
    case "sparkles":
      return <Sparkles className={`h-6 w-6 ${className}`} />;
    default:
      return null;
  }
}

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden px-4 py-24 md:py-32"
    >
      {/* Grid pattern background */}
      <GridPattern
        width={48}
        height={48}
        strokeDasharray="4 4"
        className="opacity-30 dark:opacity-15 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_80%)]"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-transparent to-muted/50" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <BlurFade inView>
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              How It Works
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Four steps to your
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                perfect resume
              </span>
            </h2>
          </div>
        </BlurFade>

        <div className="grid gap-6 sm:grid-cols-2">
          {steps.map((step, idx) => (
            <BlurFade
              key={step.title}
              delay={0.1 + idx * 0.1}
              inView
            >
              <div
                className={`group relative overflow-hidden rounded-lg border ${step.borderColor} bg-card/50 p-6 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-primary/5`}
              >
                {idx === 2 && <BorderBeam duration={6} size={100} />}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-pixel text-xs font-bold text-muted-foreground">
                      0{idx + 1}
                    </span>
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${step.bgColor} ${step.color} transition-transform group-hover:scale-110`}
                    >
                      <StepIcon type={step.icon} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
