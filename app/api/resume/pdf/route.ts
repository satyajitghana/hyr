import fs from "fs";
import path from "path";
import { renderToBuffer } from "@react-pdf/renderer";
import { Font, type DocumentProps } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { ResumePDF } from "@/components/resume/resume-pdf";
import { resumeInputSchema } from "@/lib/ai/schemas";
import { getBirdForName } from "@/lib/resume/birds";
import { ditherImageServer } from "@/lib/resume/server-dither";
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

    // Deterministic bird assignment based on person name
    const bird = getBirdForName(resume.contact.name);
    const birdPath = path.join(process.cwd(), "public", "birds", bird.file);
    let birdImage: string | undefined;
    try {
      birdImage = await ditherImageServer(birdPath);
    } catch (e) {
      console.warn("Bird dither failed, skipping:", e);
    }

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
