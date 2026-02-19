"use client";

import { useState, useCallback } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { motion } from "motion/react";
import {
  PenLine,
  FileText,
  CheckCircle2,
  Copy,
  Check,
  Pencil,
  Sparkles,
  Loader2,
  Mail,
  Send,
  User,
  AtSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "@/lib/store/resume-store";
import { coverLetterSchema, recruiterEmailSchema } from "@/lib/ai/schemas";
import { StreamingText } from "@/components/ai/streaming-text";

export default function ComposePage() {
  const resumes = useResumeStore((s) => s.resumes);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // Active output tab
  const [activeTab, setActiveTab] = useState<"cover-letter" | "email">(
    "cover-letter"
  );

  // Cover letter state
  const [clEditing, setClEditing] = useState(false);
  const [clEditedContent, setClEditedContent] = useState("");
  const [clCopied, setClCopied] = useState(false);

  // Email state
  const [emEditing, setEmEditing] = useState(false);
  const [emEditedSubject, setEmEditedSubject] = useState("");
  const [emEditedBody, setEmEditedBody] = useState("");
  const [emCopied, setEmCopied] = useState(false);

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  const {
    object: clResult,
    submit: clSubmit,
    isLoading: clLoading,
  } = useObject({
    api: "/api/ai/cover-letter",
    schema: coverLetterSchema,
  });

  const {
    object: emResult,
    submit: emSubmit,
    isLoading: emLoading,
  } = useObject({
    api: "/api/ai/recruiter-email",
    schema: recruiterEmailSchema,
  });

  const jobPayload = {
    title: jobTitle || "Position",
    company: jobCompany || "Company",
    description: jobDescription,
    tags: [] as string[],
  };

  const handleGenerate = () => {
    if (!selectedResume || !jobDescription.trim()) return;
    if (activeTab === "cover-letter") {
      setClEditing(false);
      setClEditedContent("");
      clSubmit({ resume: selectedResume, job: jobPayload });
    } else {
      setEmEditing(false);
      setEmEditedSubject("");
      setEmEditedBody("");
      emSubmit({ resume: selectedResume, job: jobPayload });
    }
  };

  const isLoading = activeTab === "cover-letter" ? clLoading : emLoading;

  // Cover letter helpers
  const clDisplayContent = clEditing
    ? clEditedContent
    : (clResult?.content ?? "");
  const handleClCopy = useCallback(async () => {
    await navigator.clipboard.writeText(clDisplayContent);
    setClCopied(true);
    setTimeout(() => setClCopied(false), 2000);
  }, [clDisplayContent]);

  const handleClEdit = () => {
    if (!clEditing) setClEditedContent(clResult?.content ?? "");
    setClEditing(!clEditing);
  };

  // Email helpers
  const emDisplaySubject = emEditing
    ? emEditedSubject
    : (emResult?.subject ?? "");
  const emDisplayBody = emEditing ? emEditedBody : (emResult?.body ?? "");

  const handleEmCopy = useCallback(async () => {
    await navigator.clipboard.writeText(
      `Subject: ${emDisplaySubject}\n\n${emDisplayBody}`
    );
    setEmCopied(true);
    setTimeout(() => setEmCopied(false), 2000);
  }, [emDisplaySubject, emDisplayBody]);

  const handleEmEdit = () => {
    if (!emEditing) {
      setEmEditedSubject(emResult?.subject ?? "");
      setEmEditedBody(emResult?.body ?? "");
    }
    setEmEditing(!emEditing);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-400 shadow-lg shadow-blue-500/25">
            <PenLine className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Compose
            </h1>
            <p className="text-muted-foreground">
              Generate cover letters and recruiter emails.
            </p>
            <div className="mt-2">
              <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-wide">
                AI SDK · Mock Provider
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
        {/* Left Panel — Shared Inputs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4"
        >
          {/* Resume Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">
                Select Resume
              </CardTitle>
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
                        <p className="font-medium text-sm truncate">
                          {resume.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {resume.contact.name}
                        </p>
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
              <CardTitle className="font-display text-base">
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Job Title
                  </label>
                  <Input
                    placeholder="e.g. Senior Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Company
                  </label>
                  <Input
                    placeholder="e.g. Acme Inc"
                    value={jobCompany}
                    onChange={(e) => setJobCompany(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Job Description
                </label>
                <Textarea
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={
                  !selectedResumeId || !jobDescription.trim() || isLoading
                }
                className="w-full gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isLoading
                  ? "Generating..."
                  : activeTab === "cover-letter"
                  ? "Generate Cover Letter"
                  : "Generate Email"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Panel — Tabbed Output */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={(v) =>
                setActiveTab(v as "cover-letter" | "email")
              }
            >
              <div className="flex items-center border-b px-4 py-2">
                <TabsList className="h-9">
                  <TabsTrigger value="cover-letter" className="gap-1.5 text-xs">
                    <Mail className="h-3.5 w-3.5" />
                    Cover Letter
                  </TabsTrigger>
                  <TabsTrigger value="email" className="gap-1.5 text-xs">
                    <Send className="h-3.5 w-3.5" />
                    Recruiter Email
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* ── Cover Letter Tab ── */}
              <TabsContent value="cover-letter" className="mt-0">
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
                  <span className="text-xs text-muted-foreground font-medium">
                    Cover Letter
                  </span>
                  {clResult?.content && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleClCopy}
                      >
                        {clCopied ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 ${
                          clEditing ? "bg-primary/10 text-primary" : ""
                        }`}
                        onClick={handleClEdit}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {!clResult?.content && !clLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Mail className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Generate a tailored cover letter for any job.
                      </p>
                    </div>
                  ) : clEditing ? (
                    <Textarea
                      value={clEditedContent}
                      onChange={(e) => setClEditedContent(e.target.value)}
                      rows={20}
                      className="text-xs font-mono"
                    />
                  ) : (
                    <div className="space-y-3">
                      {clLoading && !clResult?.content ? (
                        <StreamingText
                          text={undefined}
                          isStreaming={true}
                          className="text-sm"
                        />
                      ) : (
                        (clResult?.content ?? "")
                          .split("\n\n")
                          .map((paragraph, i) => (
                            <p
                              key={i}
                              className="text-sm leading-relaxed text-foreground/80"
                            >
                              {paragraph}
                            </p>
                          ))
                      )}
                      {clLoading && clResult?.content && (
                        <StreamingText
                          text=""
                          isStreaming={true}
                          className="text-sm inline"
                        />
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ── Recruiter Email Tab ── */}
              <TabsContent value="email" className="mt-0">
                <div className="border-b bg-background px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      Email Preview
                    </span>
                    {emResult?.body && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={handleEmCopy}
                        >
                          {emCopied ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-7 w-7 ${
                            emEditing ? "bg-primary/10 text-primary" : ""
                          }`}
                          onClick={handleEmEdit}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {(emResult?.body || emLoading) && !emEditing && (
                    <>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-muted-foreground w-12 shrink-0 font-medium">
                          From
                        </span>
                        <div className="flex items-center gap-1.5 text-foreground">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-3 w-3 text-primary" />
                          </div>
                          {selectedResume?.contact.name ?? "You"}{" "}
                          <span className="text-muted-foreground">
                            &lt;
                            {selectedResume?.contact.email ?? "you@email.com"}
                            &gt;
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-muted-foreground w-12 shrink-0 font-medium">
                          To
                        </span>
                        <div className="flex items-center gap-1.5 text-foreground">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                            <AtSign className="h-3 w-3 text-emerald-500" />
                          </div>
                          Recruiter{" "}
                          <span className="text-muted-foreground">
                            &lt;recruiting@
                            {(jobCompany || "company")
                              .toLowerCase()
                              .replace(/\s+/g, "")}
                            .com&gt;
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-muted-foreground w-12 shrink-0 font-medium">
                          Subject
                        </span>
                        <span className="font-medium text-foreground">
                          {emResult?.subject ||
                            `${jobTitle || "Position"} Application`}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-4">
                  {!emResult?.body && !emLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Send className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Generate a professional recruiter outreach email.
                      </p>
                    </div>
                  ) : emEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Subject
                        </label>
                        <input
                          value={emEditedSubject}
                          onChange={(e) => setEmEditedSubject(e.target.value)}
                          className="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Body
                        </label>
                        <Textarea
                          value={emEditedBody}
                          onChange={(e) => setEmEditedBody(e.target.value)}
                          rows={14}
                          className="text-xs font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {emLoading && !emResult?.body ? (
                        <StreamingText
                          text={undefined}
                          isStreaming={true}
                          className="text-sm"
                        />
                      ) : (
                        (emResult?.body ?? "")
                          .split("\n\n")
                          .map((paragraph, i) => (
                            <p
                              key={i}
                              className="text-xs leading-relaxed text-foreground/80"
                            >
                              {paragraph.split("\n").map((line, j) => (
                                <span key={j}>
                                  {line}
                                  {j < paragraph.split("\n").length - 1 && (
                                    <br />
                                  )}
                                </span>
                              ))}
                            </p>
                          ))
                      )}
                      {emLoading && emResult?.body && (
                        <StreamingText
                          text=""
                          isStreaming={true}
                          className="text-xs inline"
                        />
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
