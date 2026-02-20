"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Resume } from "@/lib/resume/types";
import { SAMPLE_RESUMES, MOCK_DATA_VERSION } from "@/data/mock";

interface ResumeState {
  resumes: Resume[];
  selectedResumeId: string | null;
  addResume: (resume: Resume) => void;
  updateResume: (id: string, updates: Partial<Resume>) => void;
  deleteResume: (id: string) => void;
  setSelectedResume: (id: string | null) => void;
  getResume: (id: string) => Resume | undefined;
}

const SAMPLE_IDS = new Set(SAMPLE_RESUMES.map((r) => r.id));

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      resumes: SAMPLE_RESUMES,
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
    {
      name: "hyr-resumes",
      version: MOCK_DATA_VERSION,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as ResumeState;
        if (version < MOCK_DATA_VERSION) {
          // Filter out both current sample UUIDs and legacy sample-N / resume-* IDs
          const userResumes = (state.resumes || []).filter(
            (r) =>
              !SAMPLE_IDS.has(r.id) &&
              !/^(sample-|resume-)/.test(r.id)
          );
          return {
            ...state,
            resumes: [...SAMPLE_RESUMES, ...userResumes],
          };
        }
        return state;
      },
    }
  )
);
