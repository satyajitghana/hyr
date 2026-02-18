"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Info,
  Zap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "@/lib/store/resume-store";
import { atsScoreSchema } from "@/lib/ai/schemas";

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    badge: "destructive" as const,
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    badge: "secondary" as const,
  },
  info: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    badge: "secondary" as const,
  },
};

const categoryLabels: Record<string, string> = {
  formatting: "Formatting",
  keywords: "Keywords",
  structure: "Structure",
  readability: "Readability",
};

export default function ATSOptimizePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const resume = useResumeStore((s) => s.resumes.find((r) => r.id === id));

  // AI SDK streaming hook for ATS scoring
  const {
    object: score,
    submit,
    isLoading,
  } = useObject({
    api: "/api/ai/score",
    schema: atsScoreSchema,
  });

  // Submit on mount when resume is available
  useEffect(() => {
    if (resume) {
      submit({ resume });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume?.id]);

  if (!resume) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-muted-foreground">Resume not found.</p>
        <Button variant="link" onClick={() => router.push("/app/resume")}>
          Back to Resumes
        </Button>
      </div>
    );
  }

  if (isLoading && !score?.overall) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">
          Analyzing your resume for ATS compatibility...
        </p>
      </div>
    );
  }

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-green-500";
    if (s >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const overall = score?.overall ?? 0;
  const formatting = score?.formatting ?? 0;
  const keywords = score?.keywords ?? 0;
  const structure = score?.structure ?? 0;
  const readability = score?.readability ?? 0;
  const suggestions = score?.suggestions ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/app/resume/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">ATS Optimizer</h1>
          <p className="text-sm text-muted-foreground">{resume.name}</p>
        </div>
      </motion.div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="flex flex-col items-center py-10">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg
                className="absolute inset-0 -rotate-90"
                viewBox="0 0 144 144"
              >
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/30"
                />
                <motion.circle
                  cx="72"
                  cy="72"
                  r="64"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className={getScoreColor(overall)}
                  strokeDasharray={`${2 * Math.PI * 64}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 64 }}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 64 * (1 - overall / 100),
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="text-center">
                <span
                  className={`font-display text-4xl font-extrabold ${getScoreColor(
                    overall
                  )}`}
                >
                  {overall}
                </span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </div>
            <p className="mt-4 font-display text-lg font-semibold">
              ATS Compatibility Score
            </p>
            <p className="text-sm text-muted-foreground">
              {overall >= 80
                ? "Great! Your resume is ATS-friendly."
                : overall >= 60
                  ? "Good, but there's room for improvement."
                  : "Needs work. Follow the suggestions below."}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Scores */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Category Scores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(
              [
                ["formatting", formatting],
                ["keywords", keywords],
                ["structure", structure],
                ["readability", readability],
              ] as const
            ).map(([cat, val]) => (
              <div key={cat} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{categoryLabels[cat]}</span>
                  <span
                    className={`font-mono font-semibold ${getScoreColor(val)}`}
                  >
                    {val}%
                  </span>
                </div>
                <Progress value={val} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-lg">
                Suggestions
              </CardTitle>
              <Badge variant="secondary" className="gap-1">
                <Zap className="h-3 w-3" />
                {suggestions.length} items
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions.map((sug) => {
                if (!sug) return null;
                const config =
                  severityConfig[
                    sug.severity as keyof typeof severityConfig
                  ] ?? severityConfig.info;
                return (
                  <motion.div
                    key={sug.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div
                      className={`flex items-start gap-3 rounded-lg p-3 ${config.bg}`}
                    >
                      <config.icon
                        className={`mt-0.5 h-5 w-5 shrink-0 ${config.color}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={config.badge} className="text-xs">
                            {sug.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {(sug.category && categoryLabels[sug.category]) ?? sug.category}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm">{sug.message}</p>
                        {sug.fix && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Fix: {sug.fix}
                          </p>
                        )}
                      </div>
                      {sug.fix && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0 gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Apply
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isLoading && suggestions.length > 0 && (
        <div className="flex items-center justify-center py-4 gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading more suggestions...
        </div>
      )}
    </div>
  );
}
