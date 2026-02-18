"use client";

import { useState, useCallback } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { motion } from "motion/react";
import {
  Mail,
  FileText,
  CheckCircle2,
  Copy,
  Check,
  Pencil,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "@/lib/store/resume-store";
import { coverLetterSchema } from "@/lib/ai/schemas";
import { StreamingText } from "@/components/ai/streaming-text";

export default function CoverLetterPage() {
  const resumes = useResumeStore((s) => s.resumes);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  const {
    object: result,
    submit,
    isLoading,
  } = useObject({
    api: "/api/ai/cover-letter",
    schema: coverLetterSchema,
  });

  const handleGenerate = () => {
    if (!selectedResume || !jobDescription.trim()) return;
    setEditing(false);
    setEditedContent("");
    submit({
      resume: selectedResume,
      job: {
        title: jobTitle || "Position",
        company: jobCompany || "Company",
        description: jobDescription,
        tags: [],
      },
    });
  };

  const displayContent = editing ? editedContent : (result?.content ?? "");

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [displayContent]);

  const handleEdit = () => {
    if (!editing) {
      setEditedContent(result?.content ?? "");
    }
    setEditing(!editing);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 shadow-lg shadow-blue-500/25">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Cover Letter
            </h1>
            <p className="text-muted-foreground">
              Generate a tailored cover letter for any job.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4"
        >
          {/* Resume Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">Select Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {resumes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No resumes yet. Upload one first.
                </p>
              ) : (
                <div className="grid gap-2">
                  {resumes.map((resume) => (
                    <button
                      key={resume.id}
                      onClick={() => setSelectedResumeId(resume.id)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 hover:shadow-sm ${
                        selectedResumeId === resume.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-400">
                        <FileText className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{resume.name}</p>
                        <p className="text-xs text-muted-foreground">{resume.contact.name}</p>
                      </div>
                      {selectedResumeId === resume.id && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Job Title</label>
                  <Input
                    placeholder="e.g. Senior Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Company</label>
                  <Input
                    placeholder="e.g. Acme Inc"
                    value={jobCompany}
                    onChange={(e) => setJobCompany(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Job Description</label>
                <Textarea
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={!selectedResumeId || !jobDescription.trim() || isLoading}
                className="w-full gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isLoading ? "Generating..." : "Generate Cover Letter"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Output Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Cover Letter
              </CardTitle>
              {result?.content && (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 ${editing ? "bg-primary/10 text-primary" : ""}`}
                    onClick={handleEdit}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!result?.content && !isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Mail className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Select a resume and job to generate a cover letter.
                  </p>
                </div>
              ) : editing ? (
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={20}
                  className="text-xs font-mono"
                />
              ) : (
                <div className="space-y-3">
                  {isLoading && !result?.content ? (
                    <StreamingText text={undefined} isStreaming={true} className="text-sm" />
                  ) : (
                    (result?.content ?? "").split("\n\n").map((paragraph, i) => (
                      <p key={i} className="text-sm leading-relaxed text-foreground/80">
                        {paragraph}
                      </p>
                    ))
                  )}
                  {isLoading && result?.content && (
                    <StreamingText text="" isStreaming={true} className="text-sm inline" />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
