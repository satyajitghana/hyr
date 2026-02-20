import fs from "fs";
import path from "path";
import { renderToBuffer, Font } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import React from "react";
import { ResumePDF } from "/home/user/hyr/components/resume/resume-pdf";

const cwd = "/home/user/hyr";
const fontsDir = path.join(cwd, "node_modules", "geist", "dist", "fonts");
Font.register({ family: "Geist", fonts: [
  { src: fontsDir+"/geist-sans/Geist-Regular.ttf", fontWeight: 400 },
  { src: fontsDir+"/geist-sans/Geist-Medium.ttf", fontWeight: 500 },
  { src: fontsDir+"/geist-sans/Geist-SemiBold.ttf", fontWeight: 600 },
  { src: fontsDir+"/geist-sans/Geist-Bold.ttf", fontWeight: 700 },
  { src: fontsDir+"/geist-sans/Geist-Italic.ttf", fontWeight: 400, fontStyle: "italic" as const },
  { src: fontsDir+"/geist-sans/Geist-MediumItalic.ttf", fontWeight: 500, fontStyle: "italic" as const },
  { src: fontsDir+"/geist-sans/Geist-SemiBoldItalic.ttf", fontWeight: 600, fontStyle: "italic" as const },
  { src: fontsDir+"/geist-sans/Geist-BoldItalic.ttf", fontWeight: 700, fontStyle: "italic" as const },
]});
Font.register({ family: "GeistMono", fonts: [
  { src: fontsDir+"/geist-mono/GeistMono-Regular.ttf", fontWeight: 400 },
  { src: fontsDir+"/geist-mono/GeistMono-Medium.ttf", fontWeight: 500 },
  { src: fontsDir+"/geist-mono/GeistMono-SemiBold.ttf", fontWeight: 600 },
  { src: fontsDir+"/geist-mono/GeistMono-Bold.ttf", fontWeight: 700 },
  { src: fontsDir+"/geist-mono/GeistMono-Italic.ttf", fontWeight: 400, fontStyle: "italic" as const },
  { src: fontsDir+"/geist-mono/GeistMono-MediumItalic.ttf", fontWeight: 500, fontStyle: "italic" as const },
  { src: fontsDir+"/geist-mono/GeistMono-SemiBoldItalic.ttf", fontWeight: 600, fontStyle: "italic" as const },
  { src: fontsDir+"/geist-mono/GeistMono-BoldItalic.ttf", fontWeight: 700, fontStyle: "italic" as const },
]});
Font.registerHyphenationCallback((w: string) => [w]);

const birdData = "data:image/png;base64," + fs.readFileSync(path.join(cwd, "public/birds/dithered/kestrelbird.png")).toString("base64");

const BULLETS_5 = [
  "Led end-to-end delivery of a real-time planning workspace used by 85K+ weekly active users; rollout increased team adoption by 34% within two quarters.",
  "Designed an event-driven service architecture (Node.js, Kafka, Postgres) that reduced median API latency by 58% and cut incident volume by 41% year-over-year.",
  "Partnered with product analytics to define success metrics and experimentation strategy, resulting in a 17% lift in trial-to-paid conversion for self-serve accounts.",
  "Mentored five engineers through design reviews, pairing, and growth plans; two promoted to senior level within 12 months.",
  "Introduced quality gates and contract testing across CI pipelines, increasing change confidence and reducing regression escapes by 63%.",
];

const makeResume = (numExp: number) => ({
  id: "test", name: "test",
  contact: { name: "Alex Johnson", email: "alex.johnson@email.com", phone: "(555) 123-4567", location: "San Francisco, CA", linkedin: "linkedin.com/in/alexjohnson", website: "alexjohnson.dev" },
  summary: "Product-minded full-stack engineer with 7+ years of experience building SaaS platforms from zero-to-one and scaling mature products to millions of sessions per month. I partner deeply with product, design, and GTM teams to prioritize high-impact bets, instrument outcomes, and ship polished features that move conversion, retention, and revenue. Strong background in TypeScript, React, Node.js, and cloud infrastructure with a focus on performance, reliability, and maintainable architecture.",
  experience: Array.from({length: numExp}, (_, i) => ({
    id: `exp-${i}`, title: `Software Engineer ${i+1}`, company: "TechCorp", location: "SF, CA", startDate: "2023-01", endDate: "Present",
    bullets: BULLETS_5.slice(0, Math.min(5, numExp >= 3 ? 5 : 3)),
  })),
  education: [{ id: "edu-1", degree: "B.S. Computer Science", school: "UC Berkeley", location: "Berkeley, CA", graduationDate: "2019-05", gpa: "3.8" }],
  skills: ["React", "TypeScript", "Next.js", "Node.js", "Python", "PostgreSQL", "MongoDB", "AWS", "Docker", "Git", "GraphQL", "Tailwind CSS"],
  certifications: ["AWS Certified Developer - Associate"],
  createdAt: "", updatedAt: "",
});

async function main() {
  console.log("Warmup...");
  const warmupResume = { id:"w", name:"w", contact:{name:"W",email:"w@w",phone:"0",location:"W"}, summary:"W", experience:[{id:"w",title:"W",company:"W",location:"W",startDate:"W",endDate:"W",bullets:["W"]}], education:[{id:"w",degree:"W",school:"W",location:"W",graduationDate:"W"}], skills:["W"], certifications:["W"], createdAt:"", updatedAt:"" };
  await renderToBuffer(React.createElement(ResumePDF, { resume: warmupResume, fontFamily: "Geist", monoFamily: "GeistMono", birdImage: birdData }) as unknown as React.ReactElement<DocumentProps>);
  console.log("Warmup done\n");

  for (let n = 1; n <= 5; n++) {
    const resume = makeResume(n);
    const t = Date.now();
    try {
      const buf = await Promise.race([
        renderToBuffer(React.createElement(ResumePDF, { resume, fontFamily: "Geist", monoFamily: "GeistMono", birdImage: birdData }) as unknown as React.ReactElement<DocumentProps>),
        new Promise<never>((_, r) => setTimeout(() => r(new Error("TIMEOUT")), 12000)),
      ]);
      const pages = buf.toString("binary").match(/\/Type\s*\/Page\b/g)?.length ?? 0;
      console.log(`n=${n} exp entries: OK (${Date.now()-t}ms, ~${pages} pages, ${buf.length}B)`);
    } catch(e) {
      console.log(`n=${n} exp entries: *** HANG *** after ${Date.now()-t}ms`);
      break;
    }
  }
}
main().catch(console.error);
