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
  LayoutDashboard,
} from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { useResumeStore } from "@/lib/store/resume-store";
import { useJobStore } from "@/lib/store/job-store";
import { PageHeader } from "@/components/app/page-header";

const quickActions = [
  {
    title: "Upload Resume",
    icon: Upload,
    href: "/app/resume",
    gradient: "from-blue-600 to-blue-400",
    shadow: "shadow-blue-500/25",
  },
  {
    title: "Tailor Resume",
    icon: Wand2,
    href: "/app/tailor",
    gradient: "from-violet-600 to-purple-400",
    shadow: "shadow-violet-500/25",
  },
  {
    title: "Browse Jobs",
    icon: Briefcase,
    href: "/app/jobs",
    gradient: "from-emerald-600 to-green-400",
    shadow: "shadow-emerald-500/25",
  },
  {
    title: "Applications",
    icon: ClipboardList,
    href: "/app/applications",
    gradient: "from-amber-600 to-yellow-400",
    shadow: "shadow-amber-500/25",
  },
  {
    title: "Easy Apply",
    icon: Send,
    href: "/app/jobs",
    gradient: "from-cyan-600 to-sky-400",
    shadow: "shadow-cyan-500/25",
  },
  {
    title: "Beast Mode",
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

  const stats = [
    {
      label: "Resumes",
      value: resumes.length,
      icon: FileText,
      iconColor: "text-blue-500",
    },
    {
      label: "Applications",
      value: applications.length,
      icon: BarChart3,
      iconColor: "text-emerald-500",
    },
    {
      label: "Interviews",
      value: interviews,
      icon: Target,
      iconColor: "text-violet-500",
    },
    {
      label: "Response Rate",
      value:
        applications.length > 0
          ? Math.round((interviews / applications.length) * 100)
          : 0,
      icon: TrendingUp,
      iconColor: "text-amber-500",
      suffix: "%",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        subtitle="Here's an overview of your job search progress."
        gradient="from-blue-600 to-blue-400"
        shadow="shadow-blue-500/25"
      />

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <div className="rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight">
                <NumberTicker value={stat.value} />
                {stat.suffix || ""}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 font-display text-lg font-semibold">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((action, idx) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + idx * 0.04 }}
            >
              <Link href={action.href}>
                <div className="group flex flex-col items-center gap-2.5 rounded-xl border border-transparent p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-border/50 hover:bg-accent/50">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg ${action.shadow} transition-transform duration-200 group-hover:scale-110`}
                  >
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-center text-xs font-medium leading-tight">
                    {action.title}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
