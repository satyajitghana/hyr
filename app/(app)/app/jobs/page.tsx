"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Search,
  MapPin,
  DollarSign,
  Building2,
  Clock,
  Tag,
  Briefcase,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MOCK_JOBS } from "@/lib/jobs/mock-data";
import { JobCategory } from "@/lib/jobs/types";
import { PageHeader } from "@/components/app/page-header";

const typeFilters = ["all", "remote", "hybrid", "onsite"] as const;
const levelFilters = ["all", "junior", "mid", "senior", "lead"] as const;

const categoryFilters: { value: "all" | JobCategory; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "legal", label: "Legal" },
  { value: "education", label: "Education" },
  { value: "operations", label: "Operations" },
  { value: "sales", label: "Sales" },
  { value: "data", label: "Data" },
  { value: "product", label: "Product" },
];

function formatSalary(n: number) {
  return `$${(n / 1000).toFixed(0)}K`;
}

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const filteredJobs = useMemo(() => {
    return MOCK_JOBS.filter((job) => {
      const matchesSearch =
        !search ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.location.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || job.type === typeFilter;
      const matchesLevel = levelFilter === "all" || job.level === levelFilter;
      const matchesCategory = categoryFilter === "all" || job.category === categoryFilter;
      return matchesSearch && matchesType && matchesLevel && matchesCategory;
    });
  }, [search, typeFilter, levelFilter, categoryFilter]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        icon={Briefcase}
        title="Jobs"
        subtitle="Find and apply to jobs that match your skills across all industries."
        gradient="from-emerald-600 to-green-400"
        shadow="shadow-emerald-500/25"
      />

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, company, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1.5">
          <Tag className="mr-1 h-4 w-4 text-muted-foreground self-center" />
          {categoryFilters.map((cat) => (
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

        {/* Type & Level Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-1">
            {typeFilters.map((t) => (
              <Button
                key={t}
                variant={typeFilter === t ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(t)}
                className="capitalize text-xs"
              >
                {t}
              </Button>
            ))}
          </div>
          <div className="flex gap-1">
            {levelFilters.map((l) => (
              <Button
                key={l}
                variant={levelFilter === l ? "default" : "outline"}
                size="sm"
                onClick={() => setLevelFilter(l)}
                className="capitalize text-xs"
              >
                {l}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <p className="text-sm text-muted-foreground">
        {filteredJobs.length} job{filteredJobs.length !== 1 && "s"} found
      </p>

      {!mounted ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-1.5 pt-1">
                      {[...Array(3)].map((_, j) => <Skeleton key={j} className="h-5 w-16 rounded-full" />)}
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20 rounded-lg shrink-0 self-center" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job, idx) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Link href={`/app/jobs/${job.id}`}>
                <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/20">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display text-lg font-bold text-primary">
                          {job.company[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5" />
                              {job.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5" />
                              {formatSalary(job.salaryMin)} —{" "}
                              {formatSalary(job.salaryMax)}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <Badge variant="outline" className="text-xs capitalize">
                              {job.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {job.level}
                            </Badge>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {job.category}
                            </Badge>
                            {job.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground sm:flex-col sm:items-end">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(job.postedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
