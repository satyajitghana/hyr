"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Resume } from "@/lib/resume/types";

interface ResumeState {
  resumes: Resume[];
  selectedResumeId: string | null;
  addResume: (resume: Resume) => void;
  updateResume: (id: string, updates: Partial<Resume>) => void;
  deleteResume: (id: string) => void;
  setSelectedResume: (id: string | null) => void;
  getResume: (id: string) => Resume | undefined;
}

const SAMPLE_RESUME: Resume = {
  id: "sample-1",
  name: "My Resume",
  contact: {
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexjohnson",
    website: "alexjohnson.dev",
  },
  summary:
    "Full-stack software engineer with 5+ years of experience building scalable web applications. Passionate about creating elegant user experiences and writing clean, maintainable code. Proven track record of delivering high-impact features in fast-paced startup environments.",
  experience: [
    {
      id: "exp-1",
      title: "Senior Software Engineer",
      company: "TechCorp",
      location: "San Francisco, CA",
      startDate: "2023-01",
      endDate: "Present",
      bullets: [
        "Led development of a real-time collaboration platform serving 50K+ daily active users, improving team productivity by 35%",
        "Architected and implemented a microservices migration that reduced API latency by 60% and improved system reliability to 99.9% uptime",
        "Mentored 4 junior engineers through code reviews, pair programming, and weekly 1-on-1s",
        "Introduced comprehensive testing strategy that increased code coverage from 45% to 92%",
      ],
    },
    {
      id: "exp-2",
      title: "Software Engineer",
      company: "StartupXYZ",
      location: "Remote",
      startDate: "2021-03",
      endDate: "2022-12",
      bullets: [
        "Built a customer-facing dashboard with React and TypeScript that processed $2M+ in monthly transactions",
        "Designed and implemented RESTful APIs using Node.js and PostgreSQL, handling 10K+ requests per minute",
        "Reduced page load time by 40% through code splitting, lazy loading, and image optimization",
      ],
    },
    {
      id: "exp-3",
      title: "Junior Developer",
      company: "WebAgency",
      location: "New York, NY",
      startDate: "2019-06",
      endDate: "2021-02",
      bullets: [
        "Developed responsive web applications for 15+ clients using React, Vue.js, and modern CSS",
        "Collaborated with design team to implement pixel-perfect UI components and animations",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.S. Computer Science",
      school: "University of California, Berkeley",
      location: "Berkeley, CA",
      graduationDate: "2019-05",
      gpa: "3.8",
    },
  ],
  skills: [
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "Python",
    "PostgreSQL",
    "MongoDB",
    "AWS",
    "Docker",
    "Git",
    "GraphQL",
    "Tailwind CSS",
  ],
  certifications: ["AWS Certified Developer - Associate"],
  createdAt: "2026-01-15T10:00:00Z",
  updatedAt: "2026-02-10T14:30:00Z",
};

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      resumes: [SAMPLE_RESUME],
      selectedResumeId: null,
      addResume: (resume) =>
        set((state) => ({ resumes: [...state.resumes, resume] })),
      updateResume: (id, updates) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          ),
        })),
      deleteResume: (id) =>
        set((state) => ({
          resumes: state.resumes.filter((r) => r.id !== id),
          selectedResumeId:
            state.selectedResumeId === id ? null : state.selectedResumeId,
        })),
      setSelectedResume: (id) => set({ selectedResumeId: id }),
      getResume: (id) => get().resumes.find((r) => r.id === id),
    }),
    { name: "hyr-resumes" }
  )
);
