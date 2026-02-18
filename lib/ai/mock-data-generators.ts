import type { ResumeInput, JobInput } from "./schemas";

const COMMON_KEYWORDS = [
  // Engineering / Tech
  "react", "typescript", "javascript", "python", "node.js", "aws", "docker",
  "kubernetes", "graphql", "rest", "api", "sql", "nosql", "mongodb",
  "postgresql", "redis", "git", "ci/cd", "agile", "scrum", "microservices",
  "cloud", "gcp", "azure", "terraform", "machine learning", "next.js",
  "tailwind", "figma", "swift", "java", "go", "rust", "c++",
  // Finance
  "financial modeling", "excel", "accounting", "gaap", "ifrs", "audit",
  "budgeting", "forecasting", "valuation", "m&a", "due diligence",
  "bloomberg", "cpa", "cfa", "financial analysis", "investment banking",
  // Marketing
  "seo", "sem", "content marketing", "social media", "brand strategy",
  "analytics", "copywriting", "google analytics", "hubspot", "campaign management",
  "market research", "digital marketing", "email marketing",
  // Healthcare
  "patient care", "hipaa", "clinical trials", "emr", "nursing", "cpr",
  "bls", "acls", "clinical research", "fda", "healthcare",
  // Legal
  "contract review", "litigation", "compliance", "legal research",
  "corporate law", "paralegal", "regulatory",
  // Education
  "curriculum development", "instructional design", "assessment", "lms",
  "e-learning", "adult learning", "training",
  // Sales
  "crm", "pipeline management", "negotiation", "b2b", "saas sales",
  "enterprise sales", "cold calling", "salesforce", "quota",
  // Operations
  "supply chain", "logistics", "erp", "six sigma", "operations management",
  "inventory management", "procurement",
  // Data
  "data analysis", "data science", "statistics", "a/b testing",
  "visualization", "tableau", "power bi", "r",
  // General
  "project management", "presentation", "leadership", "communication",
  "problem-solving", "collaboration", "teamwork", "stakeholder management",
];

export function extractKeywords(text: string): string[] {
  const lowerText = text.toLowerCase();
  return COMMON_KEYWORDS.filter((kw) => lowerText.includes(kw));
}

export function generateMockJobDetails(description: string) {
  const keywords = extractKeywords(description);
  const lines = description.split("\n").filter((l) => l.trim());
  const title = lines[0]?.trim() || "Software Engineer";
  const company = lines[1]?.trim() || "Company";
  return { title, company, keywords };
}

