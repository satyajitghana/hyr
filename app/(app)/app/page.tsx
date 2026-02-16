"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  FileText,
  Wand2,
  Briefcase,
  ClipboardList,
  ArrowRight,
  Upload,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { useResumeStore } from "@/lib/store/resume-store";
import { useJobStore } from "@/lib/store/job-store";

const quickActions = [
  {
    title: "Upload Resume",
    description: "Add a new resume to your collection",
    icon: Upload,
    href: "/app/resume",
    color: "text-blue-500",
  },
  {
    title: "Tailor Resume",
    description: "Customize for a specific job",
    icon: Wand2,
    href: "/app/tailor",
    color: "text-purple-500",
  },
  {
    title: "Browse Jobs",
    description: "Find your next opportunity",
    icon: Briefcase,
    href: "/app/jobs",
    color: "text-green-500",
  },
  {
    title: "Track Applications",
    description: "Monitor your progress",
    icon: ClipboardList,
    href: "/app/applications",
    color: "text-amber-500",
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, idx) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + idx * 0.05 }}
            >
              <Link href={action.href}>
                <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/20">
                  <CardContent className="flex flex-col gap-3 p-5">
                    <action.icon className={`h-8 w-8 ${action.color}`} />
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
