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

const DITHER_SIZE = 200;

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

  // Convert to RGBA
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < pixels.length; i++) {
    const val = pixels[i] > 128 ? 255 : 0;
    const j = i * 4;
    rgba[j] = val;
    rgba[j + 1] = val;
    rgba[j + 2] = val;
    rgba[j + 3] = 255;
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
