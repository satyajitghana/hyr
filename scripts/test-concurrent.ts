/**
 * Tests whether concurrent renderToBuffer calls deadlock.
 * Run: npx tsx scripts/test-concurrent.ts
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
    { src: path.join(fontsDir, "geist-sans", "Geist-Bold.ttf"), fontWeight: 700 },
  ],
});
Font.registerHyphenationCallback((w: string) => [w]);

const resume = {
  id: "x", name: "x",
  contact: { name: "Alex Johnson", email: "x@x", phone: "0", location: "X" },
  summary: "test", experience: [], education: [], skills: [], certifications: [],
  createdAt: "", updatedAt: "",
};
const birdData =
  "data:image/png;base64," +
  fs.readFileSync(path.join(cwd, "public/birds/dithered/bluebird.png")).toString("base64");
const makeDoc = () =>
  React.createElement(ResumePDF, {
    resume,
    fontFamily: "Geist",
    birdImage: birdData,
  }) as unknown as React.ReactElement<DocumentProps>;

async function main() {
  console.log("Warmup starting...");
  await renderToBuffer(makeDoc());
  console.log("Warmup done. Firing 2 CONCURRENT renders...\n");

  const TIMEOUT_MS = 15000;
  const t = Date.now();

  try {
    await Promise.race([
      Promise.all([
        renderToBuffer(makeDoc()).then((b) => {
          console.log(`  Render 1 done: ${Date.now() - t}ms (${b.length} bytes)`);
          return b;
        }),
        renderToBuffer(makeDoc()).then((b) => {
          console.log(`  Render 2 done: ${Date.now() - t}ms (${b.length} bytes)`);
          return b;
        }),
      ]),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`DEADLOCK: concurrent renders timed out after ${TIMEOUT_MS}ms`)),
          TIMEOUT_MS
        )
      ),
    ]);
    console.log("\n✓ Both completed — no deadlock");
  } catch (e) {
    console.error("\n✗", (e as Error).message);
    process.exit(1);
  }
}

main().catch(console.error);
