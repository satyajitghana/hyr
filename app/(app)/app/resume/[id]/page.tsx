"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Save,
  Shield,
  Wand2,
  Plus,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useResumeStore } from "@/lib/store/resume-store";
import Link from "next/link";

export default function ResumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { resumes, updateResume } = useResumeStore();
  const resume = resumes.find((r) => r.id === id);
  const [editing, setEditing] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [downloading, setDownloading] = useState(false);

  if (!resume) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-muted-foreground">Resume not found.</p>
        <Button variant="link" onClick={() => router.push("/app/resume")}>
          Back to Resumes
        </Button>
      </div>
    );
  }

  const handleSummaryUpdate = (summary: string) => {
    updateResume(id, { summary });
    setEditing(null);
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      updateResume(id, { skills: [...resume.skills, newSkill.trim()] });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    updateResume(id, { skills: resume.skills.filter((s) => s !== skill) });
  };

  const handleDownloadPDF = async () => {
    if (!resume) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/resume/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume.contact.name.replace(/\s+/g, "_")}_Resume.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/app/resume")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold">{resume.name}</h1>
            <p className="text-sm text-muted-foreground">
              Last updated {new Date(resume.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            PDF
          </Button>
          <Link href={`/app/resume/${id}/optimize`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Shield className="h-4 w-4" />
              ATS Optimize
            </Button>
          </Link>
          <Link href="/app/tailor">
            <Button size="sm" className="gap-2">
              <Wand2 className="h-4 w-4" />
              Tailor
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {resume.contact.email}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {resume.contact.phone}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {resume.contact.location}
            </div>
            {resume.contact.linkedin && (
              <div className="flex items-center gap-2 text-sm">
                <Linkedin className="h-4 w-4 text-muted-foreground" />
                {resume.contact.linkedin}
              </div>
            )}
            {resume.contact.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                {resume.contact.website}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-lg">Summary</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(editing === "summary" ? null : "summary")}
          >
            {editing === "summary" ? "Cancel" : "Edit"}
          </Button>
        </CardHeader>
        <CardContent>
          {editing === "summary" ? (
            <div className="space-y-2">
              <Textarea
                defaultValue={resume.summary}
                rows={4}
                id="summary-edit"
              />
              <Button
                size="sm"
                onClick={() => {
                  const el = document.getElementById("summary-edit") as HTMLTextAreaElement;
                  if (el) handleSummaryUpdate(el.value);
                }}
                className="gap-2"
              >
                <Save className="h-3 w-3" />
                Save
              </Button>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {resume.summary}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {resume.experience.map((exp, idx) => (
            <div key={exp.id}>
              {idx > 0 && <Separator className="mb-6" />}
              <div className="flex justify-between">
                <div>
                  <h4 className="font-semibold">{exp.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {exp.company} &middot; {exp.location}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {exp.startDate} — {exp.endDate}
                  </p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5">
                {exp.bullets.map((bullet, bIdx) => (
                  <li
                    key={bIdx}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Education</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {resume.education.map((edu) => (
            <div key={edu.id}>
              <h4 className="font-semibold">{edu.degree}</h4>
              <p className="text-sm text-muted-foreground">
                {edu.school} &middot; {edu.location}
              </p>
              <p className="text-xs text-muted-foreground">
                Graduated {edu.graduationDate}
                {edu.gpa && ` &middot; GPA: ${edu.gpa}`}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="cursor-pointer group gap-1"
                onClick={() => removeSkill(skill)}
              >
                {skill}
                <Trash2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-destructive" />
              </Badge>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Add a skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              className="max-w-xs"
            />
            <Button variant="outline" size="sm" onClick={addSkill}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      {resume.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {resume.certifications.map((cert) => (
                <li key={cert} className="text-sm text-muted-foreground">
                  {cert}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
