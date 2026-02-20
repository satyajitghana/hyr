"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

const routeLabels: Record<string, string> = {
  app: "Dashboard",
  resume: "Resumes",
  tailor: "Tailor",
  jobs: "Jobs",
  applications: "Applications",
  "beast-mode": "Beast Mode",
  optimize: "ATS Optimize",
};

export function AppBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Remove the (app) group segment and the first "app" segment
  const relevantSegments = segments.filter(
    (s) => s !== "(app)"
  );

  // Build breadcrumb items
  const items: { label: string; href?: string }[] = [];

  for (let i = 0; i < relevantSegments.length; i++) {
    const segment = relevantSegments[i];
    const isLast = i === relevantSegments.length - 1;

    // Skip UUID segments and pure numeric IDs (job IDs) — show parent label only
    if (segment.match(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|\d+$)/)) {
      continue;
    }

    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const href = isLast ? undefined : "/" + relevantSegments.slice(0, i + 1).join("/");
    items.push({ label, href });
  }

  // If we're exactly at /app, just show "Dashboard"
  if (items.length <= 1) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
