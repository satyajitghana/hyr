"use client";

import { pdfjs } from "react-pdf";

// Set up the PDF.js worker. Try local bundle first, fall back to CDN.
if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  } catch {
    // Fallback to CDN if bundler can't resolve the worker
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }
}

export function PdfWorkerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