export function generateMockTailoredResume(
  resume: ResumeInput,
  jobDescription: string,
  jobTitle: string,
  company: string
) {
  const jobKeywords = extractKeywords(jobDescription);
  const existingSkills = resume.skills.map((s) => s.toLowerCase());
  const newSkills = jobKeywords.filter(
    (kw) => !existingSkills.includes(kw)
  );

  const changes: Array<{
    id: string;
    section: string;
    field: string;
    original: string;
    tailored: string;
    type: "addition" | "modification" | "removal";
    accepted: boolean;
  }> = [];

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
  if (
    resume.experience.length > 0 &&
    resume.experience[0].bullets.length > 0
  ) {
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

  return {
    matchScore: 75 + Math.floor(Math.random() * 20),
    jobTitle,
    company,
    changes,
  };
}

export function generateMockATSScore(resume: ResumeInput) {
  const suggestions: Array<{
    id: string;
    category: "formatting" | "keywords" | "structure" | "readability";
    severity: "critical" | "warning" | "info";
    message: string;
    fix?: string;
    applied: boolean;
  }> = [];

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

  if (resume.education.length === 0) {
    suggestions.push({
      id: "sug-no-edu",
      category: "structure",
      severity: "warning",
      message:
        "No education section found. Consider adding your education background.",
      fix: "Add your educational qualifications.",
      applied: false,
    });
    structureScore -= 10;
  }

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

export function generateMockRefinedChanges(
  prompt: string,
  currentChanges: Array<{
    id: string;
    section: string;
    field: string;
    original: string;
    tailored: string;
    type: "addition" | "modification" | "removal";
    accepted: boolean;
  }>
) {
  const lowerPrompt = prompt.toLowerCase();
  const refinedChanges = currentChanges.map((c) => ({ ...c }));

  if (lowerPrompt.includes("concise") || lowerPrompt.includes("shorter")) {
    refinedChanges.forEach((change) => {
      if (change.type === "modification" && change.tailored.length > 100) {
        const sentences = change.tailored.split(". ");
        change.tailored =
          sentences.slice(0, Math.ceil(sentences.length / 2)).join(". ") + ".";
      }
    });
  }

  if (
    lowerPrompt.includes("metric") ||
    lowerPrompt.includes("number") ||
    lowerPrompt.includes("quantif")
  ) {
    refinedChanges.push({
      id: `change-refine-${Date.now()}`,
      section: "experience",
      field: "Added Metrics",
      original: "",
      tailored:
        "Quantified key achievements with specific metrics: revenue impact, team size, percentage improvements, and cost savings.",
      type: "addition",
      accepted: true,
    });
  }

  if (
    lowerPrompt.includes("leadership") ||
    lowerPrompt.includes("lead")
  ) {
    refinedChanges.push({
      id: `change-refine-${Date.now()}`,
      section: "summary",
      field: "Leadership Emphasis",
      original: "",
      tailored:
        "Demonstrated leadership through cross-functional team management, mentorship of junior team members, and strategic initiative ownership.",
      type: "addition",
      accepted: true,
    });
  }

  if (
    lowerPrompt.includes("technical") ||
    lowerPrompt.includes("jargon")
  ) {
    refinedChanges.forEach((change) => {
      if (change.type === "modification") {
        change.tailored = change.tailored
          .replace(/microservices/gi, "service-based")
          .replace(/distributed systems/gi, "large-scale systems")
          .replace(/CI\/CD/gi, "automated deployment");
      }
    });
  }

  return refinedChanges;
}

export function generateMockCoverLetter(
  resume: ResumeInput,
  job: JobInput
) {
  const topSkills = resume.skills.slice(0, 3).join(", ");
  const latestRole = resume.experience[0];

  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}. With my background in ${topSkills} and ${resume.experience.length}+ years of professional experience, I am confident I would be a valuable addition to your team.

${latestRole ? `In my current role as ${latestRole.title} at ${latestRole.company}, ${latestRole.bullets[0]?.toLowerCase() || "I have consistently delivered impactful results"}.` : "Throughout my career, I have consistently delivered impactful results."}

What excites me most about ${job.company} is the opportunity to ${job.description.split(".")[0].toLowerCase()}. I am particularly drawn to your focus on ${job.tags.slice(0, 2).join(" and ")}, which aligns perfectly with my expertise and career goals.

${resume.certifications.length > 0 ? `I also hold relevant certifications including ${resume.certifications[0]}, which further demonstrates my commitment to professional excellence.` : "I am committed to continuous learning and professional development, which I believe is essential in today's rapidly evolving landscape."}

I would welcome the opportunity to discuss how my skills and experience align with your team's needs. Thank you for considering my application.

Best regards,
${resume.contact.name}
${resume.contact.email}
${resume.contact.phone}`;
}

export function generateMockRecruiterEmail(
  resume: ResumeInput,
  job: JobInput
) {
  const firstName = resume.contact.name.split(" ")[0];

  return {
    subject: `${job.title} Application — ${resume.contact.name}`,
    body: `Hi there,

I recently came across the ${job.title} opening at ${job.company} and I'm very excited about the opportunity. I've attached my tailored resume and cover letter for your review.

A bit about me: I'm ${resume.summary.split(".")[0].toLowerCase()}. ${resume.experience[0] ? `Currently, I'm working as ${resume.experience[0].title} at ${resume.experience[0].company}.` : ""}

I'd love to chat about how my experience with ${resume.skills.slice(0, 3).join(", ")} could contribute to the team. Would you have 15-20 minutes this week for a quick call?

Looking forward to hearing from you!

Best,
${firstName}
${resume.contact.email}${resume.contact.linkedin ? `\nLinkedIn: ${resume.contact.linkedin}` : ""}`,
  };
}
