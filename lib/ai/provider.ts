import { Resume, TailoredResume, ATSScore } from "@/lib/resume/types";
import { Job } from "@/lib/jobs/types";

export interface AIProvider {
  tailorResume(
    resume: Resume,
    jobDescription: string,
    jobTitle: string,
    company: string
  ): Promise<TailoredResume>;
  scoreResume(resume: Resume): Promise<ATSScore>;
  extractJobDetails(description: string): Promise<{
    title: string;
    company: string;
    keywords: string[];
  }>;
}

export function getAIProvider(): AIProvider {
  // Future: check for API key and return real provider
  // For now, always return mock
  const { MockAIProvider } = require("./mock-provider");
  return new MockAIProvider();
}
