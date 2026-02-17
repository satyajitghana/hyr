import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  className?: string;
}

const sizeMap = {
  sm: { box: "h-7 w-7 text-xs", text: "text-lg" },
  md: { box: "h-8 w-8 text-sm", text: "text-xl" },
  lg: { box: "h-10 w-10 text-base", text: "text-2xl" },
};

export function Logo({
  size = "md",
  showText = true,
  href = "/",
  className,
}: LogoProps) {
  const s = sizeMap[size];

  const content = (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground font-pixel font-bold",
          s.box
        )}
      >
        H
      </div>
      {showText && (
        <span
          className={cn("font-display font-bold tracking-tight", s.text)}
        >
          Hyr
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
