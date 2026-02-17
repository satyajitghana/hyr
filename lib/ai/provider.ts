import { Resume, TailoredResume, TailoredChange, ATSScore } from "@/lib/resume/types";
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
  generateCoverLetter(resume: Resume, job: Job): Promise<string>;
  generateRecruiterEmail(resume: Resume, job: Job): Promise<string>;
  refineChanges(
    prompt: string,
    currentChanges: TailoredChange[]
  ): Promise<TailoredChange[]>;
}

export function getAIProvider(): AIProvider {
  // Future: check for API key and return real provider
  // For now, always return mock
  const { MockAIProvider } = require("./mock-provider");
  return new MockAIProvider();
}
