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
  BarChart3,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { useResumeStore } from "@/lib/store/resume-store";
import { useJobStore } from "@/lib/store/job-store";

const quickActions = [
  {
    title: "Upload Resume",
    description: "Add a new resume",
    icon: Upload,
    href: "/app/resume",
    gradient: "from-blue-600 to-blue-400",
    shadow: "shadow-blue-500/25",
  },
  {
    title: "Tailor Resume",
    description: "AI-powered optimization",
    icon: Wand2,
    href: "/app/tailor",
    gradient: "from-violet-600 to-purple-400",
    shadow: "shadow-violet-500/25",
  },
  {
    title: "Browse Jobs",
    description: "Explore opportunities",
    icon: Briefcase,
    href: "/app/jobs",
    gradient: "from-emerald-600 to-green-400",
    shadow: "shadow-emerald-500/25",
  },
  {
    title: "Applications",
    description: "Track your progress",
    icon: ClipboardList,
    href: "/app/applications",
    gradient: "from-amber-600 to-yellow-400",
    shadow: "shadow-amber-500/25",
  },
  {
    title: "Easy Apply",
    description: "One-click applications",
    icon: Send,
    href: "/app/jobs",
    gradient: "from-cyan-600 to-sky-400",
    shadow: "shadow-cyan-500/25",
  },
  {
    title: "Beast Mode",
    description: "Bulk auto-apply",
    icon: Zap,
    href: "/app/beast-mode",
    gradient: "from-rose-600 to-pink-400",
    shadow: "shadow-rose-500/25",
  },
];

export default function DashboardPage() {
  const resumes = useResumeStore((s) => s.resumes);
  const applications = useJobStore((s) => s.applications);
  const interviews = applications.filter(
    (a) => a.status === "interview"
  ).length;
  const offers = applications.filter((a) => a.status === "offer").length;

  const stats = [
    {
      label: "Resumes",
      value: resumes.length,
      icon: FileText,
      accent: "bg-blue-500",
      iconColor: "text-blue-500",
    },
    {
      label: "Applications",
      value: applications.length,
      icon: BarChart3,
      accent: "bg-emerald-500",
      iconColor: "text-emerald-500",
    },
    {
      label: "Interviews",
      value: interviews,
      icon: Target,
      accent: "bg-violet-500",
      iconColor: "text-violet-500",
    },
    {
      label: "Response Rate",
      value:
        applications.length > 0
          ? Math.round((interviews / applications.length) * 100)
          : 0,
      icon: TrendingUp,
      accent: "bg-amber-500",
      iconColor: "text-amber-500",
      suffix: "%",
    },
  ];

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
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <Card className="relative overflow-hidden">
              <div className={`absolute left-0 top-0 h-full w-1 ${stat.accent}`} />
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-3xl font-bold font-display tracking-tight">
                      <NumberTicker value={stat.value} />
                      {stat.suffix || ""}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-5 font-display text-xl font-semibold">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((action, idx) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + idx * 0.04 }}
            >
              <Link href={action.href}>
                <Card className="group h-full cursor-pointer border-border/60 transition-all duration-200 hover:shadow-lg hover:border-border hover:-translate-y-0.5">
                  <CardContent className="flex flex-col items-center gap-3 p-5">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${action.gradient} shadow-lg ${action.shadow} transition-transform duration-200 group-hover:scale-110`}
                    >
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold leading-tight">
                        {action.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">
                        {action.description}
                      </p>
                    </div>
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
