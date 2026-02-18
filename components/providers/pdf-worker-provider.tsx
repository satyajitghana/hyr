"use client";

import { pdfjs } from "react-pdf";

// Use CDN worker matching the exact pdfjs version bundled in react-pdf.
// This avoids API/worker version mismatch errors.
if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export function PdfWorkerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
