import fs from "fs";
import path from "path";
import { renderToBuffer, Font, Document, Page, Text, View, Image } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import React from "react";

const cwd = process.cwd();
const fontsDir = path.join(cwd, "node_modules", "geist", "dist", "fonts");
Font.register({ family: "Geist", fonts: [
  { src: fontsDir+"/geist-sans/Geist-Regular.ttf", fontWeight: 400 },
  { src: fontsDir+"/geist-sans/Geist-SemiBold.ttf", fontWeight: 600 },
  { src: fontsDir+"/geist-sans/Geist-Bold.ttf", fontWeight: 700 },
  { src: fontsDir+"/geist-sans/Geist-Italic.ttf", fontWeight: 400, fontStyle: "italic" as const },
  { src: fontsDir+"/geist-sans/Geist-SemiBoldItalic.ttf", fontWeight: 600, fontStyle: "italic" as const },
  { src: fontsDir+"/geist-sans/Geist-BoldItalic.ttf", fontWeight: 700, fontStyle: "italic" as const },
]});
Font.register({ family: "GeistMono", fonts: [
  { src: fontsDir+"/geist-mono/GeistMono-Regular.ttf", fontWeight: 400 },
  { src: fontsDir+"/geist-mono/GeistMono-Italic.ttf", fontWeight: 400, fontStyle: "italic" as const },
]});
Font.registerHyphenationCallback((w: string) => [w]);

const birdData = "data:image/png;base64," + fs.readFileSync(path.join(cwd, "public/birds/dithered/kestrelbird.png")).toString("base64");

const BULLETS = [
  "Led end-to-end delivery of a real-time planning workspace used by 85K+ weekly active users; rollout increased team adoption by 34% within two quarters.",
  "Designed an event-driven service architecture (Node.js, Kafka, Postgres) that reduced median API latency by 58% and cut incident volume by 41% year-over-year.",
  "Partnered with product analytics to define success metrics and experimentation strategy, resulting in a 17% lift in trial-to-paid conversion for self-serve accounts.",
  "Mentored five engineers through design reviews, pairing, and growth plans; two promoted to senior level within 12 months.",
  "Introduced quality gates and contract testing across CI pipelines, increasing change confidence and reducing regression escapes by 63%.",
];

// Simplified ResumePDF WITHOUT Canvas — to test if Canvas is the hang cause
const makeDoc = (numExp: number) => {
  const exps = Array.from({length: numExp}, (_, i) => 
    React.createElement(View, { key: i, style:{marginBottom:4}, wrap: false },
      React.createElement(Text, {style:{fontSize:10,fontWeight:600,fontFamily:"Geist"}}, `Software Engineer ${i+1}`),
      React.createElement(Text, {style:{fontSize:9,fontStyle:"italic",fontFamily:"Geist"}}, `TechCorp · San Francisco, CA`),
      ...BULLETS.map((b, j) => React.createElement(View, {key:j, style:{flexDirection:"row"}},
        React.createElement(Text, {style:{width:10,fontSize:9}}, "–"),
        React.createElement(Text, {style:{flex:1,fontSize:9}}, b)
      ))
    )
  );

  return React.createElement(Document, null,
    React.createElement(Page, {size:"LETTER", style:{paddingTop:28,paddingBottom:28,paddingHorizontal:36,fontSize:9,fontFamily:"Geist"}},
      // Bird image (absolute)
      React.createElement(Image as any, {src: birdData, style:{position:"absolute",bottom:12,right:16,width:132,height:132,opacity:0.17}}),
      // Header
      React.createElement(Text, {style:{fontSize:20,fontWeight:700,marginBottom:4}}, "Alex Johnson"),
      React.createElement(Text, {style:{fontSize:9,marginBottom:10}}, "Product-minded full-stack engineer with 7+ years of experience building SaaS platforms from zero-to-one. Strong background in TypeScript, React, Node.js."),
      // Experience section
      React.createElement(View, {style:{marginBottom:6}},
        React.createElement(Text, {style:{fontSize:8.5,fontWeight:700,fontFamily:"GeistMono",marginBottom:3}}, "EXPERIENCE"),
        ...exps
      )
    )
  ) as unknown as React.ReactElement<DocumentProps>;
};

async function main() {
  console.log("Warmup...");
  await renderToBuffer(makeDoc(1));
  console.log("Warmup done.\n");

  for (let n = 2; n <= 5; n++) {
    const t = Date.now();
    try {
      const buf = await Promise.race([
        renderToBuffer(makeDoc(n)),
        new Promise<never>((_, r) => setTimeout(() => r(new Error("TIMEOUT")), 10000)),
      ]);
      const pages = buf.toString("binary").match(/\/Type\s*\/Page\b/g)?.length ?? 0;
      console.log(`n=${n}: OK (${Date.now()-t}ms, ~${pages} pages)`);
    } catch(e) {
      console.log(`n=${n}: *** HANG ***`);
      break;
    }
  }
}
main().catch(console.error);
