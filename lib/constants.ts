export const APP_NAME = "Hyr";
export const APP_DESCRIPTION =
  "AI-Powered Resume Optimization. Tailor your resume for every job.";

export const MARKETING_NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Testimonials", href: "#testimonials" },
] as const;

export const APP_NAV_ITEMS = [
  { label: "Dashboard", href: "/app", icon: "LayoutDashboard" },
  { label: "Resumes", href: "/app/resume", icon: "FileText" },
  { label: "Tailor", href: "/app/tailor", icon: "Wand2" },
  { label: "Compose", href: "/app/compose", icon: "PenLine" },
  { label: "Jobs", href: "/app/jobs", icon: "Briefcase" },
  { label: "Applications", href: "/app/applications", icon: "ClipboardList" },
] as const;

export const APPLICATION_STATUSES = [
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
