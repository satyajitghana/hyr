/**
 * Generates PDF with the FULL sample-1 data to check page count and timing.
 */
import fs from "fs";
import path from "path";
import { renderToBuffer, Font } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import React from "react";
import { ResumePDF } from "../components/resume/resume-pdf";

const cwd = process.cwd();
const fontsDir = path.join(cwd, "node_modules", "geist", "dist", "fonts");
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
Font.registerHyphenationCallback((w: string) => [w]);

const fullSample1 = {
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
    "Product-minded full-stack engineer with 7+ years of experience building SaaS platforms from zero-to-one and scaling mature products to millions of sessions per month. I partner deeply with product, design, and GTM teams to prioritize high-impact bets, instrument outcomes, and ship polished features that move conversion, retention, and revenue. Strong background in TypeScript, React, Node.js, and cloud infrastructure with a focus on performance, reliability, and maintainable architecture.",
  experience: [
    {
      id: "exp-1",
      title: "Senior Software Engineer",
      company: "TechCorp",
      location: "San Francisco, CA",
      startDate: "2023-01",
      endDate: "Present",
      bullets: [
        "Led end-to-end delivery of a real-time planning workspace used by 85K+ weekly active users; rollout increased team adoption by 34% within two quarters.",
        "Designed an event-driven service architecture (Node.js, Kafka, Postgres) that reduced median API latency by 58% and cut incident volume by 41% year-over-year.",
        "Partnered with product analytics to define success metrics and experimentation strategy, resulting in a 17% lift in trial-to-paid conversion for self-serve accounts.",
        "Mentored five engineers through design reviews, pairing, and growth plans; two promoted to senior level within 12 months.",
        "Introduced quality gates and contract testing across CI pipelines, increasing change confidence and reducing regression escapes by 63%.",
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
        "Built a customer-facing dashboard with React and TypeScript that processed $2M+ in monthly transactions and surfaced real-time account health for enterprise admins.",
        "Designed and implemented RESTful APIs using Node.js and PostgreSQL, handling 10K+ requests per minute while maintaining 99.95% uptime.",
        "Reduced page load time by 40% through code splitting, lazy loading, and image optimization, increasing weekly retention by 11%.",
        "Shipped role-based permissions and audit logs to satisfy SOC 2 customer requirements, unlocking expansion into mid-market accounts.",
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
        "Developed responsive web applications for 15+ clients using React, Vue.js, and modern CSS.",
        "Collaborated with design team to implement pixel-perfect UI components and animations.",
        "Set up reusable component libraries and coding standards that reduced delivery time for new client sites by 25%.",
      ],
    },
    {
      id: "exp-4",
      title: "Software Engineering Intern",
      company: "Atlassian",
      location: "San Francisco, CA",
      startDate: "2018-05",
      endDate: "2018-08",
      bullets: [
        "Built internal automation scripts for release QA that cut regression verification time from two days to under six hours.",
        "Implemented Jira Cloud UI improvements in React and TypeScript and partnered with designers to improve task creation completion rate by 8%.",
        "Presented internship capstone to engineering leadership and contributed production-ready code merged into the next quarterly release.",
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
  skills: ["React", "TypeScript", "Next.js", "Node.js", "Python", "PostgreSQL", "MongoDB", "AWS", "Docker", "Git", "GraphQL", "Tailwind CSS"],
  certifications: ["AWS Certified Developer - Associate"],
  createdAt: "2026-01-15T10:00:00Z",
  updatedAt: "2026-02-10T14:30:00Z",
};

const birdData =
  "data:image/png;base64," +
  fs.readFileSync(path.join(cwd, "public/birds/dithered/kestrelbird.png")).toString("base64");

async function main() {
  console.log("Warmup...");
  const warmupResume = { id: "w", name: "w", contact: { name: "W", email: "w@w", phone: "0", location: "W" }, summary: "W", experience: [], education: [], skills: [], certifications: [], createdAt: "", updatedAt: "" };
  await renderToBuffer(React.createElement(ResumePDF, { resume: warmupResume, fontFamily: "Geist", monoFamily: "GeistMono", birdImage: birdData }) as unknown as React.ReactElement<DocumentProps>);
  console.log("Warmup done.\n");

  console.log("Rendering full sample-1...");
  const t = Date.now();
  const buffer = await renderToBuffer(
    React.createElement(ResumePDF, {
      resume: fullSample1,
      fontFamily: "Geist",
      monoFamily: "GeistMono",
      birdImage: birdData,
    }) as unknown as React.ReactElement<DocumentProps>
  );
  console.log(`Done in ${Date.now() - t}ms, ${buffer.length} bytes`);

  const outPath = path.join(cwd, "scripts", "sample1-full.pdf");
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved: ${outPath}`);

  // Count pages by counting /Type /Page
  const pdf = buffer.toString("binary");
  const pageMatches = pdf.match(/\/Type\s*\/Page\b/g) || [];
  console.log(`\nPage count (approx): ${pageMatches.length}`);
}

main().catch(console.error);
