"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Building2,
  Clock,
  Wand2,
  Send,
  Briefcase,
  CheckCircle2,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MOCK_JOBS } from "@/lib/jobs/mock-data";
import { useJobStore } from "@/lib/store/job-store";
import { useResumeStore } from "@/lib/store/resume-store";
import Link from "next/link";

function formatSalary(n: number) {
  return `$${(n / 1000).toFixed(0)}K`;
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
  const resumes = useResumeStore((s) => s.resumes);
  const alreadyApplied = applications.some((a) => a.jobId === id);

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

  const handleQuickApply = () => {
    if (alreadyApplied || resumes.length === 0) return;
    const resume = resumes[0];
    addApplication({
      id: `app-${Date.now()}`,
      jobId: job.id,
      job,
      resumeId: resume.id,
      resumeName: resume.name,
      status: "applied",
      appliedDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      autoApplied: false,
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Button variant="ghost" size="icon" onClick={() => router.push("/app/jobs")}>
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
                  <h1 className="font-display text-2xl font-bold">{job.title}</h1>
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
                      {formatSalary(job.salaryMin)} — {formatSalary(job.salaryMax)}
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
                  <>
                    <Button
                      variant="outline"
                      onClick={handleQuickApply}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Quick Apply
                    </Button>
                    <Link href="/app/tailor">
                      <Button className="gap-2">
                        <Wand2 className="h-4 w-4" />
                        Tailor & Apply
                      </Button>
                    </Link>
                  </>
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
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
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
    </div>
  );
}
