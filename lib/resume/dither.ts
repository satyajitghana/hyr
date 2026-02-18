/**
 * Client-side image processing for halftone dither effect.
 * Takes an image file and produces a low-res dithered PNG as a base64 data URI.
 */

const DITHER_SIZE = 120; // output resolution
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v / 16) * 255));

export async function processImageToDither(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        try {
          const result = ditherImage(img);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ditherImage(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // Calculate crop to square from center
  const size = Math.min(img.width, img.height);
  const sx = (img.width - size) / 2;
  const sy = (img.height - size) / 2;

  canvas.width = DITHER_SIZE;
  canvas.height = DITHER_SIZE;

  // Draw image scaled down and cropped to square
  ctx.drawImage(img, sx, sy, size, size, 0, 0, DITHER_SIZE, DITHER_SIZE);

  const imageData = ctx.getImageData(0, 0, DITHER_SIZE, DITHER_SIZE);
  const { data } = imageData;

  // Convert to grayscale and apply ordered (Bayer) dithering
  for (let y = 0; y < DITHER_SIZE; y++) {
    for (let x = 0; x < DITHER_SIZE; x++) {
      const i = (y * DITHER_SIZE + x) * 4;
      // Grayscale
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      // Bayer threshold
      const threshold = BAYER_4X4[y % 4][x % 4];
      const val = gray > threshold ? 255 : 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}
