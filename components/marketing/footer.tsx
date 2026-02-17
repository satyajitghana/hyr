import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/shared/logo";

export function Footer() {
  return (
    <footer className="relative border-t bg-muted/10 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-3">
            <Logo />
            <p className="text-xs text-muted-foreground">
              AI-Powered Resume Optimization
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#testimonials"
              className="hover:text-foreground transition-colors"
            >
              Testimonials
            </Link>
            <Link
              href="/app"
              className="hover:text-foreground transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>

        <Separator className="my-8 opacity-50" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Hyr. All rights reserved.</p>
          <p>
            Built with Next.js, Tailwind CSS, and AI
          </p>
        </div>
      </div>
    </footer>
  );
}
