"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

interface ResumePdfViewerProps {
  url: string;
}

const PDF_VIEWER_PADDING = 18;

export function ResumePdfViewer({ url }: ResumePdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const pageWidth = Math.min(
    containerWidth - PDF_VIEWER_PADDING,
    600
  );

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center overflow-y-auto"
    >
      <Document
        file={url}
        loading={
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              Loading preview...
            </p>
          </div>
        }
        onLoadError={(err) => {
          console.error("PDF load error:", err);
          setError(err);
        }}
        className="flex items-center justify-center py-4"
      >
        {!error && (
          <Page
            pageNumber={1}
            width={pageWidth > 0 ? pageWidth : 600}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        )}
      </Document>
      {error && (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-destructive">
            Failed to load preview
          </p>
        </div>
      )}
    </div>
  );
}
