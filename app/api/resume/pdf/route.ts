import fs from "fs";
import path from "path";
import { renderToBuffer } from "@react-pdf/renderer";
import { Font } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { ResumePDF } from "@/components/resume/resume-pdf";
import { resumeInputSchema } from "@/lib/ai/schemas";
import React from "react";

// Register Geist fonts for PDF rendering using Buffer reads for reliability
const fontsDir = path.join(
  process.cwd(),
  "node_modules",
  "geist",
  "dist",
  "fonts"
);

let usingGeist = false;

try {
  const geistRegular = fs.readFileSync(
    path.join(fontsDir, "geist-sans", "Geist-Regular.ttf")
  );
  const geistMedium = fs.readFileSync(
    path.join(fontsDir, "geist-sans", "Geist-Medium.ttf")
  );
  const geistSemiBold = fs.readFileSync(
    path.join(fontsDir, "geist-sans", "Geist-SemiBold.ttf")
  );
  const geistBold = fs.readFileSync(
    path.join(fontsDir, "geist-sans", "Geist-Bold.ttf")
  );

  Font.register({
    family: "Geist",
    fonts: [
      {
        src: `data:font/truetype;base64,${geistRegular.toString("base64")}`,
        fontWeight: 400,
      },
      {
        src: `data:font/truetype;base64,${geistMedium.toString("base64")}`,
        fontWeight: 500,
      },
      {
        src: `data:font/truetype;base64,${geistSemiBold.toString("base64")}`,
        fontWeight: 600,
      },
      {
        src: `data:font/truetype;base64,${geistBold.toString("base64")}`,
        fontWeight: 700,
      },
    ],
  });

  const geistMonoRegular = fs.readFileSync(
    path.join(fontsDir, "geist-mono", "GeistMono-Regular.ttf")
  );

  Font.register({
    family: "GeistMono",
    fonts: [
      {
        src: `data:font/truetype;base64,${geistMonoRegular.toString("base64")}`,
        fontWeight: 400,
      },
    ],
  });

  usingGeist = true;
} catch (e) {
  console.warn("Failed to load Geist fonts, falling back to Helvetica:", e);
}

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
