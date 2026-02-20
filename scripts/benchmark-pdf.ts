/**
 * Standalone PDF generation benchmark.
 * Mirrors the logic in app/api/resume/pdf/route.ts so we can time each step.
 *
 * Run with: npx tsx scripts/benchmark-pdf.ts
 */
import fs from "fs";
import path from "path";
import { renderToBuffer } from "@react-pdf/renderer";
import { Font, type DocumentProps } from "@react-pdf/renderer";
import React from "react";
import { ResumePDF } from "../components/resume/resume-pdf";
import { getBirdForName } from "../lib/resume/birds";

const cwd = process.cwd();

// ── Font registration (same as route.ts) ──
const fontsDir = path.join(cwd, "node_modules", "geist", "dist", "fonts");
let usingGeist = false;
const geistRegularPath = path.join(fontsDir, "geist-sans", "Geist-Regular.ttf");

if (fs.existsSync(geistRegularPath)) {
  Font.register({
    family: "Geist",
    fonts: [
      { src: path.join(fontsDir, "geist-sans", "Geist-Regular.ttf"), fontWeight: 400 },
      { src: path.join(fontsDir, "geist-sans", "Geist-Medium.ttf"), fontWeight: 500 },
      { src: path.join(fontsDir, "geist-sans", "Geist-SemiBold.ttf"), fontWeight: 600 },
      { src: path.join(fontsDir, "geist-sans", "Geist-Bold.ttf"), fontWeight: 700 },
      { src: path.join(fontsDir, "geist-sans", "Geist-Italic.ttf"), fontWeight: 400, fontStyle: "italic" as const },
      { src: path.join(fontsDir, "geist-sans", "Geist-MediumItalic.ttf"), fontWeight: 500, fontStyle: "italic" as const },
      { src: path.join(fontsDir, "geist-sans", "Geist-SemiBoldItalic.ttf"), fontWeight: 600, fontStyle: "italic" as const },
      { src: path.join(fontsDir, "geist-sans", "Geist-BoldItalic.ttf"), fontWeight: 700, fontStyle: "italic" as const },
    ],
  });
  Font.register({
    family: "GeistMono",
    fonts: [
      { src: path.join(fontsDir, "geist-mono", "GeistMono-Regular.ttf"), fontWeight: 400 },
      { src: path.join(fontsDir, "geist-mono", "GeistMono-Medium.ttf"), fontWeight: 500 },
      { src: path.join(fontsDir, "geist-mono", "GeistMono-SemiBold.ttf"), fontWeight: 600 },
      { src: path.join(fontsDir, "geist-mono", "GeistMono-Bold.ttf"), fontWeight: 700 },
      { src: path.join(fontsDir, "geist-mono", "GeistMono-Italic.ttf"), fontWeight: 400, fontStyle: "italic" as const },
      { src: path.join(fontsDir, "geist-mono", "GeistMono-MediumItalic.ttf"), fontWeight: 500, fontStyle: "italic" as const },
      { src: path.join(fontsDir, "geist-mono", "GeistMono-SemiBoldItalic.ttf"), fontWeight: 600, fontStyle: "italic" as const },
      { src: path.join(fontsDir, "geist-mono", "GeistMono-BoldItalic.ttf"), fontWeight: 700, fontStyle: "italic" as const },
    ],
  });
  usingGeist = true;
  console.log("✓ Geist fonts registered");
} else {
  console.log("⚠ Geist not found, using Helvetica");
}
Font.registerHyphenationCallback((word) => [word]);

