"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Application, AutoApplyConfig } from "@/lib/jobs/types";

interface JobState {
  applications: Application[];
  autoApplyConfig: AutoApplyConfig;
  addApplication: (app: Application) => void;
  updateApplicationStatus: (
    id: string,
    status: Application["status"]
  ) => void;
  setAutoApplyConfig: (config: Partial<AutoApplyConfig>) => void;
}

export const useJobStore = create<JobState>()(
  persist(
    (set) => ({
      applications: [],
      autoApplyConfig: {
        enabled: false,
        targetRoles: [],
        preferredLocations: [],
        minSalary: 100000,
        remoteOnly: false,
      },
      addApplication: (app) =>
        set((state) => ({
          applications: [app, ...state.applications],
        })),
      updateApplicationStatus: (id, status) =>
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id
              ? { ...a, status, lastUpdated: new Date().toISOString() }
              : a
          ),
        })),
      setAutoApplyConfig: (config) =>
        set((state) => ({
          autoApplyConfig: { ...state.autoApplyConfig, ...config },
        })),
    }),
    { name: "hyr-jobs" }
  )
);
