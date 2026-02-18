"use client";

import { motion } from "motion/react";

interface StreamingTextProps {
  text: string | undefined;
  isStreaming: boolean;
  className?: string;
}

export function StreamingText({
  text,
  isStreaming,
  className = "",
}: StreamingTextProps) {
  if (!text && !isStreaming) return null;

  return (
    <div className={className}>
      {text ? (
        <span>{text}</span>
      ) : isStreaming ? (
        <span className="text-muted-foreground">Generating...</span>
      ) : null}
      {isStreaming && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
          className="inline-block ml-0.5 w-2 h-4 bg-primary align-middle rounded-sm"
        />
      )}
    </div>
  );
}
