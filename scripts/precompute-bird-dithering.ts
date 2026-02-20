/**
 * Precomputes Atkinson-dithered PNGs for all bird images.
 * Run with: npm run precompute:birds
 *
 * Outputs one PNG per bird to public/birds/dithered/<birdname>.png
 * These static assets are committed to the repo so runtime PDF generation
 * can just read the file without re-running the dithering algorithm.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

// Higher resolution so it stays sharp at 3× display size in the PDF
const DITHER_SIZE = 600;

const BIRDS = [
  { name: "bluebird", file: "bluebird.jpg" },
  { name: "mockingbird", file: "mockingbird.jpg" },
  { name: "blackbird", file: "blackbird.jpg" },
  { name: "kitebird", file: "kitebird.jpg" },
  { name: "cardinalbird", file: "cardinalbird.jpg" },
  { name: "kestrelbird", file: "kestrelbird.jpg" },
] as const;

async function ditherToPng(inputPath: string, outputPath: string): Promise<void> {
  const { data } = await sharp(inputPath)
    .flatten({ background: "#ffffff" })
    .resize(DITHER_SIZE, DITHER_SIZE, { fit: "cover" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Float32Array(DITHER_SIZE * DITHER_SIZE);
  for (let i = 0; i < pixels.length; i++) {
    pixels[i] = data[i];
  }

  // Atkinson error-diffusion dithering
  const w = DITHER_SIZE;
  const h = DITHER_SIZE;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const oldVal = pixels[idx];
      const newVal = oldVal > 128 ? 255 : 0;
      pixels[idx] = newVal;
      const err = (oldVal - newVal) / 8; // Atkinson: distribute 6/8 of error

      // Diffuse to 6 neighbors:
      //      * 1 1
      //  1 1 1
      //      1
      if (x + 1 < w) pixels[idx + 1] += err;
      if (x + 2 < w) pixels[idx + 2] += err;
      if (y + 1 < h) {
        if (x - 1 >= 0) pixels[(y + 1) * w + (x - 1)] += err;
        pixels[(y + 1) * w + x] += err;
        if (x + 1 < w) pixels[(y + 1) * w + (x + 1)] += err;
      }
      if (y + 2 < h) {
        pixels[(y + 2) * w + x] += err;
      }
    }
  }

  // Convert to RGBA with radial vignette alpha channel.
  // The alpha fades from 1.0 at the centre to 0.0 at the edges so the image
  // blends seamlessly into the white page background without a hard border.
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  const maxR = Math.min(cx, cy);
  // Vignette starts fading at 45% radius and is fully transparent at 100%.
  const FADE_START = 0.45;

  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < pixels.length; i++) {
    const val = pixels[i] > 128 ? 255 : 0;
    const x = i % w;
    const y = Math.floor(i / w);
    const dx = (x - cx) / maxR;
    const dy = (y - cy) / maxR;
    const r = Math.sqrt(dx * dx + dy * dy);
    // Linear fade from FADE_START to 1.0 → alpha 255 to 0
    const alpha = r <= FADE_START
      ? 255
      : Math.max(0, Math.round(255 * (1 - (r - FADE_START) / (1 - FADE_START))));
    const j = i * 4;
    rgba[j] = val;
    rgba[j + 1] = val;
    rgba[j + 2] = val;
    rgba[j + 3] = alpha;
  }

  await sharp(rgba, {
    raw: { width: w, height: h, channels: 4 },
  })
    .png()
    .toFile(outputPath);
}

async function main() {
  const outDir = path.join(process.cwd(), "public", "birds", "dithered");
  fs.mkdirSync(outDir, { recursive: true });

  for (const bird of BIRDS) {
    const inputPath = path.join(process.cwd(), "public", "birds", bird.file);
    const outputPath = path.join(outDir, `${bird.name}.png`);
    process.stdout.write(`Dithering ${bird.name}...`);
    await ditherToPng(inputPath, outputPath);
    console.log(` done → ${outputPath}`);
  }

  console.log("\nAll birds precomputed successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
