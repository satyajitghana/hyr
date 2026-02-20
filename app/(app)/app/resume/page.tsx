"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  FileText,
  Wand2,
  Shield,
  Trash2,
  MoreVertical,
  Plus,
  Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResumeUploader } from "@/components/resume/resume-uploader";
import { useResumeStore } from "@/lib/store/resume-store";
import { Resume } from "@/lib/resume/types";

export default function ResumePage() {
  const { resumes, addResume, deleteResume } = useResumeStore();
  const [showUpload, setShowUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleUpload = async () => {
    setIsUploading(true);

    // Mock: simulate parsing delay
    await new Promise((r) => setTimeout(r, 2000));

    const newResume: Resume = {
      id: crypto.randomUUID(),
      name: `Resume ${resumes.length + 1}`,
      contact: {
        name: "Jordan Rivera",
        email: "jordan.rivera@email.com",
        phone: "(555) 000-0000",
        location: "Austin, TX",
      },
      summary:
        "Product-minded software engineer with experience shipping customer-facing web products, improving conversion funnels, and collaborating across product, design, and operations.",
      experience: [
        {
          id: crypto.randomUUID(),
          title: "Software Engineer",
          company: "Northstar Labs",
          location: "Austin, TX",
          startDate: "2023-01",
          endDate: "Present",
          bullets: [
            "Launched three product features that increased weekly active usage by 21% quarter over quarter",
            "Reduced page load time from 3.8s to 1.6s by optimizing bundle strategy, caching, and image delivery",
            "Partnered with design and support to reduce onboarding drop-off by 18% through UX and content improvements",
          ],
        },
      ],
      education: [
        {
          id: crypto.randomUUID(),
          degree: "B.S. Computer Science",
          school: "University of Texas at Austin",
          location: "Austin, TX",
          graduationDate: "2022-05",
        },
      ],
      skills: ["React", "TypeScript", "Next.js", "Node.js", "SQL", "Product Analytics"],
      certifications: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addResume(newResume);
    setIsUploading(false);
    setShowUpload(false);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Resumes
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage and optimize your resumes.
          </p>
        </motion.div>
        <Button onClick={() => setShowUpload(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Upload Resume
        </Button>
      </div>

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Resume</DialogTitle>
          </DialogHeader>
          <ResumeUploader onUpload={handleUpload} isUploading={isUploading} />
        </DialogContent>
      </Dialog>

      {!mounted ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="flex gap-1.5 pt-1">
                    {[...Array(4)].map((_, j) => <Skeleton key={j} className="h-5 w-14 rounded-full" />)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16"
        >
          <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="font-display text-lg font-semibold">
            No resumes yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload your first resume to get started.
          </p>
          <Button onClick={() => setShowUpload(true)} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Upload Resume
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume, idx) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link href={`/app/resume/${resume.id}`} className="block">
                <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/20">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 p-2.5">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {resume.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {resume.contact.name} &middot; Updated{" "}
                            {new Date(resume.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/app/resume/${resume.id}`}>
                                <FileText className="mr-2 h-4 w-4" />
                                View / Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/app/resume/${resume.id}/optimize`}>
                                <Shield className="mr-2 h-4 w-4" />
                                ATS Optimize
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/app/tailor">
                                <Wand2 className="mr-2 h-4 w-4" />
                                Tailor for Job
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                const res = await fetch("/api/resume/pdf", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ resume }),
                                });
                                if (!res.ok) {
                                  const err = await res.json().catch(() => ({ error: "Unknown error" }));
                                  console.error("PDF generation failed:", err);
                                  return;
                                }
                                const blob = await res.blob();
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `${resume.contact.name.replace(/\s+/g, "_")}_Resume.pdf`;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteResume(resume.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {resume.summary}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {resume.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {resume.skills.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{resume.skills.length - 4}
                          </Badge>
                        )}
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
