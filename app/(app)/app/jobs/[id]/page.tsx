"use client";

import { use, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Building2,
  Clock,
  Briefcase,
  CheckCircle2,
  Gift,
  Send,
  Loader2,
  FileText,
  Mail,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  Copy,
  Pencil,
  User,
  AtSign,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MOCK_JOBS } from "@/lib/jobs/mock-data";
import { useJobStore } from "@/lib/store/job-store";
import { useResumeStore } from "@/lib/store/resume-store";
import type { EasyApplyEvent } from "@/lib/ai/schemas";

function formatSalary(n: number) {
  return `$${(n / 1000).toFixed(0)}K`;
}

type EasyApplyStep = "select-resume" | "customize" | "processing" | "review";

interface ProcessingStatus {
  tailoring: "pending" | "active" | "done";
  coverLetter: "pending" | "active" | "done";
  recruiterEmail: "pending" | "active" | "done";
}

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const job = MOCK_JOBS.find((j) => j.id === id);
  const { addApplication, applications } = useJobStore();
  const { resumes, addResume } = useResumeStore();
  const alreadyApplied = applications.some((a) => a.jobId === id);

  // Easy Apply state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [step, setStep] = useState<EasyApplyStep>("select-resume");
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [customInstructions, setCustomInstructions] = useState("");
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    tailoring: "pending",
    coverLetter: "pending",
    recruiterEmail: "pending",
  });
  const [coverLetter, setCoverLetter] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [tailoredChanges, setTailoredChanges] = useState<string[]>([]);
  const [showChanges, setShowChanges] = useState(false);
  const [editingCover, setEditingCover] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  const handleCopy = useCallback(
    async (text: string, field: string) => {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    },
    []
  );

  const resetSheet = useCallback(() => {
    setStep("select-resume");
    setSelectedResumeId(null);
    setCustomInstructions("");
    setProcessingStatus({
      tailoring: "pending",
      coverLetter: "pending",
      recruiterEmail: "pending",
    });
    setCoverLetter("");
    setEmailSubject("");
    setEmailBody("");
    setTailoredChanges([]);
    setShowChanges(false);
    setEditingCover(false);
    setEditingEmail(false);
  }, []);

  const handleStartProcessing = useCallback(async () => {
    if (!selectedResume || !job) return;
    setStep("processing");

    try {
      const res = await fetch("/api/ai/easy-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: selectedResume,
          job: {
            title: job.title,
            company: job.company,
            description: job.description,
            tags: job.tags,
            requirements: job.requirements,
          },
        }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data: EasyApplyEvent = JSON.parse(line.slice(6));

          switch (data.step) {
            case "extracting":
              setProcessingStatus((s) => ({ ...s, tailoring: "active" }));
              break;
            case "tailoring":
              setProcessingStatus((s) => ({ ...s, tailoring: "active" }));
              break;
            case "cover-letter":
              if (data.tailored) {
                setTailoredChanges(
                  data.tailored.changes.map(
                    (c) =>
                      `${c.section}: ${c.field} — ${c.type === "addition" ? "Added" : "Modified"}`
                  )
                );
              }
              setProcessingStatus((s) => ({
                ...s,
                tailoring: "done",
                coverLetter: "active",
              }));
              break;
            case "email":
              setCoverLetter(data.coverLetter);
              setProcessingStatus((s) => ({
                ...s,
                coverLetter: "done",
                recruiterEmail: "active",
              }));
              break;
            case "done":
              if (data.recruiterEmail) {
                setEmailSubject(data.recruiterEmail.subject);
                setEmailBody(data.recruiterEmail.body);
              }
              setProcessingStatus((s) => ({ ...s, recruiterEmail: "done" }));
              setTimeout(() => setStep("review"), 500);
              break;
            case "error":
              console.error("Easy Apply error:", data.error);
              break;
          }
        }
      }
    } catch (error) {
      console.error("Easy Apply failed:", error);
    }
  }, [selectedResume, job]);

  const handleApply = useCallback(() => {
    if (!selectedResume || !job) return;

    const newResumeId = `resume-tailored-${Date.now()}`;
    addResume({
      ...selectedResume,
      id: newResumeId,
      name: `${selectedResume.name} — Tailored for ${job.title}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    addApplication({
      id: `app-${Date.now()}`,
      jobId: job.id,
      job,
      resumeId: newResumeId,
      resumeName: `${selectedResume.name} — Tailored for ${job.title}`,
      status: "applied",
      appliedDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      autoApplied: false,
    });

    setSheetOpen(false);
    resetSheet();
    router.push("/app/applications");
  }, [selectedResume, job, addResume, addApplication, router, resetSheet]);

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-muted-foreground">Job not found.</p>
        <Button variant="link" onClick={() => router.push("/app/jobs")}>
          Back to Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/app/jobs")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Back to Jobs</span>
      </motion.div>

      {/* Job Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-500 dark:from-slate-600 dark:to-slate-400 font-display text-xl font-bold text-white shadow-lg">
                  {job.company[0]}
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold">
                    {job.title}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatSalary(job.salaryMin)} —{" "}
                      {formatSalary(job.salaryMax)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(job.postedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">
                      {job.type}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {job.level}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {job.category}
                    </Badge>
                    {job.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {alreadyApplied ? (
                  <Button disabled className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Applied
                  </Button>
                ) : (
                  <Button
                    className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white border-0 shadow-lg shadow-blue-500/25"
                    onClick={() => {
                      resetSheet();
                      setSheetOpen(true);
                    }}
                  >
                    <Send className="h-4 w-4" />
                    Easy Apply
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                About the Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {job.description}
              </p>
              <Separator className="my-6" />
              <h4 className="font-semibold mb-3">Requirements</h4>
              <ul className="space-y-2">
                {job.requirements.map((req, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                    {req}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.benefits.map((benefit, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Easy Apply Sheet ─── */}
      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) resetSheet();
        }}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-0">
            <SheetTitle className="font-display flex items-center gap-2 text-base">
              <Send className="h-4 w-4 text-primary" />
              Easy Apply
            </SheetTitle>
            <p className="text-xs text-muted-foreground truncate">{job.title} at {job.company}</p>
          </SheetHeader>

          <div className="mt-5 space-y-5">
            {/* Step indicator */}
            <div className="flex items-center text-xs">
              {(
                [
                  { key: "select-resume", label: "Resume" },
                  { key: "customize", label: "Customize" },
                  { key: "processing", label: "AI Magic" },
                  { key: "review", label: "Review" },
                ] as const
              ).map((s, idx) => {
                const steps: EasyApplyStep[] = [
                  "select-resume",
                  "customize",
                  "processing",
                  "review",
                ];
                const currentIdx = steps.indexOf(step);
                const isActive = step === s.key;
                const isDone = currentIdx > idx;
                return (
                  <div key={s.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/10"
                            : isDone
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isDone ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                      </div>
                      <span
                        className={`hidden sm:inline ${
                          isActive
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < 3 && (
                      <div
                        className={`mx-2 h-px flex-1 transition-colors ${isDone ? "bg-primary/40" : "bg-border"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <Separator />

            {/* Step 1: Select Resume */}
            {step === "select-resume" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Choose the resume for this application.
                </p>
                <div className="grid gap-3">
                  {resumes.map((resume) => (
                    <button
                      key={resume.id}
                      onClick={() => setSelectedResumeId(resume.id)}
                      className={`relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-md ${
                        selectedResumeId === resume.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 shadow-md shadow-blue-500/20">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm">{resume.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {resume.contact.name} &middot;{" "}
                          {resume.skills.length} skills
                        </p>
                      </div>
                      {selectedResumeId === resume.id && (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
                {resumes.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No resumes yet. Upload one first.
                  </p>
                )}
                <div className="flex justify-end">
                  <Button
                    onClick={() => setStep("customize")}
                    disabled={!selectedResumeId}
                  >
                    Next
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Customize */}
            {step === "customize" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Add optional instructions to guide the AI tailoring.
                </p>
                <Textarea
                  placeholder="E.g., Emphasize my leadership experience, or Mention relocating to NYC"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep("select-resume")}
                  >
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleStartProcessing()}
                    >
                      Skip
                    </Button>
                    <Button onClick={() => handleStartProcessing()}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Processing */}
            {step === "processing" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  AI is preparing your application materials...
                </p>
                <div className="space-y-3">
                  {[
                    {
                      key: "tailoring" as const,
                      label: "Tailoring resume",
                      icon: FileText,
                      gradient: "from-violet-500 to-purple-400",
                    },
                    {
                      key: "coverLetter" as const,
                      label: "Writing cover letter",
                      icon: Mail,
                      gradient: "from-blue-500 to-cyan-400",
                    },
                    {
                      key: "recruiterEmail" as const,
                      label: "Drafting recruiter email",
                      icon: Send,
                      gradient: "from-emerald-500 to-green-400",
                    },
                  ].map((item) => {
                    const status = processingStatus[item.key];
                    return (
                      <div
                        key={item.key}
                        className={`flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-300 ${
                          status === "active"
                            ? "border-primary/30 bg-primary/5 shadow-sm"
                            : status === "done"
                              ? "border-green-500/20 bg-green-500/5"
                              : "border-border"
                        }`}
                      >
                        {status === "active" ? (
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        ) : status === "done" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br ${item.gradient} opacity-30`}
                          >
                            <item.icon className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <span
                          className={`text-sm ${
                            status === "active"
                              ? "font-medium text-primary"
                              : status === "done"
                                ? "text-green-700 dark:text-green-400"
                                : "text-muted-foreground"
                          }`}
                        >
                          {item.label}
                          {status === "done" && " — Done"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {step === "review" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                {/* ── Resume Changes (collapsible) ── */}
                <div className="rounded-xl border overflow-hidden">
                  <button
                    onClick={() => setShowChanges(!showChanges)}
                    className="flex w-full items-center justify-between p-3.5 text-sm font-medium hover:bg-accent/50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-400">
                        <FileText className="h-3 w-3 text-white" />
                      </div>
                      Resume Changes
                      <Badge variant="secondary" className="text-[10px] px-1.5">
                        {tailoredChanges.length}
                      </Badge>
                    </span>
                    {showChanges ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <AnimatePresence>
                    {showChanges && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t bg-muted/30 px-3.5 py-3 space-y-1.5">
                          {tailoredChanges.map((change, i) => (
                            <p
                              key={i}
                              className="text-xs text-muted-foreground flex items-center gap-2"
                            >
                              <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                              {change}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Cover Letter (document UI) ── */}
                <div className="rounded-xl border overflow-hidden">
                  {/* Header bar */}
                  <div className="flex items-center justify-between bg-muted/50 border-b px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-400">
                        <Mail className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium">Cover Letter</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCopy(coverLetter, "cover")}
                      >
                        {copiedField === "cover" ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 ${editingCover ? "bg-primary/10 text-primary" : ""}`}
                        onClick={() => setEditingCover(!editingCover)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {/* Body */}
                  <div className="p-4">
                    {editingCover ? (
                      <Textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={12}
                        className="text-xs font-mono"
                      />
                    ) : (
                      <div className="space-y-3">
                        {coverLetter.split("\n\n").map((paragraph, i) => (
                          <p
                            key={i}
                            className="text-xs leading-relaxed text-foreground/80"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Recruiter Email (email client UI) ── */}
                <div className="rounded-xl border overflow-hidden shadow-sm">
                  {/* Email toolbar */}
                  <div className="flex items-center justify-between bg-muted/50 border-b px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-green-400">
                        <Send className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium">
                        Recruiter Email
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          handleCopy(`Subject: ${emailSubject}\n\n${emailBody}`, "email")
                        }
                      >
                        {copiedField === "email" ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 ${editingEmail ? "bg-primary/10 text-primary" : ""}`}
                        onClick={() => setEditingEmail(!editingEmail)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {editingEmail ? (
                    <div className="p-4 space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label>
                        <input
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          className="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Body</label>
                        <Textarea
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          rows={10}
                          className="text-xs font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Email metadata fields */}
                      <div className="border-b bg-background px-4 py-3 space-y-2">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-muted-foreground w-12 shrink-0 font-medium">
                            From
                          </span>
                          <div className="flex items-center gap-1.5 text-foreground">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                              <User className="h-3 w-3 text-primary" />
                            </div>
                            {selectedResume?.contact.name ?? "You"}{" "}
                            <span className="text-muted-foreground">
                              &lt;{selectedResume?.contact.email ?? "you@email.com"}&gt;
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-muted-foreground w-12 shrink-0 font-medium">
                            To
                          </span>
                          <div className="flex items-center gap-1.5 text-foreground">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                              <AtSign className="h-3 w-3 text-emerald-500" />
                            </div>
                            Recruiter{" "}
                            <span className="text-muted-foreground">
                              &lt;recruiting@{job.company.toLowerCase().replace(/\s+/g, "")}.com&gt;
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-muted-foreground w-12 shrink-0 font-medium">
                            Subject
                          </span>
                          <span className="font-medium text-foreground">
                            {emailSubject ||
                              `${job.title} Application`}
                          </span>
                        </div>
                        {/* Attachments */}
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-muted-foreground w-12 shrink-0 font-medium">
                            Attach
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-1">
                              <Paperclip className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                resume_tailored.pdf
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-1">
                              <Paperclip className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                cover_letter.pdf
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Email body */}
                      <div className="p-4">
                        <div className="space-y-3">
                          {emailBody
                            .split("\n\n")
                            .map((paragraph, i) => (
                              <p
                                key={i}
                                className="text-xs leading-relaxed text-foreground/80"
                              >
                                {paragraph.split("\n").map((line, j) => (
                                  <span key={j}>
                                    {line}
                                    {j <
                                      paragraph.split("\n").length - 1 && (
                                      <br />
                                    )}
                                  </span>
                                ))}
                              </p>
                            ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSheetOpen(false);
                      resetSheet();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApply}
                    className="gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white border-0 shadow-lg shadow-green-500/25"
                  >
                    <Send className="h-4 w-4" />
                    Apply Now
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
