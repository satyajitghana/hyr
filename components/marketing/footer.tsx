import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/20 px-4 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm">
            H
          </div>
          <span className="font-display text-lg font-bold">Hyr</span>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-foreground transition-colors">
            How It Works
          </Link>
          <Link href="#testimonials" className="hover:text-foreground transition-colors">
            Testimonials
          </Link>
          <Link href="/app" className="hover:text-foreground transition-colors">
            Get Started
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Hyr. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