// ── Sample resume (Alex Johnson from mock data) ──
const sampleResume = {
  id: "sample-1",
  name: "Senior Product Engineer Resume",
  contact: {
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexjohnson",
    website: "alexjohnson.dev",
  },
  summary:
    "Product-minded full-stack engineer with 7+ years of experience building SaaS platforms.",
  experience: [
    {
      id: "exp-1",
      title: "Senior Software Engineer",
      company: "TechCorp",
      location: "San Francisco, CA",
      startDate: "2023-01",
      endDate: "Present",
      bullets: [
        "Led end-to-end delivery of a real-time planning workspace used by 85K+ weekly active users.",
        "Designed an event-driven service architecture that reduced median API latency by 58%.",
        "Partnered with product analytics to define success metrics, resulting in a 17% lift in conversion.",
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
        "Built a customer-facing dashboard with React and TypeScript processing $2M+ in monthly transactions.",
        "Designed and implemented RESTful APIs using Node.js and PostgreSQL, handling 10K+ requests per minute.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.S. Computer Science",
      school: "UC Berkeley",
      location: "Berkeley, CA",
      graduationDate: "2019-05",
      gpa: "3.8",
    },
  ],
  skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS", "Docker"],
  certifications: ["AWS Solutions Architect", "Google Cloud Professional"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

async function generatePdf(label: string, withBirdImage: boolean): Promise<number> {
  const t0 = Date.now();

  // Step 1: load bird image
  const t1 = Date.now();
  const bird = getBirdForName(sampleResume.contact.name);
  let birdImage: string | undefined;
  if (withBirdImage) {
    const ditheredPath = path.join(cwd, "public", "birds", "dithered", `${bird.name}.png`);
    try {
      const data = fs.readFileSync(ditheredPath);
      birdImage = `data:image/png;base64,${data.toString("base64")}`;
    } catch (e) {
      console.warn("  Bird load failed:", e);
    }
  }
  const t2 = Date.now();
  console.log(`  [${label}] bird load:       ${t2 - t1}ms  (bird=${bird.name})`);

  // Step 2: renderToBuffer
  const doc = React.createElement(ResumePDF, {
    resume: sampleResume,
    fontFamily: usingGeist ? "Geist" : "Helvetica",
    monoFamily: usingGeist ? "GeistMono" : undefined,
    birdImage,
  }) as unknown as React.ReactElement<DocumentProps>;

  const t3 = Date.now();
  const buffer = await renderToBuffer(doc);
  const t4 = Date.now();
  console.log(`  [${label}] renderToBuffer:  ${t4 - t3}ms  (${buffer.length} bytes)`);
  console.log(`  [${label}] TOTAL:           ${t4 - t0}ms`);

  return buffer.length;
}

async function main() {
  const outDir = path.join(cwd, "scripts");

  console.log("\n=== PDF Generation Benchmark ===\n");

  // ── Simulate the warmup IIFE from route.ts (uses actual ResumePDF component) ──
  console.log("Warmup render (simulating module-startup IIFE)...");
  const tw0 = Date.now();
  const warmupResume = {
    id: "_warmup", name: "_warmup",
    contact: { name: "W", email: "w@w", phone: "0", location: "W" },
    summary: "W",
    experience: [{ id: "w", title: "W", company: "W", location: "W", startDate: "W", endDate: "W", bullets: ["W"] }],
    education: [{ id: "w", degree: "W", school: "W", location: "W", graduationDate: "W" }],
    skills: ["W"], certifications: ["W"], createdAt: "", updatedAt: "",
  };
  // Preload bird cache (same as module-level birdCache in route.ts)
  const warmupBirdPath = path.join(cwd, "public", "birds", "dithered", "bluebird.png");
  const warmupBird = `data:image/png;base64,${fs.readFileSync(warmupBirdPath).toString("base64")}`;
  await renderToBuffer(
    React.createElement(ResumePDF, {
      resume: warmupResume,
      fontFamily: usingGeist ? "Geist" : "Helvetica",
      monoFamily: usingGeist ? "GeistMono" : undefined,
      birdImage: warmupBird,
    }) as unknown as React.ReactElement<DocumentProps>,
  );
  console.log(`  warmup took: ${Date.now() - tw0}ms\n`);

  // ── Run 1: first real request after warmup ──
  console.log("Run 1 (first real request — fonts pre-warmed):");
  await generatePdf("post-warmup-1", true);

  // ── Run 2: second request ──
  console.log("\nRun 2 (second request):");
  await generatePdf("post-warmup-2", true);

  // ── Run 3: third request ──
  console.log("\nRun 3 (third request):");
  await generatePdf("post-warmup-3", true);

  // ── Save PDF for visual inspection ──
  console.log("\nSaving PDF for inspection...");
  const bird = getBirdForName(sampleResume.contact.name);
  const ditheredPath = path.join(cwd, "public", "birds", "dithered", `${bird.name}.png`);
  const birdImage = `data:image/png;base64,${fs.readFileSync(ditheredPath).toString("base64")}`;

  const doc = React.createElement(ResumePDF, {
    resume: sampleResume,
    fontFamily: usingGeist ? "Geist" : "Helvetica",
    monoFamily: usingGeist ? "GeistMono" : undefined,
    birdImage,
  }) as unknown as React.ReactElement<DocumentProps>;

  const buffer = await renderToBuffer(doc);
  const outPath = path.join(outDir, "test-output.pdf");
  fs.writeFileSync(outPath, buffer);
  console.log(`\nSaved: ${outPath}`);
  console.log("Done.");
}

main().catch(console.error);
