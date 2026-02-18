import path from "path";
import { renderToBuffer } from "@react-pdf/renderer";
import { Font } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { ResumePDF } from "@/components/resume/resume-pdf";
import { resumeInputSchema } from "@/lib/ai/schemas";
import React from "react";

// Register Geist fonts for PDF rendering
const fontsDir = path.join(
  process.cwd(),
  "node_modules",
  "geist",
  "dist",
  "fonts"
);

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const resume = resumeInputSchema.parse(body.resume);

    // Add timestamps required by Resume type but not in input schema
    const fullResume = {
      ...resume,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const buffer = await renderToBuffer(
      React.createElement(ResumePDF, { resume: fullResume }) as any
    );

    const fileName = `${resume.contact.name.replace(/\s+/g, "_")}_Resume.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
