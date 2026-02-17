export type JobCategory =
  | "engineering"
  | "design"
  | "marketing"
  | "finance"
  | "healthcare"
  | "legal"
  | "education"
  | "operations"
  | "sales"
  | "data"
  | "product"
  | "other";

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: "remote" | "onsite" | "hybrid";
  level: "junior" | "mid" | "senior" | "lead";
  category: JobCategory;
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string[];
  benefits: string[];
  tags: string[];
  postedDate: string;
  applicationDeadline?: string;
  coordinates?: { lat: number; lng: number };
}

export interface Application {
  id: string;
  jobId: string;
  job: Job;
  resumeId: string;
  resumeName: string;
  status: "applied" | "screening" | "interview" | "offer" | "rejected";
  appliedDate: string;
  lastUpdated: string;
  notes?: string;
  autoApplied: boolean;
}

export interface AutoApplyConfig {
  enabled: boolean;
  targetRoles: string[];
  preferredLocations: string[];
  minSalary: number;
  remoteOnly: boolean;
}
