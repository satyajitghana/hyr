import { z } from "zod";

// --- Job Extraction ---
export const jobDetailsSchema = z.object({
  title: z.string(),
  company: z.string(),
  keywords: z.array(z.string()),
});
export type JobDetailsOutput = z.infer<typeof jobDetailsSchema>;

// --- Tailored Change ---
export const tailoredChangeSchema = z.object({
  id: z.string(),
  section: z.string(),
  field: z.string(),
  original: z.string(),
  tailored: z.string(),
  type: z.enum(["addition", "modification", "removal"]),
  accepted: z.boolean(),
});
export type TailoredChangeOutput = z.infer<typeof tailoredChangeSchema>;

// --- Tailored Resume Result (streaming result for tailor) ---
export const tailoredResumeSchema = z.object({
  matchScore: z.number(),
  jobTitle: z.string(),
  company: z.string(),
  changes: z.array(tailoredChangeSchema),
});
export type TailoredResumeOutput = z.infer<typeof tailoredResumeSchema>;

// --- ATS Suggestion ---
export const atsSuggestionSchema = z.object({
  id: z.string(),
  category: z.enum(["formatting", "keywords", "structure", "readability"]),
  severity: z.enum(["critical", "warning", "info"]),
  message: z.string(),
  fix: z.string().optional(),
  applied: z.boolean(),
});

// --- ATS Score ---
export const atsScoreSchema = z.object({
  overall: z.number(),
  formatting: z.number(),
  keywords: z.number(),
  structure: z.number(),
  readability: z.number(),
  suggestions: z.array(atsSuggestionSchema),
});
export type ATSScoreOutput = z.infer<typeof atsScoreSchema>;

// --- Resume input for sending to API routes ---
export const resumeInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  contact: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
  }),
  summary: z.string(),
  experience: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      company: z.string(),
      location: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      bullets: z.array(z.string()),
    })
  ),
  education: z.array(
    z.object({
      id: z.string(),
      degree: z.string(),
      school: z.string(),
      location: z.string(),
      graduationDate: z.string(),
      gpa: z.string().optional(),
    })
  ),
  skills: z.array(z.string()),
  certifications: z.array(z.string()),
});
export type ResumeInput = z.infer<typeof resumeInputSchema>;

// --- Job input for cover letter / email routes ---
export const jobInputSchema = z.object({
  title: z.string(),
  company: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  requirements: z.array(z.string()).optional(),
});
export type JobInput = z.infer<typeof jobInputSchema>;

// --- Cover letter (structured output) ---
export const coverLetterSchema = z.object({
  content: z.string(),
});
export type CoverLetterOutput = z.infer<typeof coverLetterSchema>;

// --- Recruiter email (structured output) ---
export const recruiterEmailSchema = z.object({
  subject: z.string(),
  body: z.string(),
});
export type RecruiterEmailOutput = z.infer<typeof recruiterEmailSchema>;

// --- Easy Apply SSE event types ---
export type EasyApplyEvent =
  | { step: "extracting"; progress: number }
  | { step: "tailoring"; progress: number; jobDetails: JobDetailsOutput }
  | {
      step: "cover-letter";
      progress: number;
      tailored: TailoredResumeOutput;
    }
  | { step: "email"; progress: number; coverLetter: string }
  | { step: "done"; progress: number; recruiterEmail: RecruiterEmailOutput }
  | { step: "error"; progress: number; error: string };
