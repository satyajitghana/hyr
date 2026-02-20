"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wand2,
  ArrowRight,
  CheckCircle2,
  Loader2,
  FileText,
  Sparkles,
  Link2,
  MessageSquare,
  Send,
  ArrowLeft,
  CheckCheck,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResumeStore } from "@/lib/store/resume-store";
import { Resume } from "@/lib/resume/types";
import {
  tailoredResumeSchema,
  type TailoredResumeOutput,
  type TailoredChangeOutput,
} from "@/lib/ai/schemas";
import { StreamingChanges } from "@/components/ai/streaming-changes";
import { HyperText } from "@/components/ui/hyper-text";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";

type Step = "input" | "processing" | "result";

const aiSuggestions = [
  { label: "More concise", prompt: "Make it more concise" },
  { label: "Add metrics", prompt: "Add more metrics" },
  { label: "Emphasize leadership", prompt: "Emphasize leadership" },
  { label: "Less jargon", prompt: "Tone down technical jargon" },
];

const sectionLabels: Record<string, string> = {
  summary: "Summary",
  experience: "Experience",
  skills: "Skills",
  education: "Education",
  certifications: "Certifications",
};

const sectionOrder = ["summary", "experience", "skills", "education", "certifications"];

export default function TailorPage() {
  const router = useRouter();
  const { resumes, addResume } = useResumeStore();
  const [selectedId, setSelectedId] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [inputTab, setInputTab] = useState("description");
  const [step, setStep] = useState<Step>("input");
  const [result, setResult] = useState<TailoredResumeOutput | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [extractionDone, setExtractionDone] = useState(false);

  const selectedResume = resumes.find((r) => r.id === selectedId);

  // AI SDK streaming hook for tailoring
  const {
    object: streamingObject,
    submit: submitTailor,
    isLoading: isTailoring,
  } = useObject({
    api: "/api/ai/tailor",
    schema: tailoredResumeSchema,
    onFinish({ object }) {
      if (object) {
        setResult(object);
        setStep("result");
      }
    },
  });

  const handleFetchUrl = async () => {
    if (!jobUrl.trim()) return;
    setFetchingUrl(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl.trim() }),
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const { markdown } = await res.json();
      setJobDescription(markdown);
      setInputTab("description");
    } catch {
      toast.error("Could not fetch job description from that URL. Try pasting it manually.");
    } finally {
      setFetchingUrl(false);
    }
  };

  const handleTailor = async () => {
    const resume = resumes.find((r) => r.id === selectedId);
    if (!resume || !jobDescription.trim()) return;

    setStep("processing");
    setResult(null);
    setExtractionDone(false);

    // First extract job details
    const detailsRes = await fetch("/api/ai/extract-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: jobDescription }),
    });
    const { output: details } = await detailsRes.json();
    setExtractionDone(true);

    // Then stream the tailoring via AI SDK
    submitTailor({
      resume,
      jobDescription,
      jobTitle: details?.title ?? "Software Engineer",
      company: details?.company ?? "Company",
    });
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

  const toggleSection = (section: string) => {
    if (!result) return;
    const sectionChanges = result.changes.filter((c) => c.section === section);
    const allAccepted = sectionChanges.every((c) => c.accepted);
    setResult({
      ...result,
      changes: result.changes.map((c) =>
        c.section === section ? { ...c, accepted: !allAccepted } : c
      ),
    });
  };

  const toggleAll = (accept: boolean) => {
    if (!result) return;
    setResult({
      ...result,
      changes: result.changes.map((c) => ({ ...c, accepted: accept })),
    });
  };

  const handleRefine = async (prompt: string) => {
    if (!result || isRefining) return;
    setIsRefining(true);

    const res = await fetch("/api/ai/refine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, currentChanges: result.changes }),
    });
    const { output: refined } = await res.json();

    if (refined) {
      setResult({ ...result, changes: refined });
    }
    setIsRefining(false);
    setAiPrompt("");
  };

  const handleAcceptAndSave = () => {
    if (!result || !selectedResume) return;

    const acceptedChanges = result.changes.filter((c) => c.accepted);

    const newSkills = [...selectedResume.skills];
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
      id: crypto.randomUUID(),
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

  // During streaming, show the partial data
  const displayChanges: TailoredChangeOutput[] | undefined =
    step === "processing"
      ? (streamingObject?.changes as TailoredChangeOutput[] | undefined)
      : result?.changes;
  const displayScore =
    step === "processing"
      ? streamingObject?.matchScore
      : result?.matchScore;
  const displayJobTitle =
    step === "processing"
      ? streamingObject?.jobTitle
      : result?.jobTitle;
  const displayCompany =
    step === "processing"
      ? streamingObject?.company
      : result?.company;

  // Group changes by section for the result step
  const groupedChanges = useMemo(() => {
    if (!result?.changes) return [];
    const groups: { section: string; label: string; changes: TailoredChangeOutput[] }[] = [];
    const changesBySection = new Map<string, TailoredChangeOutput[]>();

    for (const change of result.changes) {
      const existing = changesBySection.get(change.section);
      if (existing) {
        existing.push(change);
      } else {
        changesBySection.set(change.section, [change]);
      }
    }

    // Sort by predefined order
    for (const section of sectionOrder) {
      const changes = changesBySection.get(section);
      if (changes) {
        groups.push({
          section,
          label: sectionLabels[section] ?? section,
          changes,
        });
        changesBySection.delete(section);
      }
    }

    // Any remaining sections
    for (const [section, changes] of changesBySection) {
      groups.push({
        section,
        label: sectionLabels[section] ?? section,
        changes,
      });
    }

    return groups;
  }, [result]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={Wand2}
        title="Tailor Resume"
        subtitle="AI-powered resume optimization for any job description."
        gradient="from-violet-600 to-purple-400"
        shadow="shadow-violet-500/25"
      />

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

        {/* ─── PROCESSING STEP (streaming) ─── */}
        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-5"
          >
            {/* Pipeline stages */}
            <Card className="border-violet-500/20">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-400 shadow-lg shadow-violet-500/25">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-lg font-bold">
                      {displayScore ? (
                        "Tailoring Complete"
                      ) : (
                        <HyperText className="font-display text-lg font-bold" animateOnHover={false}>Tailoring Your Resume...</HyperText>
                      )}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {displayJobTitle && displayCompany
                        ? (
                          <>
                            Optimizing for{" "}
                            <span className="font-medium text-foreground">
                              {displayJobTitle}
                            </span>{" "}
                            at{" "}
                            <span className="font-medium text-foreground">
                              {displayCompany}
                            </span>
                          </>
                        )
                        : "AI is analyzing the job and optimizing your resume"}
                    </p>
                  </div>
                  {displayScore && (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 shadow-lg shadow-green-500/25">
                      <span className="font-display text-xl font-bold text-white">
                        {displayScore}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stage indicators */}
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    {extractionDone ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <span className="relative flex h-4 w-4 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-50" />
                        <span className="relative inline-flex h-4 w-4 rounded-full bg-violet-500" />
                      </span>
                    )}
                    <span className={extractionDone ? "text-green-600 dark:text-green-400" : "text-violet-600 dark:text-violet-400"}>
                      Extract job details
                    </span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground rotate-[-90deg]" />
                  <div className="flex items-center gap-2">
                    {displayChanges && displayChanges.length > 0 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : extractionDone ? (
                      <span className="relative flex h-4 w-4 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-50" />
                        <span className="relative inline-flex h-4 w-4 rounded-full bg-violet-500" />
                      </span>
                    ) : (
                      <span className="relative flex h-4 w-4 shrink-0">
                        <span className="relative inline-flex h-4 w-4 rounded-full bg-muted-foreground/20" />
                      </span>
                    )}
                    <span className={
                      displayChanges && displayChanges.length > 0
                        ? "text-green-600 dark:text-green-400"
                        : extractionDone
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-muted-foreground/40"
                    }>
                      Analyze resume
                    </span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground rotate-[-90deg]" />
                  <div className="flex items-center gap-2">
                    {displayScore ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : displayChanges && displayChanges.length > 0 ? (
                      <span className="relative flex h-4 w-4 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-50" />
                        <span className="relative inline-flex h-4 w-4 rounded-full bg-violet-500" />
                      </span>
                    ) : (
                      <span className="relative flex h-4 w-4 shrink-0">
                        <span className="relative inline-flex h-4 w-4 rounded-full bg-muted-foreground/20" />
                      </span>
                    )}
                    <span className={
                      displayScore
                        ? "text-green-600 dark:text-green-400"
                        : displayChanges && displayChanges.length > 0
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-muted-foreground/40"
                    }>
                      Generate changes
                    </span>
                    {displayChanges && displayChanges.length > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {displayChanges.length}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Streaming changes */}
            <StreamingChanges
              changes={displayChanges}
              isStreaming={isTailoring}
            />
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
            <Card className="border-green-500/20">
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
                      onClick={() => toggleAll(true)}
                      className="gap-1.5"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Accept All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAll(false)}
                      className="gap-1.5"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject All
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

            {/* Grouped Changes */}
            <div className="space-y-4">
              {groupedChanges.map((group) => {
                const groupAccepted = group.changes.filter((c) => c.accepted).length;
                const allAccepted = groupAccepted === group.changes.length;
                return (
                  <div key={group.section} className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-sm font-semibold capitalize">
                          {group.label}
                        </h3>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {groupAccepted}/{group.changes.length}
                        </Badge>
                      </div>
                      <button
                        onClick={() => toggleSection(group.section)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                      >
                        {allAccepted ? (
                          <>
                            <XCircle className="h-3 w-3" />
                            Reject section
                          </>
                        ) : (
                          <>
                            <CheckCheck className="h-3 w-3" />
                            Accept section
                          </>
                        )}
                      </button>
                    </div>
                    <StreamingChanges
                      changes={group.changes}
                      onToggle={toggleChange}
                    />
                  </div>
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
