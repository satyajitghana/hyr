import fs from "fs";
import path from "path";
import { renderToBuffer } from "@react-pdf/renderer";
import { Font } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { ResumePDF } from "@/components/resume/resume-pdf";
import { resumeInputSchema } from "@/lib/ai/schemas";
import React from "react";

// Register Geist fonts for PDF rendering using direct file paths
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
      {
        src: path.join(fontsDir, "geist-sans", "Geist-Regular.ttf"),
        fontWeight: 400,
      },
      {
        src: path.join(fontsDir, "geist-sans", "Geist-Medium.ttf"),
        fontWeight: 500,
      },
      {
        src: path.join(fontsDir, "geist-sans", "Geist-SemiBold.ttf"),
        fontWeight: 600,
      },
      {
        src: path.join(fontsDir, "geist-sans", "Geist-Bold.ttf"),
        fontWeight: 700,
      },
    ],
  });

  Font.register({
    family: "GeistMono",
    fonts: [
      {
        src: path.join(fontsDir, "geist-mono", "GeistMono-Regular.ttf"),
        fontWeight: 400,
      },
    ],
  });

  usingGeist = true;
} else {
  console.warn("Geist font files not found at", fontsDir, "— falling back to Helvetica");
}

// Disable hyphenation to prevent unwanted word breaks
Font.registerHyphenationCallback((word) => [word]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const resume = resumeInputSchema.parse(body.resume);

    const fullResume = {
      ...resume,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const buffer = await renderToBuffer(
      React.createElement(ResumePDF, {
        resume: fullResume,
        fontFamily: usingGeist ? "Geist" : "Helvetica",
        ditherImage: body.ditherImage || undefined,
      }) as any
    );

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
