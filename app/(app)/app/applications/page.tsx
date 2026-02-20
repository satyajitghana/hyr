"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ClipboardList,
  Clock,
  TrendingUp,
  Send,
  CheckCircle2,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useJobStore } from "@/lib/store/job-store";
import type { Application } from "@/lib/jobs/types";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  applied: { label: "Applied", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  screening: {
    label: "Screening",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  interview: {
    label: "Interview",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
  },
  offer: {
    label: "Offer",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
  },
};

const statusOrder: Application["status"][] = ["applied", "screening", "interview", "offer", "rejected"];

export default function ApplicationsPage() {
  const { applications, updateApplicationStatus } = useJobStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

  const columnHelper = createColumnHelper<Application>();

  const columns = [
    columnHelper.display({
      id: "company",
      header: "Company",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-xs font-bold text-primary">
            {row.original.job.company[0]}
          </div>
          <span className="font-medium text-sm">{row.original.job.company}</span>
        </div>
      ),
    }),
    columnHelper.display({
      id: "title",
      header: "Job Title",
      cell: ({ row }) => (
        <Link href={`/app/jobs/${row.original.jobId}`} className="text-sm hover:text-primary transition-colors">
          {row.original.job.title}
        </Link>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const cfg = statusConfig[info.getValue()];
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
          </span>
        );
      },
    }),
    columnHelper.accessor("appliedDate", {
      header: "Applied",
      cell: (info) => (
        <span className="text-sm text-muted-foreground">
          {new Date(info.getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.accessor("autoApplied", {
      header: "",
      cell: (info) => info.getValue() ? (
        <Badge variant="secondary" className="text-xs">Auto</Badge>
      ) : null,
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {statusOrder.map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => updateApplicationStatus(row.original.id, s)}
                className={row.original.status === s ? "font-medium" : ""}
              >
                {statusConfig[s].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ] as ColumnDef<Application>[];

  const table = useReactTable({
    data: applications,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-16" /></CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="Applications"
        subtitle="Track all your job applications in one place."
        gradient="from-amber-600 to-yellow-400"
        shadow="shadow-amber-500/25"
      />

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
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                {table.getFlatHeaders().map(header => (
                  <th key={header.id} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statusOrder.map((status) => {
                const statusRows = table.getRowModel().rows.filter(r => r.original.status === status);
                if (statusRows.length === 0) return null;
                const cfg = statusConfig[status];
                return (
                  <React.Fragment key={status}>
                    <tr className="bg-muted/20 border-t">
                      <td colSpan={columns.length} className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                          <Badge variant="secondary" className="text-xs h-4 px-1.5">{statusRows.length}</Badge>
                        </div>
                      </td>
                    </tr>
                    {statusRows.map(row => (
                      <tr key={row.id} className="border-t border-border/40 hover:bg-muted/30 transition-colors">
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="px-4 py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
