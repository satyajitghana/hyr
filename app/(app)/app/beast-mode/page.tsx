"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap,
  FileText,
  CheckCircle2,
  Loader2,
  MapPin,
  DollarSign,
  Building2,
  Filter,
  ArrowRight,
  X,
  Trophy,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { MOCK_JOBS } from "@/lib/jobs/mock-data";
import { useResumeStore } from "@/lib/store/resume-store";
import { useJobStore } from "@/lib/store/job-store";
import { JobCategory } from "@/lib/jobs/types";
import type { EasyApplyEvent } from "@/lib/ai/schemas";

type BeastPhase = "configure" | "processing" | "done";

type JobStatus =
  | "queued"
  | "tailoring"
  | "cover-letter"
  | "applying"
  | "done"
  | "error";

interface JobProcessingState {
  jobId: string;
  status: JobStatus;
}

const categoryOptions: { value: "all" | JobCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "sales", label: "Sales" },
  { value: "product", label: "Product" },
  { value: "data", label: "Data" },
  { value: "operations", label: "Operations" },
];

const typeOptions = ["all", "remote", "hybrid", "onsite"] as const;
const levelOptions = ["all", "junior", "mid", "senior", "lead"] as const;

function formatSalary(n: number) {
  return `$${(n / 1000).toFixed(0)}K`;
}

