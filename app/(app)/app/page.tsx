"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  FileText,
  Wand2,
  Briefcase,
  ClipboardList,
  Upload,
  TrendingUp,
  Zap,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { useResumeStore } from "@/lib/store/resume-store";
import { useJobStore } from "@/lib/store/job-store";

const quickActions = [
  {
    title: "Upload Resume",
    icon: Upload,
    href: "/app/resume",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Tailor Resume",
    icon: Wand2,
    href: "/app/tailor",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Browse Jobs",
    icon: Briefcase,
    href: "/app/jobs",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "Applications",
    icon: ClipboardList,
    href: "/app/applications",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Easy Apply",
    icon: Send,
    href: "/app/jobs",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    title: "Beast Mode",
    icon: Zap,
    href: "/app/beast-mode",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
];

export default function DashboardPage() {
  const resumes = useResumeStore((s) => s.resumes);
  const applications = useJobStore((s) => s.applications);
  const interviews = applications.filter((a) => a.status === "interview").length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s an overview of your job search progress.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Resumes",
            value: resumes.length,
            icon: FileText,
            color: "text-blue-500",
          },
          {
            label: "Applications",
            value: applications.length,
            icon: ClipboardList,
            color: "text-green-500",
          },
          {
            label: "Interviews",
            value: interviews,
            icon: TrendingUp,
            color: "text-purple-500",
          },
          {
            label: "Response Rate",
            value: applications.length > 0 ? Math.round((interviews / applications.length) * 100) : 0,
            icon: TrendingUp,
            color: "text-amber-500",
            suffix: "%",
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display">
                  <NumberTicker value={stat.value} />
                  {stat.suffix || ""}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 font-display text-xl font-semibold">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action, idx) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + idx * 0.04 }}
            >
              <Link href={action.href}>
                <div className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20 hover:scale-105 w-[110px]">
                  <div className={`rounded-lg p-2.5 ${action.bg} transition-transform group-hover:scale-110`}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <span className="text-xs font-medium text-center group-hover:text-primary transition-colors">
                    {action.title}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
