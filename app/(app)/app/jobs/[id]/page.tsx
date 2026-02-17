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
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  Check,
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
import { getAIProvider } from "@/lib/ai/provider";
import { Resume } from "@/lib/resume/types";

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
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [tailoredChanges, setTailoredChanges] = useState<string[]>([]);
  const [showChanges, setShowChanges] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

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
    setRecruiterEmail("");
    setTailoredChanges([]);
    setShowChanges(false);
    setShowCoverLetter(false);
    setShowEmail(false);
  }, []);

  const handleStartProcessing = useCallback(async () => {
    if (!selectedResume || !job) return;
    setStep("processing");

    const ai = getAIProvider();

    // Step 1: Tailor resume
    setProcessingStatus((s) => ({ ...s, tailoring: "active" }));
    const tailored = await ai.tailorResume(
      selectedResume,
      job.description,
      job.title,
      job.company
    );
    setTailoredChanges(
      tailored.changes.map(
        (c) => `${c.section}: ${c.field} — ${c.type === "addition" ? "Added" : "Modified"}`
      )
    );
    setProcessingStatus((s) => ({ ...s, tailoring: "done", coverLetter: "active" }));

    // Step 2: Cover letter
    const cl = await ai.generateCoverLetter(selectedResume, job);
    setCoverLetter(cl);
    setProcessingStatus((s) => ({
      ...s,
      coverLetter: "done",
      recruiterEmail: "active",
    }));

    // Step 3: Recruiter email
    const email = await ai.generateRecruiterEmail(selectedResume, job);
    setRecruiterEmail(email);
    setProcessingStatus((s) => ({ ...s, recruiterEmail: "done" }));

    // Move to review
    setTimeout(() => setStep("review"), 500);
  }, [selectedResume, job]);

  const handleApply = useCallback(() => {
    if (!selectedResume || !job) return;

    // Create tailored resume in store
    const newResumeId = `resume-tailored-${Date.now()}`;
    addResume({
      ...selectedResume,
      id: newResumeId,
      name: `${selectedResume.name} — Tailored for ${job.title}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create application
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
    <div className="mx-auto max-w-4xl space-y-6">
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-display text-2xl font-bold text-primary">
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
                      Posted {new Date(job.postedDate).toLocaleDateString()}
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
                    className="gap-2"
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

      {/* Easy Apply Sheet */}
      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) resetSheet();
        }}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Easy Apply — {job.title}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Step indicator */}
            <div className="flex items-center gap-2 text-xs">
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
                  <div key={s.key} className="flex items-center gap-2">
                    {idx > 0 && (
                      <div
                        className={`h-px w-6 ${isDone ? "bg-primary" : "bg-border"}`}
                      />
                    )}
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isDone
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isDone ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span
                      className={
                        isActive
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {s.label}
                    </span>
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
                  Select the resume to use for this application.
                </p>
                <div className="grid gap-3">
                  {resumes.map((resume) => (
                    <button
                      key={resume.id}
                      onClick={() => setSelectedResumeId(resume.id)}
                      className={`relative flex items-start gap-3 rounded-lg border p-4 text-left transition-all hover:border-primary/30 hover:bg-accent/50 ${
                        selectedResumeId === resume.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border"
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">{resume.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
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
                    },
                    {
                      key: "coverLetter" as const,
                      label: "Writing cover letter",
                      icon: Mail,
                    },
                    {
                      key: "recruiterEmail" as const,
                      label: "Drafting recruiter email",
                      icon: MessageSquare,
                    },
                  ].map((item) => {
                    const status = processingStatus[item.key];
                    return (
                      <div
                        key={item.key}
                        className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                          status === "active"
                            ? "border-primary/30 bg-primary/5"
                            : status === "done"
                              ? "border-green-500/20 bg-green-500/5"
                              : "border-border"
                        }`}
                      >
                        {status === "active" ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : status === "done" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <item.icon className="h-4 w-4 text-muted-foreground" />
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
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Review your application materials before applying.
                </p>

                {/* Tailored Changes */}
                <div className="rounded-lg border">
                  <button
                    onClick={() => setShowChanges(!showChanges)}
                    className="flex w-full items-center justify-between p-3 text-sm font-medium hover:bg-accent/50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Resume Changes ({tailoredChanges.length})
                    </span>
                    {showChanges ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
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
                        <div className="border-t px-3 py-2 space-y-1">
                          {tailoredChanges.map((change, i) => (
                            <p
                              key={i}
                              className="text-xs text-muted-foreground flex items-center gap-2"
                            >
                              <Check className="h-3 w-3 text-green-500 shrink-0" />
                              {change}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Cover Letter */}
                <div className="rounded-lg border">
                  <button
                    onClick={() => setShowCoverLetter(!showCoverLetter)}
                    className="flex w-full items-center justify-between p-3 text-sm font-medium hover:bg-accent/50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Cover Letter
                    </span>
                    {showCoverLetter ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  <AnimatePresence>
                    {showCoverLetter && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t p-3">
                          <Textarea
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            rows={10}
                            className="text-xs"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Recruiter Email */}
                <div className="rounded-lg border">
                  <button
                    onClick={() => setShowEmail(!showEmail)}
                    className="flex w-full items-center justify-between p-3 text-sm font-medium hover:bg-accent/50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Recruiter Email
                    </span>
                    {showEmail ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  <AnimatePresence>
                    {showEmail && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t p-3">
                          <Textarea
                            value={recruiterEmail}
                            onChange={(e) => setRecruiterEmail(e.target.value)}
                            rows={10}
                            className="text-xs"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

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
                  <Button onClick={handleApply} className="gap-2">
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