export default function BeastModePage() {
  const router = useRouter();
  const resumes = useResumeStore((s) => s.resumes);
  const addResume = useResumeStore((s) => s.addResume);
  const { addApplication, applications } = useJobStore();

  const [phase, setPhase] = useState<BeastPhase>("configure");
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [customInstructions, setCustomInstructions] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());

  const [jobStates, setJobStates] = useState<JobProcessingState[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [startTimestamp, setStartTimestamp] = useState(0);

  // Live timer
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.round((Date.now() - startTimestamp) / 1000));
    }, 200);
    return () => clearInterval(interval);
  }, [timerRunning, startTimestamp]);

  const appliedJobIds = useMemo(
    () => new Set(applications.map((a) => a.jobId)),
    [applications]
  );

  const filteredJobs = useMemo(() => {
    return MOCK_JOBS.filter((job) => {
      if (appliedJobIds.has(job.id)) return false;
      const matchesCategory =
        categoryFilter === "all" || job.category === categoryFilter;
      const matchesType = typeFilter === "all" || job.type === typeFilter;
      const matchesLevel = levelFilter === "all" || job.level === levelFilter;
      return matchesCategory && matchesType && matchesLevel;
    });
  }, [categoryFilter, typeFilter, levelFilter, appliedJobIds]);

  const toggleJob = useCallback((jobId: string) => {
    setSelectedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedJobIds.size === filteredJobs.length) {
      setSelectedJobIds(new Set());
    } else {
      setSelectedJobIds(new Set(filteredJobs.map((j) => j.id)));
    }
  }, [filteredJobs, selectedJobIds.size]);

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  const handleLaunch = useCallback(async () => {
    if (!selectedResume || selectedJobIds.size === 0) return;

    const jobIds = Array.from(selectedJobIds);
    setJobStates(jobIds.map((id) => ({ jobId: id, status: "queued" })));
    setCompletedCount(0);
    setElapsedSeconds(0);
    setPhase("processing");
    const start = Date.now();
    setStartTimestamp(start);
    setTimerRunning(true);

    let done = 0;

    for (let i = 0; i < jobIds.length; i++) {
      const jobId = jobIds[i];
      const job = MOCK_JOBS.find((j) => j.id === jobId);
      if (!job) continue;

      try {
        // Call easy-apply SSE endpoint for each job
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
          const { done: streamDone, value } = await reader.read();
          if (streamDone) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data: EasyApplyEvent = JSON.parse(line.slice(6));

            switch (data.step) {
              case "extracting":
              case "tailoring":
                setJobStates((prev) =>
                  prev.map((s) =>
                    s.jobId === jobId ? { ...s, status: "tailoring" } : s
                  )
                );
                break;
              case "cover-letter":
                setJobStates((prev) =>
                  prev.map((s) =>
                    s.jobId === jobId ? { ...s, status: "cover-letter" } : s
                  )
                );
                break;
              case "email":
                setJobStates((prev) =>
                  prev.map((s) =>
                    s.jobId === jobId ? { ...s, status: "applying" } : s
                  )
                );
                break;
              case "done":
                // Create application in store
                const newResumeId = `resume-beast-${Date.now()}-${i}`;
                addResume({
                  ...selectedResume,
                  id: newResumeId,
                  name: `${selectedResume.name} — ${job.title}`,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });

                addApplication({
                  id: `app-beast-${Date.now()}-${i}`,
                  jobId: job.id,
                  job,
                  resumeId: newResumeId,
                  resumeName: `${selectedResume.name} — ${job.title}`,
                  status: "applied",
                  appliedDate: new Date().toISOString(),
                  lastUpdated: new Date().toISOString(),
                  autoApplied: true,
                });

                done++;
                setCompletedCount(done);
                setJobStates((prev) =>
                  prev.map((s) =>
                    s.jobId === jobId ? { ...s, status: "done" } : s
                  )
                );
                break;
              case "error":
                setJobStates((prev) =>
                  prev.map((s) =>
                    s.jobId === jobId ? { ...s, status: "error" } : s
                  )
                );
                break;
            }
          }
        }
      } catch {
        setJobStates((prev) =>
          prev.map((s) =>
            s.jobId === jobId ? { ...s, status: "error" } : s
          )
        );
      }
    }

    setTimerRunning(false);
    setElapsedSeconds(Math.round((Date.now() - start) / 1000));
    setPhase("done");
  }, [selectedResume, selectedJobIds, addResume, addApplication]);

  const progressPercent =
    jobStates.length > 0 ? (completedCount / jobStates.length) * 100 : 0;

  const statusConfig: Record<
    JobStatus,
    { label: string; color: string; iconColor: string }
  > = {
    queued: {
      label: "Queued",
      color: "border-border bg-card",
      iconColor: "text-muted-foreground",
    },
    tailoring: {
      label: "Tailoring...",
      color: "border-violet-500/30 bg-violet-500/5",
      iconColor: "text-violet-500",
    },
    "cover-letter": {
      label: "Cover letter...",
      color: "border-blue-500/30 bg-blue-500/5",
      iconColor: "text-blue-500",
    },
    applying: {
      label: "Applying...",
      color: "border-amber-500/30 bg-amber-500/5",
      iconColor: "text-amber-500",
    },
    done: {
      label: "Applied",
      color: "border-green-500/30 bg-green-500/5",
      iconColor: "text-green-500",
    },
    error: {
      label: "Failed",
      color: "border-red-500/30 bg-red-500/5",
      iconColor: "text-red-500",
    },
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-pink-400 shadow-lg shadow-rose-500/25">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Beast Mode
            </h1>
            <p className="text-muted-foreground">
              Bulk apply to multiple jobs with AI-tailored resumes and cover
              letters.
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ─── CONFIGURE ─── */}
        {phase === "configure" && (
          <motion.div
            key="configure"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {/* Step 1: Resume */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    1
                  </div>
                  <h2 className="font-display text-base font-semibold">
                    Choose Your Resume
                  </h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {resumes.map((resume) => {
                    const isSelected = selectedResumeId === resume.id;
                    return (
                      <button
                        key={resume.id}
                        onClick={() => setSelectedResumeId(resume.id)}
                        className={`group relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-md ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-400 shadow-md shadow-violet-500/20">
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
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {resume.experience.length} roles
                            </Badge>
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
                <Textarea
                  placeholder="Optional instructions: e.g. Emphasize leadership, Focus on remote experience, Highlight certifications..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={2}
                  className="text-sm resize-none"
                />
              </CardContent>
            </Card>

            {/* Step 2: Filters */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    2
                  </div>
                  <h2 className="font-display text-base font-semibold">
                    Filter Jobs
                  </h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                      Category
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {categoryOptions.map((cat) => (
                        <Button
                          key={cat.value}
                          variant={
                            categoryFilter === cat.value ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCategoryFilter(cat.value)}
                          className="text-xs h-7 rounded-full"
                        >
                          {cat.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                        Type
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {typeOptions.map((t) => (
                          <Button
                            key={t}
                            variant={
                              typeFilter === t ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setTypeFilter(t)}
                            className="text-xs h-7 rounded-full capitalize"
                          >
                            {t}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                        Level
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {levelOptions.map((l) => (
                          <Button
                            key={l}
                            variant={
                              levelFilter === l ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setLevelFilter(l)}
                            className="text-xs h-7 rounded-full capitalize"
                          >
                            {l}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Job Queue */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      3
                    </div>
                    <h2 className="font-display text-base font-semibold">
                      Select Jobs
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleAll}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {selectedJobIds.size === filteredJobs.length &&
                      filteredJobs.length > 0
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                    <Badge
                      variant="outline"
                      className="font-mono text-xs tabular-nums"
                    >
                      {selectedJobIds.size}/{filteredJobs.length}
                    </Badge>
                  </div>
                </div>

                {filteredJobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Filter className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No matching jobs. Try adjusting filters.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[420px] overflow-y-auto rounded-lg">
                    {filteredJobs.map((job, idx) => {
                      const isSelected = selectedJobIds.has(job.id);
                      return (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.015 }}
                        >
                          <div
                            onClick={() => toggleJob(job.id)}
                            className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all duration-150 ${
                              isSelected
                                ? "border-primary/40 bg-primary/5"
                                : "border-transparent bg-muted/30 hover:bg-muted/60"
                            }`}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleJob(job.id)}
                              className="shrink-0"
                            />
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-500 dark:from-slate-600 dark:to-slate-400 font-display text-xs font-bold text-white shadow-sm">
                              {job.company[0]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">
                                {job.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-0.5 truncate">
                                  <Building2 className="h-3 w-3 shrink-0" />
                                  {job.company}
                                </span>
                                <span className="hidden sm:flex items-center gap-0.5">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  {job.location}
                                </span>
                                <span className="flex items-center gap-0.5">
                                  <DollarSign className="h-3 w-3 shrink-0" />
                                  {formatSalary(job.salaryMin)}-
                                  {formatSalary(job.salaryMax)}
                                </span>
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className="text-[10px] capitalize shrink-0 hidden sm:inline-flex"
                            >
                              {job.category}
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sticky Launch Bar */}
            <div className="sticky bottom-4 z-10">
              <Card className="shadow-2xl border-rose-500/20 bg-card/95 backdrop-blur-sm">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {selectedJobIds.size > 0 ? (
                        <>
                          {selectedJobIds.size} job
                          {selectedJobIds.size !== 1 && "s"} ready
                        </>
                      ) : (
                        "Select jobs to get started"
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedResume
                        ? `Using: ${selectedResume.name}`
                        : "Select a resume first"}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    disabled={!selectedResumeId || selectedJobIds.size === 0}
                    onClick={handleLaunch}
                    className="gap-2 shrink-0 bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 shadow-lg shadow-rose-500/25 text-white border-0"
                  >
                    <Zap className="h-4 w-4" />
                    Launch Beast Mode
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* ─── PROCESSING ─── */}
        {(phase === "processing" || phase === "done") && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Mission Control Header */}
            <Card
              className={
                phase === "done"
                  ? "border-green-500/30"
                  : "border-rose-500/20"
              }
            >
              <CardContent className="p-6">
                {phase === "done" ? (
                  <div className="text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="flex justify-center"
                    >
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-green-500 to-emerald-400 shadow-xl shadow-green-500/30">
                        <Trophy className="h-10 w-10 text-white" />
                      </div>
                    </motion.div>
                    <div>
                      <h2 className="font-display text-2xl font-bold">
                        Mission Complete!
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        Beast Mode finished in{" "}
                        <span className="font-mono font-bold text-foreground">
                          {elapsedSeconds}s
                        </span>
                      </p>
                    </div>
                    <div className="flex justify-center gap-6 py-2">
                      <div className="text-center">
                        <p className="text-2xl font-bold font-display text-green-500">
                          {completedCount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Applied
                        </p>
                      </div>
                      <div className="h-10 w-px bg-border" />
                      <div className="text-center">
                        <p className="text-2xl font-bold font-display">
                          {completedCount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Resumes Tailored
                        </p>
                      </div>
                      <div className="h-10 w-px bg-border" />
                      <div className="text-center">
                        <p className="text-2xl font-bold font-display">
                          {completedCount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Cover Letters
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPhase("configure");
                          setSelectedJobIds(new Set());
                          setJobStates([]);
                        }}
                        className="gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Apply to More
                      </Button>
                      <Button
                        onClick={() => router.push("/app/applications")}
                        className="gap-2"
                      >
                        View Applications
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-pink-400 shadow-md shadow-rose-500/20">
                          <Zap className="h-5 w-5 text-white animate-pulse" />
                        </div>
                        <div>
                          <h2 className="font-display text-lg font-semibold">
                            Beast Mode Active
                          </h2>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-mono">{elapsedSeconds}s</span>{" "}
                            elapsed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold font-display tabular-nums">
                          {completedCount}
                          <span className="text-muted-foreground text-base font-normal">
                            /{jobStates.length}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          jobs completed
                        </p>
                      </div>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Processing Grid */}
            <div className="grid gap-2 sm:grid-cols-2">
              {jobStates.map((state, idx) => {
                const job = MOCK_JOBS.find((j) => j.id === state.jobId);
                if (!job) return null;
                const config = statusConfig[state.status];
                const isActive = [
                  "tailoring",
                  "cover-letter",
                  "applying",
                ].includes(state.status);

                return (
                  <motion.div
                    key={state.jobId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.02 }}
                  >
                    <div
                      className={`relative flex items-center gap-3 rounded-xl border p-3 transition-all duration-300 ${config.color}`}
                    >
                      {/* Status icon */}
                      {state.status === "done" ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                      ) : isActive ? (
                        <Loader2
                          className={`h-5 w-5 shrink-0 animate-spin ${config.iconColor}`}
                        />
                      ) : state.status === "error" ? (
                        <X className="h-5 w-5 shrink-0 text-red-500" />
                      ) : (
                        <div className="h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground/20" />
                      )}

                      {/* Company initial */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-500 dark:from-slate-600 dark:to-slate-400 text-xs font-bold text-white">
                        {job.company[0]}
                      </div>

                      {/* Job info */}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate leading-tight">
                          {job.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {job.company}
                        </p>
                      </div>

                      {/* Status label */}
                      <span
                        className={`text-[11px] shrink-0 font-medium ${config.iconColor}`}
                      >
                        {config.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
