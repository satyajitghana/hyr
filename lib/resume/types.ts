export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  graduationDate: string;
  gpa?: string;
}

export interface Resume {
  id: string;
  name: string;
  contact: ContactInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: string[];
  createdAt: string;
  updatedAt: string;
  /** Base64 data URI of a dithered profile image for PDF background */
  ditherImage?: string;
}

export interface TailoredChange {
  id: string;
  section: string;
  field: string;
  original: string;
  tailored: string;
  type: "addition" | "modification" | "removal";
  accepted: boolean;
}

export interface TailoredResume {
  originalId: string;
  resume: Resume;
  changes: TailoredChange[];
  jobTitle: string;
  company: string;
  matchScore: number;
}

export interface ATSSuggestion {
  id: string;
  category: "formatting" | "keywords" | "structure" | "readability";
  severity: "critical" | "warning" | "info";
  message: string;
  fix?: string;
  applied: boolean;
}

export interface ATSScore {
  overall: number;
  formatting: number;
  keywords: number;
  structure: number;
  readability: number;
  suggestions: ATSSuggestion[];
}
