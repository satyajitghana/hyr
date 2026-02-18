/**
 * Server-side Atkinson dithering using sharp.
 * Loads an image, resizes to square, converts to grayscale,
 * applies Bill Atkinson's error-diffusion dithering, and returns a base64 PNG data URI.
 *
 * Atkinson dithering (from MacPaint) diffuses only 6/8 of the quantization error
 * to 6 neighbors, giving more contrast and cleaner whites than Floyd-Steinberg.
 */
import sharp from "sharp";

const DITHER_SIZE = 200;

const cache = new Map<string, string>();

export async function ditherImageServer(imagePath: string): Promise<string> {
  if (cache.has(imagePath)) return cache.get(imagePath)!;

  const { data } = await sharp(imagePath)
    .flatten({ background: "#ffffff" })
    .resize(DITHER_SIZE, DITHER_SIZE, { fit: "cover" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Copy to mutable float buffer for error diffusion
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
      //          * 1 1
      //      1 1 1
      //          1
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

  const png = await sharp(rgba, {
    raw: { width: w, height: h, channels: 4 },
  })
    .png()
    .toBuffer();

  const dataUri = `data:image/png;base64,${png.toString("base64")}`;
  cache.set(imagePath, dataUri);
  return dataUri;
}
