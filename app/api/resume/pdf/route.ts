import fs from "fs";
import path from "path";
import zlib from "zlib";
import { renderToBuffer } from "@react-pdf/renderer";
import { Font } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { ResumePDF } from "@/components/resume/resume-pdf";
import { resumeInputSchema } from "@/lib/ai/schemas";
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
      { src: path.join(fontsDir, "geist-sans", "Geist-Regular.ttf"), fontWeight: 400 },
      { src: path.join(fontsDir, "geist-sans", "Geist-Medium.ttf"), fontWeight: 500 },
      { src: path.join(fontsDir, "geist-sans", "Geist-SemiBold.ttf"), fontWeight: 600 },
      { src: path.join(fontsDir, "geist-sans", "Geist-Bold.ttf"), fontWeight: 700 },
    ],
  });
  Font.register({
    family: "GeistMono",
    fonts: [
      { src: path.join(fontsDir, "geist-mono", "GeistMono-Regular.ttf"), fontWeight: 400 },
    ],
  });
  usingGeist = true;
} else {
  console.warn("Geist fonts not found — falling back to Helvetica");
}

Font.registerHyphenationCallback((word) => [word]);

// ── Generative dot-pattern PNG (server-side, pure Node.js zlib) ──
// This avoids the react-pdf SVG blank-page bug while preserving the dither look.

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const t = Buffer.from(type, "ascii");
  const len = Buffer.allocUnsafe(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}

function seededRng(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return () => {
    h = ((h ^ (h >>> 16)) * 0x45d9f3b) | 0;
    h = ((h ^ (h >>> 16)) * 0x45d9f3b) | 0;
    h = h ^ (h >>> 16);
    return (h >>> 0) / 0xffffffff;
  };
}

/**
 * Generates a full-page dot-pattern PNG as a base64 data URI.
 * The image is 200×260 (scaled to 612×792 in the PDF), RGBA, mostly transparent.
 * Using an <Image> component avoids the SVG blank-page bug in react-pdf.
 */
function generateDotPatternPNG(seed: string): string {
  const W = 200, H = 260, COUNT = 520;
  const rng = seededRng(seed);

  // RGBA pixel buffer, all transparent
  const px = Buffer.alloc(W * H * 4, 0);

  for (let n = 0; n < COUNT; n++) {
    const cx = Math.floor(rng() * W);
    const cy = Math.floor(rng() * H);
    const r  = 1 + Math.floor(rng() * 2);          // radius 1–2 px
    const a  = Math.floor(18 + rng() * 55);         // alpha 18–73 (7–29%)

    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r) continue;
        const px_ = cx + dx, py = cy + dy;
        if (px_ < 0 || px_ >= W || py < 0 || py >= H) continue;
        const idx = (py * W + px_) * 4;
        px[idx]     = 0x4f; // R  ↘ accent color #4f46e5
        px[idx + 1] = 0x46; // G
        px[idx + 2] = 0xe5; // B
        px[idx + 3] = a;
      }
    }
  }

  // Scanlines: 1 filter byte (None=0) + raw RGBA per row
  const raw = Buffer.allocUnsafe((1 + W * 4) * H);
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 4)] = 0;
    px.copy(raw, y * (1 + W * 4) + 1, y * W * 4, (y + 1) * W * 4);
  }

  const compressed = zlib.deflateSync(raw, { level: 6 });

  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = ihdr[11] = ihdr[12] = 0; // RGBA

  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);

  return `data:image/png;base64,${png.toString("base64")}`;
}

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

    // Seed the generative dither from the primary job title (unique per role)
    const ditherSeed = (resume.experience[0]?.title ?? resume.contact.name) + resume.contact.name;
    const backgroundDither = generateDotPatternPNG(ditherSeed);

    const buffer = await renderToBuffer(
      React.createElement(ResumePDF, {
        resume: fullResume,
        fontFamily: usingGeist ? "Geist" : "Helvetica",
        ditherImage: body.ditherImage || undefined,
        backgroundDither,
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
