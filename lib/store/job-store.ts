"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Application, AutoApplyConfig } from "@/lib/jobs/types";
import { SAMPLE_APPLICATIONS, MOCK_DATA_VERSION } from "@/data/mock";

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

const SAMPLE_APP_IDS = new Set(SAMPLE_APPLICATIONS.map((a) => a.id));

export const useJobStore = create<JobState>()(
  persist(
    (set) => ({
      applications: SAMPLE_APPLICATIONS,
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
    {
      name: "hyr-jobs",
      version: MOCK_DATA_VERSION,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as JobState;
        if (version < MOCK_DATA_VERSION) {
          const userApps = (state.applications || []).filter(
            (a) => !SAMPLE_APP_IDS.has(a.id)
          );
          return {
            ...state,
            applications: [...SAMPLE_APPLICATIONS, ...userApps],
          };
        }
        return state;
      },
    }
  )
);
