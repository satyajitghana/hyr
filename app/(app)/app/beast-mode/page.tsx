"use client";

import { useState, useMemo, useCallback } from "react";
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
  Rocket,
  ArrowRight,
  Check,
  X,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { MOCK_JOBS } from "@/lib/jobs/mock-data";
import { useResumeStore } from "@/lib/store/resume-store";
import { useJobStore } from "@/lib/store/job-store";
import { getAIProvider } from "@/lib/ai/provider";
import { Job, JobCategory } from "@/lib/jobs/types";

type BeastPhase = "configure" | "processing" | "done";

interface JobProcessingState {
  jobId: string;
  status: "queued" | "tailoring" | "cover-letter" | "applying" | "done" | "error";
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

  // Config state
  const [phase, setPhase] = useState<BeastPhase>("configure");
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [customInstructions, setCustomInstructions] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());

  // Processing state
  const [jobStates, setJobStates] = useState<JobProcessingState[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const appliedJobIds = useMemo(
    () => new Set(applications.map((a) => a.jobId)),
    [applications]
  );

  const filteredJobs = useMemo(() => {
    return MOCK_JOBS.filter((job) => {
      if (appliedJobIds.has(job.id)) return false;
      const matchesCategory = categoryFilter === "all" || job.category === categoryFilter;
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
    const initialStates: JobProcessingState[] = jobIds.map((id) => ({
      jobId: id,
      status: "queued",
    }));

    setJobStates(initialStates);
    setCompletedCount(0);
    setPhase("processing");
    const start = Date.now();
    setStartTime(start);

    const ai = getAIProvider();
    let done = 0;

    for (let i = 0; i < jobIds.length; i++) {
      const jobId = jobIds[i];
      const job = MOCK_JOBS.find((j) => j.id === jobId);
      if (!job) continue;

      // Update to tailoring
      setJobStates((prev) =>
        prev.map((s) => (s.jobId === jobId ? { ...s, status: "tailoring" } : s))
      );

      try {
        // Tailor
        await ai.tailorResume(selectedResume, job.description, job.title, job.company);

        // Cover letter
        setJobStates((prev) =>
          prev.map((s) =>
            s.jobId === jobId ? { ...s, status: "cover-letter" } : s
          )
        );
        await ai.generateCoverLetter(selectedResume, job);

        // Apply
        setJobStates((prev) =>
          prev.map((s) =>
            s.jobId === jobId ? { ...s, status: "applying" } : s
          )
        );

        // Simulate small delay for applying
        await new Promise((r) => setTimeout(r, 300));

        // Create application
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
        setElapsedSeconds(Math.round((Date.now() - start) / 1000));

        setJobStates((prev) =>
          prev.map((s) =>
            s.jobId === jobId ? { ...s, status: "done" } : s
          )
        );
      } catch {
        setJobStates((prev) =>
          prev.map((s) =>
            s.jobId === jobId ? { ...s, status: "error" } : s
          )
        );
      }
    }

    setElapsedSeconds(Math.round((Date.now() - start) / 1000));
    setPhase("done");
  }, [selectedResume, selectedJobIds, addResume, addApplication]);

  const progressPercent =
    jobStates.length > 0 ? (completedCount / jobStates.length) * 100 : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10">
            <Zap className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Beast Mode
            </h1>
            <p className="text-muted-foreground">
              Bulk apply to multiple jobs with AI-tailored resumes.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Configure Phase */}
      {phase === "configure" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-6"
        >
          {/* Resume Selector */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Select Resume
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {resumes.map((resume) => (
                  <button
                    key={resume.id}
                    onClick={() => setSelectedResumeId(resume.id)}
                    className={`flex shrink-0 items-center gap-3 rounded-lg border p-3 text-left transition-all hover:border-primary/30 min-w-[200px] ${
                      selectedResumeId === resume.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border"
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{resume.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {resume.skills.length} skills
                      </p>
                    </div>
                    {selectedResumeId === resume.id && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Optional: Add custom instructions for AI tailoring (e.g., 'Emphasize leadership' or 'Focus on remote work experience')..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={2}
                className="text-sm"
              />
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Filter Jobs
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Category</p>
                  <div className="flex flex-wrap gap-1.5">
                    {categoryOptions.map((cat) => (
                      <Button
                        key={cat.value}
                        variant={categoryFilter === cat.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter(cat.value)}
                        className="text-xs h-7"
                      >
                        {cat.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Type</p>
                    <div className="flex gap-1">
                      {typeOptions.map((t) => (
                        <Button
                          key={t}
                          variant={typeFilter === t ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTypeFilter(t)}
                          className="text-xs h-7 capitalize"
                        >
                          {t}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Level</p>
                    <div className="flex gap-1">
                      {levelOptions.map((l) => (
                        <Button
                          key={l}
                          variant={levelFilter === l ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLevelFilter(l)}
                          className="text-xs h-7 capitalize"
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

          {/* Job Queue */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  Job Queue
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleAll}
                    className="text-xs text-primary hover:underline"
                  >
                    {selectedJobIds.size === filteredJobs.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                  <Badge variant="secondary">
                    {selectedJobIds.size} of {filteredJobs.length} selected
                  </Badge>
                </div>
              </div>

              {filteredJobs.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No matching jobs found. Try adjusting your filters.
                </p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => toggleJob(job.id)}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all hover:bg-accent/50 ${
                        selectedJobIds.has(job.id)
                          ? "border-primary/30 bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <Checkbox
                        checked={selectedJobIds.has(job.id)}
                        onCheckedChange={() => toggleJob(job.id)}
                        className="shrink-0"
                      />
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-sm font-bold text-primary">
                        {job.company[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{job.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatSalary(job.salaryMin)}-{formatSalary(job.salaryMax)}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize shrink-0">
                        {job.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Launch Button */}
          <div className="sticky bottom-4 z-10">
            <Card className="border-primary/20 shadow-lg">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">
                    {selectedJobIds.size} job{selectedJobIds.size !== 1 && "s"} selected
                    {selectedResume && (
                      <span className="text-muted-foreground">
                        {" "}with {selectedResume.name}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    AI will tailor your resume and generate cover letters for each job
                  </p>
                </div>
                <Button
                  size="lg"
                  disabled={!selectedResumeId || selectedJobIds.size === 0}
                  onClick={handleLaunch}
                  className="gap-2 bg-rose-500 hover:bg-rose-600"
                >
                  <Zap className="h-4 w-4" />
                  Apply to {selectedJobIds.size} Job{selectedJobIds.size !== 1 && "s"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Processing Phase */}
      {(phase === "processing" || phase === "done") && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Progress Header */}
          <Card className={phase === "done" ? "border-green-500/30" : "border-primary/20"}>
            <CardContent className="p-5 space-y-4">
              {phase === "done" ? (
                <div className="text-center space-y-2">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                      <Trophy className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <h2 className="font-display text-2xl font-bold">
                    Mission Complete!
                  </h2>
                  <p className="text-muted-foreground">
                    Applied to {completedCount} job{completedCount !== 1 && "s"} in{" "}
                    {elapsedSeconds} second{elapsedSeconds !== 1 && "s"}
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPhase("configure");
                        setSelectedJobIds(new Set());
                        setJobStates([]);
                      }}
                    >
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
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-semibold">
                      Applying to Jobs...
                    </h2>
                    <span className="text-sm font-medium text-primary">
                      {completedCount} of {jobStates.length}
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </>
              )}
            </CardContent>
          </Card>

          {/* Job Processing Cards */}
          <div className="space-y-2">
            {jobStates.map((state, idx) => {
              const job = MOCK_JOBS.find((j) => j.id === state.jobId);
              if (!job) return null;

              const statusLabel = {
                queued: "Queued",
                tailoring: "Tailoring resume...",
                "cover-letter": "Writing cover letter...",
                applying: "Applying...",
                done: "Applied",
                error: "Failed",
              }[state.status];

              const isActive = ["tailoring", "cover-letter", "applying"].includes(
                state.status
              );

              return (
                <motion.div
                  key={state.jobId}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  <div
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                      state.status === "done"
                        ? "border-green-500/20 bg-green-500/5"
                        : isActive
                          ? "border-primary/30 bg-primary/5"
                          : state.status === "error"
                            ? "border-red-500/20 bg-red-500/5"
                            : "border-border"
                    }`}
                  >
                    {state.status === "done" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                    ) : isActive ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                    ) : state.status === "error" ? (
                      <X className="h-4 w-4 shrink-0 text-red-500" />
                    ) : (
                      <div className="h-4 w-4 shrink-0 rounded-full border-2 border-muted-foreground/30" />
                    )}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-xs font-bold text-primary">
                      {job.company[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{job.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {job.company} &middot; {job.location}
                      </p>
                    </div>
                    <span
                      className={`text-xs shrink-0 ${
                        state.status === "done"
                          ? "text-green-600 dark:text-green-400 font-medium"
                          : isActive
                            ? "text-primary font-medium"
                            : "text-muted-foreground"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
