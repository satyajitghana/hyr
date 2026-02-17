"use client";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export function ThemeToggle() {
  return (
    <AnimatedThemeToggler className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground cursor-pointer" />
  );
}
