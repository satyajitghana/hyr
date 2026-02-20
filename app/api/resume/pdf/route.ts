import fs from "fs";
import path from "path";
import { renderToBuffer } from "@react-pdf/renderer";
import { Font, type DocumentProps } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { ResumePDF } from "@/components/resume/resume-pdf";
import { resumeInputSchema } from "@/lib/ai/schemas";
import { getBirdForName } from "@/lib/resume/birds";
import React from "react";

// ── Font registration ──
const fontsDir = path.join(
  process.cwd(),
  "node_modules",
  "geist",
  "dist",
  "fonts"
);

let usingGeist = false;

const geistRegularPath = path.join(fontsDir, "geist-sans", "Geist-Regular.ttf");

if (fs.existsSync(geistRegularPath)) {
  Font.register({
    family: "Geist",
    fonts: [
      // Upright
      { src: path.join(fontsDir, "geist-sans", "Geist-Regular.ttf"), fontWeight: 400 },
      { src: path.join(fontsDir, "geist-sans", "Geist-Medium.ttf"), fontWeight: 500 },
      { src: path.join(fontsDir, "geist-sans", "Geist-SemiBold.ttf"), fontWeight: 600 },
      { src: path.join(fontsDir, "geist-sans", "Geist-Bold.ttf"), fontWeight: 700 },
      // Italic
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
} else {
  console.warn("Geist fonts not found — falling back to Helvetica");
}

Font.registerHyphenationCallback((word) => [word]);

// ── Bird image cache (loaded once at module startup) ──
const birdCache = new Map<string, string>();
for (const name of [
  "bluebird", "mockingbird", "blackbird",
  "kitebird", "cardinalbird", "kestrelbird",
]) {
  try {
    const p = path.join(process.cwd(), "public", "birds", "dithered", `${name}.png`);
    birdCache.set(name, `data:image/png;base64,${fs.readFileSync(p).toString("base64")}`);
  } catch { /* precomputed file not found – silently skip */ }
}

// ── Renderer warmup: render a minimal ResumePDF at module startup ──
// Uses the actual component so fonts, Yoga layout, Canvas, and PDFKit are all
// pre-warmed before the first real request arrives.
void (async () => {
  try {
    const warmupResume = {
      id: "_warmup",
      name: "_warmup",
      contact: { name: "W", email: "w@w", phone: "0", location: "W" },
      summary: "W",
      experience: [{ id: "w", title: "W", company: "W", location: "W", startDate: "W", endDate: "W", bullets: ["W"] }],
      education: [{ id: "w", degree: "W", school: "W", location: "W", graduationDate: "W" }],
      skills: ["W"],
      certifications: ["W"],
      createdAt: "",
      updatedAt: "",
    };
    await renderToBuffer(
      React.createElement(ResumePDF, {
        resume: warmupResume,
        fontFamily: usingGeist ? "Geist" : "Helvetica",
        monoFamily: usingGeist ? "GeistMono" : undefined,
        birdImage: birdCache.values().next().value,
      }) as unknown as React.ReactElement<DocumentProps>,
    );
  } catch { /* warmup failure is non-critical */ }
})();

// ── Route handler ──
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const resume = resumeInputSchema.parse(body.resume);

    const fullResume = {
      ...resume,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Deterministic bird assignment based on person name (served from module-level cache)
    const bird = getBirdForName(resume.contact.name);
    const birdImage = birdCache.get(bird.name);

    const pdfDocument = React.createElement(ResumePDF, {
      resume: fullResume,
      fontFamily: usingGeist ? "Geist" : "Helvetica",
      monoFamily: usingGeist ? "GeistMono" : undefined,
      ditherImage: body.ditherImage || undefined,
      birdImage,
    }) as unknown as React.ReactElement<DocumentProps>;

    const buffer = await renderToBuffer(pdfDocument);

    const fileName = `${resume.contact.name.replace(/\s+/g, "_")}_Resume.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
