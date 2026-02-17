import { AIProvider } from "./provider";
import {
  Resume,
  TailoredResume,
  TailoredChange,
  ATSScore,
  ATSSuggestion,
} from "@/lib/resume/types";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractKeywords(text: string): string[] {
  const commonKeywords = [
    "react",
    "typescript",
    "javascript",
    "python",
    "node.js",
    "aws",
    "docker",
    "kubernetes",
    "graphql",
    "rest",
    "api",
    "sql",
    "nosql",
    "mongodb",
    "postgresql",
    "redis",
    "git",
    "ci/cd",
    "agile",
    "scrum",
    "microservices",
    "cloud",
    "gcp",
    "azure",
    "terraform",
    "machine learning",
    "data analysis",
    "leadership",
    "communication",
    "problem-solving",
    "collaboration",
    "next.js",
    "tailwind",
    "figma",
    "swift",
    "java",
    "go",
    "rust",
  ];

  const lowerText = text.toLowerCase();
  return commonKeywords.filter((kw) => lowerText.includes(kw));
}

export class MockAIProvider implements AIProvider {
  async tailorResume(
    resume: Resume,
    jobDescription: string,
    jobTitle: string,
    company: string
  ): Promise<TailoredResume> {
    await delay(2000);

    const jobKeywords = extractKeywords(jobDescription);
    const existingSkills = resume.skills.map((s) => s.toLowerCase());
    const newSkills = jobKeywords.filter(
      (kw) => !existingSkills.includes(kw)
    );

    const changes: TailoredChange[] = [];

    // Modify summary
    const tailoredSummary = `Experienced professional with a proven track record in ${jobTitle.toLowerCase()} roles. ${resume.summary} Passionate about contributing to ${company}'s mission and leveraging expertise in ${jobKeywords.slice(0, 3).join(", ")} to drive results.`;

    changes.push({
      id: "change-summary",
      section: "summary",
      field: "summary",
      original: resume.summary,
      tailored: tailoredSummary,
      type: "modification",
      accepted: true,
    });

    // Add new skills
    newSkills.slice(0, 4).forEach((skill, idx) => {
      changes.push({
        id: `change-skill-${idx}`,
        section: "skills",
        field: skill,
        original: "",
        tailored: skill.charAt(0).toUpperCase() + skill.slice(1),
        type: "addition",
        accepted: true,
      });
    });

    // Modify first experience bullet
    if (resume.experience.length > 0 && resume.experience[0].bullets.length > 0) {
      const originalBullet = resume.experience[0].bullets[0];
      const tailoredBullet = `${originalBullet} Leveraged ${jobKeywords[0] || "technical"} expertise to deliver measurable impact aligned with ${company}'s objectives.`;
      changes.push({
        id: "change-exp-0",
        section: "experience",
        field: `${resume.experience[0].company} - Bullet 1`,
        original: originalBullet,
        tailored: tailoredBullet,
        type: "modification",
        accepted: true,
      });
    }

    const tailoredResume: Resume = {
      ...resume,
      summary: tailoredSummary,
      skills: [
        ...resume.skills,
        ...newSkills
          .slice(0, 4)
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
      ],
    };

    return {
      originalId: resume.id,
      resume: tailoredResume,
      changes,
      jobTitle,
      company,
      matchScore: 75 + Math.floor(Math.random() * 20),
    };
  }

  async scoreResume(resume: Resume): Promise<ATSScore> {
    await delay(1500);

    const suggestions: ATSSuggestion[] = [];

    // Check summary
    let structureScore = 80;
    if (!resume.summary || resume.summary.length < 50) {
      suggestions.push({
        id: "sug-summary-short",
        category: "structure",
        severity: "warning",
        message:
          "Your summary is too short. ATS systems prefer summaries of 50-200 words.",
        fix: "Expand your professional summary to include key skills and career highlights.",
        applied: false,
      });
      structureScore -= 15;
    }

    // Check skills
    let keywordsScore = 75;
    if (resume.skills.length < 5) {
      suggestions.push({
        id: "sug-skills-few",
        category: "keywords",
        severity: "critical",
        message:
          "You have fewer than 5 skills listed. Most ATS systems look for 8-15 relevant skills.",
        fix: "Add more relevant technical and soft skills to your resume.",
        applied: false,
      });
      keywordsScore -= 20;
    }

    if (resume.skills.length >= 5 && resume.skills.length < 10) {
      suggestions.push({
        id: "sug-skills-more",
        category: "keywords",
        severity: "info",
        message:
          "Consider adding more skills. Top-performing resumes typically have 10-15 skills.",
        applied: false,
      });
      keywordsScore -= 5;
    }

    // Check experience
    if (resume.experience.length === 0) {
      suggestions.push({
        id: "sug-no-exp",
        category: "structure",
        severity: "critical",
        message:
          "No work experience listed. This is a major red flag for ATS systems.",
        fix: "Add your work experience with detailed bullet points.",
        applied: false,
      });
      structureScore -= 30;
    }

    // Check for quantified achievements
    const hasBullets = resume.experience.some((e) => e.bullets.length > 0);
    if (!hasBullets) {
      suggestions.push({
        id: "sug-no-bullets",
        category: "readability",
        severity: "warning",
        message:
          "Your experience entries lack bullet points. ATS and recruiters prefer bulleted achievements.",
        fix: "Add 3-5 bullet points per role describing your key achievements.",
        applied: false,
      });
    }

    // Check education
    if (resume.education.length === 0) {
      suggestions.push({
        id: "sug-no-edu",
        category: "structure",
        severity: "warning",
        message: "No education section found. Consider adding your education background.",
        fix: "Add your educational qualifications.",
        applied: false,
      });
      structureScore -= 10;
    }

    // Check certifications
    if (resume.certifications.length === 0) {
      suggestions.push({
        id: "sug-no-certs",
        category: "keywords",
        severity: "info",
        message:
          "Consider adding certifications. They can significantly boost your ATS score.",
        applied: false,
      });
    }

    // Formatting suggestion
    suggestions.push({
      id: "sug-format",
      category: "formatting",
      severity: "info",
      message:
        "Ensure your resume uses a clean, single-column layout for best ATS compatibility.",
      applied: false,
    });

    const formattingScore = 85;
    const readabilityScore = hasBullets ? 80 : 60;
    const overall = Math.round(
      (formattingScore + keywordsScore + structureScore + readabilityScore) / 4
    );

    return {
      overall,
      formatting: formattingScore,
      keywords: keywordsScore,
      structure: structureScore,
      readability: readabilityScore,
      suggestions,
    };
  }

  async extractJobDetails(
    description: string
  ): Promise<{ title: string; company: string; keywords: string[] }> {
    await delay(500);

    const keywords = extractKeywords(description);

    // Simple heuristic extraction
    const lines = description.split("\n").filter((l) => l.trim());
    const title = lines[0]?.trim() || "Software Engineer";
    const company = lines[1]?.trim() || "Company";

    return { title, company, keywords };
  }
}
