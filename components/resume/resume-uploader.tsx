"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "motion/react";
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeUploaderProps {
  onUpload: (file: File) => void;
  isUploading?: boolean;
}

export function ResumeUploader({ onUpload, isUploading }: ResumeUploaderProps) {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setUploadedFile(file.name);
        onUpload(file);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50",
        isUploading && "pointer-events-none opacity-60"
      )}
    >
      <input {...getInputProps()} />

      <AnimatePresence mode="wait">
        {isUploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div>
              <p className="font-semibold">Parsing resume...</p>
              <p className="text-sm text-muted-foreground">
                Extracting your information with AI
              </p>
            </div>
          </motion.div>
        ) : uploadedFile ? (
          <motion.div
            key="uploaded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-4"
          >
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <div>
              <p className="font-semibold">Resume uploaded!</p>
              <p className="text-sm text-muted-foreground">{uploadedFile}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Drop another file to replace
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="rounded-2xl bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
              {isDragActive ? (
                <FileText className="h-10 w-10 text-primary" />
              ) : (
                <Upload className="h-10 w-10 text-primary" />
              )}
            </div>
            <div>
              <p className="font-semibold">
                {isDragActive
                  ? "Drop your resume here"
                  : "Drag & drop your resume"}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse. Supports PDF files.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
