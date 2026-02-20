"use client";

import { use, useState, useRef, useEffect } from "react";
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
  ImagePlus,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { useResumeStore } from "@/lib/store/resume-store";
import { ContactInfo, Experience, Education } from "@/lib/resume/types";
import { processImageToDither } from "@/lib/resume/dither";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

// react-pdf (pdfjs-dist) uses DOMMatrix at module-level — crashes SSR.
// ssr: false prevents the module from loading on the server entirely.
const ResumePdfViewer = dynamic(
  () => import("@/components/resume/pdf-viewer").then((m) => m.ResumePdfViewer),
  { ssr: false },
);

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
  const [contactDraft, setContactDraft] = useState<ContactInfo | null>(null);
  const [expDraft, setExpDraft] = useState<Experience | null>(null);
  const [eduDraft, setEduDraft] = useState<Education | null>(null);
  const [certsDraft, setCertsDraft] = useState<string[] | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [skillOpen, setSkillOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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

  const PRESET_SKILLS = [
    "React", "TypeScript", "JavaScript", "Node.js", "Python", "Go", "Java", "Rust",
    "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "CI/CD",
    "PostgreSQL", "MongoDB", "Redis", "DynamoDB", "MySQL",
    "GraphQL", "REST APIs", "gRPC", "Kafka", "RabbitMQ",
    "Next.js", "Vue.js", "Angular", "Tailwind CSS", "CSS", "HTML",
    "Git", "GitHub", "Linux", "Figma", "Product Management", "Agile", "Scrum",
  ];

  const openEdit = (section: string) => {
    setContactDraft(null);
    setExpDraft(null);
    setEduDraft(null);
    setCertsDraft(null);
    setNameDraft("");
    setEditing(section);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessingImage(true);
    try {
      const ditherImage = await processImageToDither(file);
      updateResume(id, { ditherImage });
    } catch (err) {
      console.error("Failed to process image:", err);
    } finally {
      setProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    updateResume(id, { ditherImage: undefined });
  };

  const handleDownloadPDF = async () => {
    if (!resume) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/resume/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume,
          ditherImage: resume.ditherImage,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("PDF generation failed:", err);
        alert(`PDF generation failed: ${err.details || err.error}`);
        return;
      }
      const arrayBuffer = await res.arrayBuffer();
      const pdfText = new TextDecoder("latin1").decode(arrayBuffer);
      const pageCount = (pdfText.match(/\/Type\s*\/Page\b/g) ?? []).length;
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      if (pageCount > 1) {
        toast.warning(`Resume is ${pageCount} pages — aim for 1 page for best results.`, { duration: 6000 });
      }
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

  const handleTogglePreview = async () => {
    if (previewing) {
      setPreviewing(false);
      return;
    }
    setLoadingPreview(true);
    try {
      const res = await fetch("/api/resume/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, ditherImage: resume.ditherImage }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("PDF preview failed:", err);
        return;
      }
      const arrayBuffer = await res.arrayBuffer();
      const pdfText = new TextDecoder("latin1").decode(arrayBuffer);
      const pageCount = (pdfText.match(/\/Type\s*\/Page\b/g) ?? []).length;
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      if (pageCount > 1) {
        toast.warning(`Resume is ${pageCount} pages — aim for 1 page for best results.`, { duration: 6000 });
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewing(true);
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <div className="space-y-6">
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
            {editing === "name" ? (
              <div className="flex items-center gap-2">
                <Input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="font-display text-xl font-bold h-9 max-w-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { updateResume(id, { name: nameDraft }); setEditing(null); }
                    if (e.key === "Escape") setEditing(null);
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={() => { updateResume(id, { name: nameDraft }); setEditing(null); }} className="gap-1.5">
                  <Save className="h-3 w-3" />
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            ) : (
              <h1
                className="font-display text-3xl font-bold tracking-tight cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => { setNameDraft(resume.name); openEdit("name"); }}
                title="Click to edit"
              >
                {resume.name}
              </h1>
            )}
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
            onClick={handleTogglePreview}
            disabled={loadingPreview}
          >
            {loadingPreview ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : previewing ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {previewing ? "Hide Preview" : "Preview"}
          </Button>
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

      {/* PDF Preview Panel */}
      {previewing && previewUrl && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-muted/30 p-2 overflow-hidden"
        >
          <div className="flex items-center justify-between px-2 pb-2">
            <p className="text-sm font-medium text-muted-foreground">PDF Preview</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => setPreviewing(false)}
            >
              <X className="h-3.5 w-3.5" />
              Close
            </Button>
          </div>
          <div
            className="w-full rounded-lg border bg-white"
            style={{ height: "80vh" }}
          >
            <ResumePdfViewer url={previewUrl} />
          </div>
        </motion.div>
      )}

      {/* Profile Photo for PDF */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Profile Photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {resume.ditherImage ? (
              <div className="relative group">
                <Image
                  src={resume.ditherImage}
                  alt="Dithered profile"
                  width={80}
                  height={80}
                  unoptimized
                  className="h-20 w-20 rounded-lg border object-cover"
                  style={{ imageRendering: "pixelated" }}
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20">
                <ImagePlus className="h-6 w-6 text-muted-foreground/30" />
              </div>
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {resume.ditherImage
                  ? "Dithered photo applied"
                  : "Add a photo for your PDF"}
              </p>
              <p className="text-xs text-muted-foreground">
                Your photo will be converted to a halftone dither pattern and
                used as a subtle watermark in the PDF header.
              </p>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={processingImage}
                >
                  {processingImage ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ImagePlus className="h-3.5 w-3.5" />
                  )}
                  {resume.ditherImage ? "Replace" : "Upload"}
                </Button>
                {resume.ditherImage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-destructive"
                    onClick={handleRemoveImage}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="font-display text-lg">Contact Information</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (editing === "contact") { setEditing(null); setContactDraft(null); }
              else { setContactDraft({ ...resume.contact }); openEdit("contact"); }
            }}
          >
            {editing === "contact" ? "Cancel" : <><Plus className="h-3.5 w-3.5 mr-1" />Edit</>}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {editing === "contact" ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                {([
                  { field: "name" as keyof ContactInfo, label: "Full Name" },
                  { field: "email" as keyof ContactInfo, label: "Email" },
                  { field: "phone" as keyof ContactInfo, label: "Phone" },
                  { field: "location" as keyof ContactInfo, label: "Location" },
                  { field: "linkedin" as keyof ContactInfo, label: "LinkedIn" },
                  { field: "website" as keyof ContactInfo, label: "Website" },
                ] as const).map(({ field, label }) => (
                  <div key={field}>
                    <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                    <Input
                      placeholder={label}
                      value={(contactDraft as ContactInfo)?.[field] ?? ""}
                      onChange={(e) =>
                        setContactDraft((prev) => prev ? { ...prev, [field]: e.target.value } : prev)
                      }
                    />
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                onClick={() => {
                  if (contactDraft) updateResume(id, { contact: contactDraft });
                  setEditing(null);
                  setContactDraft(null);
                }}
                className="gap-2"
              >
                <Save className="h-3 w-3" />
                Save Changes
              </Button>
            </div>
          ) : (
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
          )}
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
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="font-display text-lg">Experience</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              const newExp: Experience = {
                id: crypto.randomUUID(),
                title: "",
                company: "",
                location: "",
                startDate: "",
                endDate: "Present",
                bullets: [],
              };
              updateResume(id, { experience: [...resume.experience, newExp] });
              setExpDraft(newExp);
              openEdit(`exp-${newExp.id}`);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {resume.experience.map((exp, idx) => (
            <div key={exp.id}>
              {idx > 0 && <Separator className="mb-6" />}
              {editing === `exp-${exp.id}` ? (
                <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input placeholder="Job Title" value={expDraft?.title ?? ""}
                      onChange={(e) => setExpDraft(d => d ? {...d, title: e.target.value} : d)} />
                    <Input placeholder="Company" value={expDraft?.company ?? ""}
                      onChange={(e) => setExpDraft(d => d ? {...d, company: e.target.value} : d)} />
                    <Input placeholder="Location" value={expDraft?.location ?? ""}
                      onChange={(e) => setExpDraft(d => d ? {...d, location: e.target.value} : d)} />
                    <div className="flex gap-2">
                      <Input placeholder="Start (YYYY-MM)" value={expDraft?.startDate ?? ""}
                        onChange={(e) => setExpDraft(d => d ? {...d, startDate: e.target.value} : d)} />
                      <Input placeholder="End Date" value={expDraft?.endDate ?? ""}
                        onChange={(e) => setExpDraft(d => d ? {...d, endDate: e.target.value} : d)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {expDraft?.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex gap-2">
                        <Textarea value={bullet} rows={2}
                          onChange={(e) => setExpDraft(d => d ? {
                            ...d, bullets: d.bullets.map((b, i) => i === bIdx ? e.target.value : b)
                          } : d)} className="flex-1 text-sm" />
                        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-destructive self-start mt-0.5"
                          onClick={() => setExpDraft(d => d ? {...d, bullets: d.bullets.filter((_, i) => i !== bIdx)} : d)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="gap-1.5"
                      onClick={() => setExpDraft(d => d ? {...d, bullets: [...d.bullets, ""]} : d)}>
                      <Plus className="h-3.5 w-3.5" />Add bullet
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-2"
                      onClick={() => {
                        if (!expDraft) return;
                        updateResume(id, { experience: resume.experience.map(e => e.id === expDraft.id ? expDraft : e) });
                        setEditing(null); setExpDraft(null);
                      }}>
                      <Save className="h-3 w-3" />Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(null); setExpDraft(null); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{exp.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {exp.company} &middot; {exp.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {exp.startDate} — {exp.endDate}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => { setExpDraft({ ...exp }); openEdit(`exp-${exp.id}`); }}>
                        <Save className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                        onClick={() => updateResume(id, { experience: resume.experience.filter(e => e.id !== exp.id) })}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="font-display text-lg">Education</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              const newEdu: Education = {
                id: crypto.randomUUID(),
                degree: "",
                school: "",
                location: "",
                graduationDate: "",
                gpa: "",
              };
              updateResume(id, { education: [...resume.education, newEdu] });
              setEduDraft(newEdu);
              openEdit(`edu-${newEdu.id}`);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {resume.education.map((edu, idx) => (
            <div key={edu.id}>
              {idx > 0 && <Separator className="mb-4" />}
              {editing === `edu-${edu.id}` ? (
                <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input placeholder="Degree" value={eduDraft?.degree ?? ""}
                      onChange={(e) => setEduDraft(d => d ? {...d, degree: e.target.value} : d)} />
                    <Input placeholder="School" value={eduDraft?.school ?? ""}
                      onChange={(e) => setEduDraft(d => d ? {...d, school: e.target.value} : d)} />
                    <Input placeholder="Location" value={eduDraft?.location ?? ""}
                      onChange={(e) => setEduDraft(d => d ? {...d, location: e.target.value} : d)} />
                    <Input placeholder="Graduation Date (YYYY-MM)" value={eduDraft?.graduationDate ?? ""}
                      onChange={(e) => setEduDraft(d => d ? {...d, graduationDate: e.target.value} : d)} />
                    <Input placeholder="GPA (optional)" value={eduDraft?.gpa ?? ""}
                      onChange={(e) => setEduDraft(d => d ? {...d, gpa: e.target.value} : d)} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-2"
                      onClick={() => {
                        if (!eduDraft) return;
                        updateResume(id, { education: resume.education.map(e => e.id === eduDraft.id ? eduDraft : e) });
                        setEditing(null); setEduDraft(null);
                      }}>
                      <Save className="h-3 w-3" />Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(null); setEduDraft(null); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{edu.degree}</h4>
                      <p className="text-sm text-muted-foreground">
                        {edu.school} &middot; {edu.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Graduated {edu.graduationDate}
                        {edu.gpa && ` · GPA: ${edu.gpa}`}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => { setEduDraft({ ...edu }); openEdit(`edu-${edu.id}`); }}>
                        <Save className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                        onClick={() => updateResume(id, { education: resume.education.filter(e => e.id !== edu.id) })}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
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
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full hover:bg-muted-foreground/20 transition-colors"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <Popover open={skillOpen} onOpenChange={setSkillOpen}>
            <PopoverTrigger asChild>
              <div className="mt-3 flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => {
                    setNewSkill(e.target.value);
                    setSkillOpen(e.target.value.length > 0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { addSkill(); setSkillOpen(false); }
                    if (e.key === "Escape") setSkillOpen(false);
                  }}
                  className="max-w-xs"
                />
                <Button variant="outline" size="sm" onClick={() => { addSkill(); setSkillOpen(false); }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
              <Command>
                <CommandList>
                  <CommandEmpty>No matching skills.</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                    {PRESET_SKILLS
                      .filter((s) => s.toLowerCase().includes(newSkill.toLowerCase()) && !resume.skills.includes(s))
                      .slice(0, 8)
                      .map((skill) => (
                        <CommandItem
                          key={skill}
                          onSelect={() => {
                            updateResume(id, { skills: [...resume.skills, skill] });
                            setNewSkill("");
                            setSkillOpen(false);
                          }}
                        >
                          {skill}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="font-display text-lg">Certifications</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (editing === "cert") { setEditing(null); setCertsDraft(null); }
              else { setCertsDraft([...resume.certifications]); openEdit("cert"); }
            }}
          >
            {editing === "cert" ? "Cancel" : <><Plus className="h-3.5 w-3.5 mr-1" />Edit</>}
          </Button>
        </CardHeader>
        <CardContent>
          {editing === "cert" ? (
            <div className="space-y-2">
              {certsDraft?.map((cert, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input value={cert}
                    onChange={(e) => setCertsDraft(d => d ? d.map((c, i) => i === idx ? e.target.value : c) : d)} />
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive shrink-0"
                    onClick={() => setCertsDraft(d => d ? d.filter((_, i) => i !== idx) : d)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1.5"
                onClick={() => setCertsDraft(d => d ? [...d, ""] : d)}>
                <Plus className="h-3.5 w-3.5" />Add certification
              </Button>
              <Button size="sm" className="gap-2 mt-1"
                onClick={() => {
                  if (certsDraft) updateResume(id, { certifications: certsDraft.filter(c => c.trim()) });
                  setEditing(null); setCertsDraft(null);
                }}>
                <Save className="h-3 w-3" />Save
              </Button>
            </div>
          ) : (
            <ul className="space-y-1">
              {resume.certifications.length > 0 ? (
                resume.certifications.map((cert) => (
                  <li key={cert} className="text-sm text-muted-foreground">
                    {cert}
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground italic">No certifications added yet.</li>
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
