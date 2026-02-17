"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Wand2,
  ArrowRight,
  CheckCircle2,
  X,
  Loader2,
  FileText,
  Sparkles,
  Link2,
  MessageSquare,
  Send,
  RotateCcw,
  ArrowLeft,
  Target,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useResumeStore } from "@/lib/store/resume-store";
import { TailoredResume, TailoredChange, Resume } from "@/lib/resume/types";
import { MockAIProvider } from "@/lib/ai/mock-provider";

type Step = "input" | "processing" | "result";

const processingSteps = [
  { label: "Analyzing job requirements", icon: Target },
  { label: "Extracting key skills & keywords", icon: Sparkles },
  { label: "Matching resume to job description", icon: FileText },
  { label: "Rewriting summary section", icon: Wand2 },
  { label: "Optimizing experience bullets", icon: CheckCircle2 },
  { label: "Adding relevant skills", icon: Check },
  { label: "Finalizing tailored resume", icon: Target },
];

const aiSuggestions = [
  { label: "More concise", prompt: "Make it more concise" },
  { label: "Add metrics", prompt: "Add more metrics" },
  { label: "Emphasize leadership", prompt: "Emphasize leadership" },
  { label: "Less jargon", prompt: "Tone down technical jargon" },
];

export default function TailorPage() {
  const router = useRouter();
  const { resumes, addResume } = useResumeStore();
  const [selectedId, setSelectedId] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [inputTab, setInputTab] = useState("description");
  const [step, setStep] = useState<Step>("input");
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState<TailoredResume | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);

  const selectedResume = resumes.find((r) => r.id === selectedId);
  const progressPercent = Math.round(
    ((processingStep + 1) / processingSteps.length) * 100
  );

  const handleFetchUrl = async () => {
    if (!jobUrl.trim()) return;
    setFetchingUrl(true);
    await new Promise((r) => setTimeout(r, 1200));
    setJobDescription(
      `Senior Software Engineer\nTech Company\n\nWe are looking for an experienced engineer to join our team. You will work on building scalable web applications using React, TypeScript, and Node.js. Experience with cloud services (AWS/GCP), CI/CD pipelines, and agile methodologies is required.\n\nRequirements:\n- 5+ years of software engineering experience\n- Strong proficiency in React, TypeScript, and Node.js\n- Experience with cloud infrastructure and DevOps\n- Excellent communication and collaboration skills`
    );
    setFetchingUrl(false);
    setInputTab("description");
  };

  const handleTailor = async () => {
    const resume = resumes.find((r) => r.id === selectedId);
    if (!resume || !jobDescription.trim()) return;

    setStep("processing");
    setProcessingStep(0);

    // Realistic pacing: ~700ms per step
    for (let i = 0; i < processingSteps.length; i++) {
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 300));
      setProcessingStep(i);
    }

    const provider = new MockAIProvider();
    const details = await provider.extractJobDetails(jobDescription);
    const tailored = await provider.tailorResume(
      resume,
      jobDescription,
      details.title,
      details.company
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

  const handleRefine = async (prompt: string) => {
    if (!result || isRefining) return;
    setIsRefining(true);
    const provider = new MockAIProvider();
    const refined = await provider.refineChanges(prompt, result.changes);
    setResult({ ...result, changes: refined });
    setIsRefining(false);
    setAiPrompt("");
  };

  const handleAcceptAndSave = () => {
    if (!result || !selectedResume) return;

    // Apply accepted changes to build the new resume
    const acceptedChanges = result.changes.filter((c) => c.accepted);

    // Start with the tailored resume from AI, then apply acceptance decisions
    let newSkills = [...selectedResume.skills];
    let newSummary = selectedResume.summary;
    const newExperience = selectedResume.experience.map((exp) => ({
      ...exp,
      bullets: [...exp.bullets],
    }));

    for (const change of acceptedChanges) {
      if (change.section === "summary" && change.type === "modification") {
        newSummary = change.tailored;
      }
      if (change.section === "skills" && change.type === "addition") {
        if (!newSkills.includes(change.tailored)) {
          newSkills.push(change.tailored);
        }
      }
      if (change.section === "experience" && change.type === "modification") {
        // Find the matching experience entry and update the bullet
        for (const exp of newExperience) {
          const bulletIdx = exp.bullets.findIndex(
            (b) => b === change.original
          );
          if (bulletIdx >= 0) {
            exp.bullets[bulletIdx] = change.tailored;
          }
        }
      }
      if (change.section === "experience" && change.type === "addition") {
        // Add as a bullet to the first experience entry
        if (newExperience.length > 0) {
          newExperience[0].bullets.push(change.tailored);
        }
      }
      if (change.section === "summary" && change.type === "addition") {
        newSummary = newSummary + " " + change.tailored;
      }
    }

    const newResume: Resume = {
      ...selectedResume,
      id: `resume-${Date.now()}`,
      name: `${selectedResume.name} — Tailored for ${result.jobTitle}`,
      summary: newSummary,
      skills: newSkills,
      experience: newExperience,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addResume(newResume);
    router.push(`/app/resume/${newResume.id}`);
  };

  const acceptedCount = result?.changes.filter((c) => c.accepted).length ?? 0;

  const changeTypeConfig: Record<
    TailoredChange["type"],
    { color: string; label: string; dot: string }
  > = {
    addition: {
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
      label: "Added",
      dot: "bg-green-500",
    },
    modification: {
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      label: "Modified",
      dot: "bg-amber-500",
    },
    removal: {
      color: "bg-red-500/10 text-red-600 dark:text-red-400",
      label: "Removed",
      dot: "bg-red-500",
    },
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-400 shadow-lg shadow-violet-500/25">
            <Wand2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Tailor Resume
            </h1>
            <p className="text-muted-foreground">
              AI-powered resume optimization for any job description.
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ─── INPUT STEP ─── */}
        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Resume Selector */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    1
                  </div>
                  <h3 className="font-display text-base font-semibold">
                    Select Resume
                  </h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {resumes.map((resume) => {
                    const isSelected = selectedId === resume.id;
                    return (
                      <button
                        key={resume.id}
                        className={`group relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-md ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                            : "border-border hover:border-primary/30"
                        }`}
                        onClick={() =>
                          setSelectedId(isSelected ? "" : resume.id)
                        }
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 shadow-md shadow-blue-500/20">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">
                            {resume.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {resume.contact.name}
                          </p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {resume.skills.length} skills
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              Updated{" "}
                              {new Date(resume.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute right-3 top-3">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {resumes.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No resumes yet. Upload one first.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Job Input */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    2
                  </div>
                  <h3 className="font-display text-base font-semibold">
                    Job Description
                  </h3>
                </div>
                <Tabs value={inputTab} onValueChange={setInputTab}>
                  <TabsList>
                    <TabsTrigger value="description">
                      Paste Description
                    </TabsTrigger>
                    <TabsTrigger value="url">Paste Job Link</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="mt-4">
                    <Textarea
                      placeholder="Paste the full job description here..."
                      rows={8}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="resize-none text-sm"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Tip: Include the full job listing for best results.
                    </p>
                  </TabsContent>
                  <TabsContent value="url" className="mt-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://jobs.company.com/role/12345"
                        value={jobUrl}
                        onChange={(e) => setJobUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleFetchUrl}
                        disabled={!jobUrl.trim() || fetchingUrl}
                        className="gap-2"
                      >
                        {fetchingUrl ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Link2 className="h-4 w-4" />
                        )}
                        Fetch
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      We&apos;ll extract the job description from the URL.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Tailor Button */}
            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={handleTailor}
                disabled={!selectedId || !jobDescription.trim()}
                className="gap-2 bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 shadow-lg shadow-violet-500/25 text-white border-0 h-12 px-8"
              >
                <Wand2 className="h-4 w-4" />
                Tailor My Resume
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ─── PROCESSING STEP ─── */}
        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <Card className="border-violet-500/20 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-400" />
              <CardContent className="py-16 px-6">
                <div className="mx-auto max-w-md space-y-8">
                  {/* Animated icon */}
                  <div className="flex justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-400 shadow-xl shadow-violet-500/30"
                    >
                      <Sparkles className="h-8 w-8 text-white" />
                    </motion.div>
                  </div>

                  {selectedResume && (
                    <p className="text-center text-sm text-muted-foreground">
                      Tailoring{" "}
                      <span className="font-semibold text-foreground">
                        {selectedResume.name}
                      </span>
                    </p>
                  )}

                  <Progress value={progressPercent} className="h-1.5" />

                  <div className="space-y-2">
                    {processingSteps.map((s, idx) => {
                      const isActive = idx === processingStep;
                      const isDone = idx < processingStep;
                      return (
                        <motion.div
                          key={s.label}
                          initial={{ opacity: 0.3 }}
                          animate={{ opacity: isDone || isActive ? 1 : 0.3 }}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                            isActive
                              ? "bg-violet-500/10"
                              : isDone
                                ? "bg-green-500/5"
                                : ""
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                          ) : isActive ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-violet-500" />
                          ) : (
                            <div className="h-4 w-4 shrink-0 rounded-full border-2 border-muted-foreground/20" />
                          )}
                          <span
                            className={`text-sm ${
                              isActive
                                ? "font-medium text-foreground"
                                : isDone
                                  ? "text-muted-foreground"
                                  : "text-muted-foreground/60"
                            }`}
                          >
                            {s.label}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── RESULT STEP ─── */}
        {step === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Score & Actions Header */}
            <Card className="overflow-hidden border-green-500/20">
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-400" />
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 shadow-lg shadow-green-500/25">
                      <span className="font-display text-xl font-bold text-white">
                        {result.matchScore}
                      </span>
                    </div>
                    <div>
                      <p className="font-display text-lg font-bold">
                        Match Score
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {acceptedCount} of {result.changes.length} changes
                        accepted &middot;{" "}
                        <span className="font-medium text-foreground">
                          {result.jobTitle}
                        </span>{" "}
                        at{" "}
                        <span className="font-medium text-foreground">
                          {result.company}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStep("input");
                        setResult(null);
                      }}
                      className="gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Start Over
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAcceptAndSave}
                      className="gap-1.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white border-0"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Accept & Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Changes */}
            <div className="space-y-3">
              <h3 className="font-display text-base font-semibold px-1">
                Proposed Changes
              </h3>
              {result.changes.map((change, idx) => {
                const config = changeTypeConfig[change.type];
                return (
                  <motion.div
                    key={change.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Card
                      className={`transition-all duration-200 ${
                        !change.accepted
                          ? "opacity-40 hover:opacity-70"
                          : "hover:shadow-md"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Accept/Reject toggle */}
                          <button
                            onClick={() => toggleChange(change.id)}
                            className="mt-0.5 shrink-0 transition-transform hover:scale-110"
                          >
                            {change.accepted ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-muted-foreground/30">
                                <X className="h-3 w-3 text-muted-foreground/50" />
                              </div>
                            )}
                          </button>

                          <div className="flex-1 min-w-0 space-y-2">
                            {/* Labels */}
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="text-[10px] capitalize font-normal"
                              >
                                {change.section}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <div
                                  className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                                />
                                <span
                                  className={`text-[10px] font-medium ${config.color}`}
                                >
                                  {config.label}
                                </span>
                              </div>
                              {change.field && (
                                <span className="text-[10px] text-muted-foreground truncate">
                                  {change.field}
                                </span>
                              )}
                            </div>

                            {/* Diff view */}
                            {change.original && (
                              <div className="rounded-lg bg-red-500/5 border border-red-500/10 px-3 py-2">
                                <p className="text-xs text-muted-foreground line-through leading-relaxed">
                                  {change.original}
                                </p>
                              </div>
                            )}
                            <div className="rounded-lg bg-green-500/5 border border-green-500/10 px-3 py-2">
                              <p className="text-xs leading-relaxed">
                                {change.tailored}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* AI Refinement */}
            <Card className="border-violet-500/20">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-400 shadow-sm">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-semibold">
                      Refine with AI
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Click a suggestion or type your own instruction
                    </p>
                  </div>
                </div>

                {/* Suggestion chips */}
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.prompt}
                      onClick={() => handleRefine(suggestion.prompt)}
                      disabled={isRefining}
                      className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 transition-all hover:bg-violet-500/10 hover:border-violet-500/30 hover:shadow-sm disabled:opacity-50"
                    >
                      <Sparkles className="h-3 w-3" />
                      {suggestion.label}
                    </button>
                  ))}
                </div>

                {/* Custom input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a custom instruction..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && aiPrompt.trim()) {
                        handleRefine(aiPrompt);
                      }
                    }}
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={() => handleRefine(aiPrompt)}
                    disabled={!aiPrompt.trim() || isRefining}
                    size="icon"
                    className="shrink-0"
                  >
                    {isRefining ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bottom CTA */}
            <div className="flex justify-between items-center pt-2 pb-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep("input");
                  setResult(null);
                }}
                className="gap-2 text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Start Over
              </Button>
              <Button
                size="lg"
                onClick={handleAcceptAndSave}
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 shadow-lg shadow-green-500/25 text-white border-0"
              >
                <CheckCircle2 className="h-4 w-4" />
                Accept & Save Resume
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
