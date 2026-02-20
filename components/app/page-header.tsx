"use client";

import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  gradient: string;
  shadow: string;
  children?: React.ReactNode;
}

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  gradient,
  shadow,
  children,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg ${shadow}`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {title}
            </h1>
            <p className="mt-1 text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </motion.div>
  );
}
