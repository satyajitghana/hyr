"use client";

import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { TailoredChangeOutput } from "@/lib/ai/schemas";

const changeTypeConfig: Record<
  TailoredChangeOutput["type"],
  { color: string; label: string; dot: string }
> = {
  addition: {
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
    label: "Added",
    dot: "bg-green-500",
  },
  modification: {
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    label: "Modified",
    dot: "bg-amber-500",
  },
  removal: {
    color: "bg-red-500/10 text-red-600 dark:text-red-400",
    label: "Removed",
    dot: "bg-red-500",
  },
};

interface StreamingChangesProps {
  changes: TailoredChangeOutput[] | undefined;
  onToggle?: (changeId: string) => void;
  isStreaming?: boolean;
}

export function StreamingChanges({
  changes,
  onToggle,
  isStreaming,
}: StreamingChangesProps) {
  if (!changes || changes.length === 0) {
    if (isStreaming) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
            />
            Analyzing resume and generating changes...
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {changes.map((change, idx) => {
          if (!change || !change.type) return null;
          const config = changeTypeConfig[change.type];
          return (
            <motion.div
              key={change.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.03 }}
              layout
            >
              <Card
                className={`transition-all duration-200 ${
                  !change.accepted
                    ? "opacity-40 hover:opacity-70"
                    : "hover:shadow-md"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {onToggle && (
                      <button
                        onClick={() => onToggle(change.id)}
                        className="mt-0.5 shrink-0 transition-transform hover:scale-110"
                      >
                        {change.accepted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-muted-foreground/30">
                            <X className="h-3 w-3 text-muted-foreground/50" />
                          </div>
                        )}
                      </button>
                    )}

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] capitalize font-normal"
                        >
                          {change.section}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                          />
                          <span
                            className={`text-[10px] font-medium ${config.color}`}
                          >
                            {config.label}
                          </span>
                        </div>
                        {change.field && (
                          <span className="text-[10px] text-muted-foreground truncate">
                            {change.field}
                          </span>
                        )}
                      </div>

                      {change.original && (
                        <div className="rounded-lg bg-red-500/5 border border-red-500/10 px-3 py-2">
                          <p className="text-xs text-muted-foreground line-through leading-relaxed">
                            {change.original}
                          </p>
                        </div>
                      )}
                      <div className="rounded-lg bg-green-500/5 border border-green-500/10 px-3 py-2">
                        <p className="text-xs leading-relaxed">
                          {change.tailored}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
