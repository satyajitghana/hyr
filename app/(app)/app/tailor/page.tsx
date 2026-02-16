"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wand2,
  ArrowRight,
  CheckCircle2,
  X,
  Loader2,
  FileText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useResumeStore } from "@/lib/store/resume-store";
import { TailoredResume, TailoredChange } from "@/lib/resume/types";
import { MockAIProvider } from "@/lib/ai/mock-provider";

type Step = "input" | "processing" | "result";

const processingSteps = [
  "Analyzing job requirements...",
  "Matching keywords and skills...",
  "Rewriting resume sections...",
  "Finalizing tailored resume...",
];

export default function TailorPage() {
  const resumes = useResumeStore((s) => s.resumes);
  const [selectedId, setSelectedId] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState<TailoredResume | null>(null);

  const handleTailor = async () => {
    const resume = resumes.find((r) => r.id === selectedId);
    if (!resume || !jobDescription.trim()) return;

    setStep("processing");
    setProcessingStep(0);

    // Animate through processing steps
    for (let i = 0; i < processingSteps.length; i++) {
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStep(i);
    }

    const provider = new MockAIProvider();
    const tailored = await provider.tailorResume(
      resume,
      jobDescription,
      "Software Engineer",
      "Company"
    );

    setResult(tailored);
    setStep("result");
  };

  const toggleChange = (changeId: string) => {
    if (!result) return;
    setResult({
      ...result,
      changes: result.changes.map((c) =>
        c.id === changeId ? { ...c, accepted: !c.accepted } : c
      ),
    });
  };

  const changeTypeConfig: Record<
    TailoredChange["type"],
    { color: string; label: string }
  > = {
    addition: { color: "bg-green-500/10 text-green-600 dark:text-green-400", label: "Added" },
    modification: { color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", label: "Modified" },
    removal: { color: "bg-red-500/10 text-red-600 dark:text-red-400", label: "Removed" },
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Tailor Resume
        </h1>
        <p className="mt-1 text-muted-foreground">
          Customize your resume for a specific job description.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Select Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a resume..." />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name} — {r.contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste the full job description here..."
                  rows={10}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="resize-none"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Tip: Include the full job listing for best results.
                </p>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <ShimmerButton
                className="h-12 px-8"
                onClick={handleTailor}
                disabled={!selectedId || !jobDescription.trim()}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <Wand2 className="h-4 w-4" />
                  Tailor My Resume
                  <ArrowRight className="h-4 w-4" />
                </span>
              </ShimmerButton>
            </div>
          </motion.div>
        )}

        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="mb-6 h-12 w-12 animate-spin text-primary" />
            <div className="space-y-3 text-center">
              {processingSteps.map((s, idx) => (
                <motion.p
                  key={s}
                  initial={{ opacity: 0.3 }}
                  animate={{
                    opacity: idx <= processingStep ? 1 : 0.3,
                  }}
                  className={`text-sm ${
                    idx === processingStep
                      ? "font-semibold text-foreground"
                      : idx < processingStep
                      ? "text-muted-foreground line-through"
                      : "text-muted-foreground"
                  }`}
                >
                  {idx < processingStep && (
                    <CheckCircle2 className="mr-1 inline h-4 w-4 text-green-500" />
                  )}
                  {idx === processingStep && (
                    <Loader2 className="mr-1 inline h-4 w-4 animate-spin text-primary" />
                  )}
                  {s}
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}

        {step === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold">
                    Match Score:{" "}
                    <span className="text-primary font-display text-xl">
                      {result.matchScore}%
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {result.changes.length} changes suggested
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep("input");
                      setResult(null);
                    }}
                  >
                    Start Over
                  </Button>
                  <Button className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Accept & Save
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold">Changes</h3>
              {result.changes.map((change) => {
                const config = changeTypeConfig[change.type];
                return (
                  <Card
                    key={change.id}
                    className={`transition-all ${
                      !change.accepted ? "opacity-50" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {change.section}
                            </Badge>
                            <Badge className={`text-xs ${config.color}`}>
                              {config.label}
                            </Badge>
                          </div>
                          {change.original && (
                            <div className="rounded-lg bg-red-500/5 p-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Original
                              </p>
                              <p className="text-sm line-through opacity-70">
                                {change.original}
                              </p>
                            </div>
                          )}
                          <div className="rounded-lg bg-green-500/5 p-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Tailored
                            </p>
                            <p className="text-sm">{change.tailored}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleChange(change.id)}
                          className="shrink-0"
                        >
                          {change.accepted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
