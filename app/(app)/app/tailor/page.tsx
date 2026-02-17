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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useResumeStore } from "@/lib/store/resume-store";
import { TailoredResume, TailoredChange, Resume } from "@/lib/resume/types";
import { MockAIProvider } from "@/lib/ai/mock-provider";

type Step = "input" | "processing" | "result";

const processingSteps = [
  "Analyzing job requirements...",
  "Extracting key skills and keywords...",
  "Matching resume to job description...",
  "Rewriting summary section...",
  "Optimizing experience bullets...",
  "Adding relevant skills...",
  "Finalizing tailored resume...",
];

const aiSuggestions = [
  "Make it more concise",
  "Add more metrics",
  "Emphasize leadership",
  "Tone down technical jargon",
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
  const progressPercent = Math.round(((processingStep + 1) / processingSteps.length) * 100);

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

    for (let i = 0; i < processingSteps.length; i++) {
      await new Promise((r) => setTimeout(r, 500));
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

    const acceptedChanges = result.changes.filter((c) => c.accepted);
    const newResume: Resume = {
      ...result.resume,
      id: `resume-${Date.now()}`,
      name: `${selectedResume.name} — Tailored for ${result.jobTitle}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addResume(newResume);
    router.push(`/app/resume/${newResume.id}`);
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
            {/* Resume Selector */}
            <div>
              <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Select Resume
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {resumes.map((resume) => {
                  const isSelected = selectedId === resume.id;
                  return (
                    <Card
                      key={resume.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/20"
                          : "hover:border-primary/20"
                      }`}
                      onClick={() => setSelectedId(isSelected ? "" : resume.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{resume.name}</p>
                              <p className="text-xs text-muted-foreground">{resume.contact.name}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {resume.skills.length} skills
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Updated {new Date(resume.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {resumes.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">
                  No resumes yet. Upload one first.
                </p>
              )}
            </div>

            {/* Job Input */}
            <div>
              <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Job Description
              </h3>
              <Tabs value={inputTab} onValueChange={setInputTab}>
                <TabsList>
                  <TabsTrigger value="description">Paste Description</TabsTrigger>
                  <TabsTrigger value="url">Paste Job Link</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-4">
                  <Textarea
                    placeholder="Paste the full job description here..."
                    rows={8}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="resize-none"
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
            </div>

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
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="w-full max-w-md space-y-6">
              <Progress value={progressPercent} className="h-2" />
              <div className="text-center">
                {selectedResume && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Tailoring <span className="font-medium text-foreground">{selectedResume.name}</span>
                  </p>
                )}
              </div>
              <div className="space-y-2.5">
                {processingSteps.map((s, idx) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0.3 }}
                    animate={{
                      opacity: idx <= processingStep ? 1 : 0.3,
                    }}
                    className={`flex items-center gap-2 text-sm ${
                      idx === processingStep
                        ? "font-semibold text-foreground"
                        : idx < processingStep
                        ? "text-muted-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {idx < processingStep ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                    ) : idx === processingStep ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                    ) : (
                      <div className="h-4 w-4 shrink-0 rounded-full border border-muted-foreground/30" />
                    )}
                    {s}
                  </motion.div>
                ))}
              </div>
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
                    {result.changes.filter((c) => c.accepted).length} of{" "}
                    {result.changes.length} changes accepted
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
                  <Button className="gap-2" onClick={handleAcceptAndSave}>
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

            {/* AI Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Ask AI to Refine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleRefine(suggestion)}
                      disabled={isRefining}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask AI to make changes..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && aiPrompt.trim()) {
                        handleRefine(aiPrompt);
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleRefine(aiPrompt)}
                    disabled={!aiPrompt.trim() || isRefining}
                    size="icon"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
