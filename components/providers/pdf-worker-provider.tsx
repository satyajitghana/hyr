"use client";

import { useEffect } from "react";

export function PdfWorkerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    let active = true;

    const configurePdfWorker = async () => {
      try {
        const mod = await import("react-pdf");
        if (!active) return;

        const workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
        mod.pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      } catch (error) {
        // Avoid crashing the entire app if pdfjs fails to load on routes
        // that do not actually render a PDF viewer.
        console.warn("Failed to configure PDF worker:", error);
      }
    };

    configurePdfWorker();

    return () => {
      active = false;
    };
  }, []);

  return <>{children}</>;
}
