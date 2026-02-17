"use client";

import { motion } from "motion/react";
import {
  ClipboardList,
  Building2,
  Calendar,
  FileText,
  Clock,
  TrendingUp,
  Send,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { useJobStore } from "@/lib/store/job-store";
import Link from "next/link";

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  applied: { label: "Applied", color: "text-blue-600", bg: "bg-blue-500/10" },
  screening: {
    label: "Screening",
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  interview: {
    label: "Interview",
    color: "text-purple-600",
    bg: "bg-purple-500/10",
  },
  offer: {
    label: "Offer",
    color: "text-green-600",
    bg: "bg-green-500/10",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    bg: "bg-red-500/10",
  },
};

const statusOrder = ["applied", "screening", "interview", "offer", "rejected"];

export default function ApplicationsPage() {
  const { applications, updateApplicationStatus } = useJobStore();

  const stats = {
    total: applications.length,
    interviews: applications.filter((a) => a.status === "interview").length,
    offers: applications.filter((a) => a.status === "offer").length,
    responseRate:
      applications.length > 0
        ? Math.round(
            (applications.filter(
              (a) => a.status !== "applied" && a.status !== "rejected"
            ).length /
              applications.length) *
              100
          )
        : 0,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Applications
        </h1>
        <p className="mt-1 text-muted-foreground">
          Track all your job applications in one place.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Applications", value: stats.total, icon: Send },
          { label: "Interviews", value: stats.interviews, icon: TrendingUp },
          { label: "Offers", value: stats.offers, icon: CheckCircle2 },
          {
            label: "Response Rate",
            value: stats.responseRate,
            icon: Clock,
            suffix: "%",
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
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

      {applications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16"
        >
          <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="font-display text-lg font-semibold">
            No applications yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Start applying to jobs to track them here.
          </p>
          <Link href="/app/jobs">
            <Button className="mt-4 gap-2">
              Browse Jobs
            </Button>
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Kanban Board */}
          <div className="grid gap-4 md:grid-cols-5">
            {statusOrder.map((status) => {
              const config = statusConfig[status];
              const apps = applications.filter((a) => a.status === status);

              return (
                <div key={status}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className={`text-sm font-semibold ${config.color}`}>
                      {config.label}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {apps.length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {apps.map((app) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        layout
                      >
                        <Card className="transition-all hover:shadow-md">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-xs font-bold text-primary">
                                {app.job.company[0]}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">
                                  {app.job.title}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {app.job.company}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(app.appliedDate).toLocaleDateString()}
                            </div>
                            {app.autoApplied && (
                              <Badge
                                variant="secondary"
                                className="mt-2 text-xs gap-1"
                              >
                                Auto-applied
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                    {apps.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground py-6">
                        No applications
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
