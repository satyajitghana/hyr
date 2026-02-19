"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppBreadcrumb } from "@/components/app/app-breadcrumb";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { PdfWorkerProvider } from "@/components/providers/pdf-worker-provider";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

const mockAiPages = ["/app/tailor", "/app/compose", "/app/resume", "/app/jobs"];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const safePathname = pathname ?? "";
  const isMockAiPage = mockAiPages.some((route) => safePathname.startsWith(route));

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-gradient-to-b from-background via-background to-muted/20">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 backdrop-blur transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <AppBreadcrumb />
          </div>
          {isMockAiPage && (
            <Badge variant="secondary" className="hidden gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide md:inline-flex">
              <Sparkles className="h-3 w-3" />
              AI SDK · Mock Provider
            </Badge>
          )}
          <div className="ml-auto flex items-center gap-2 px-4">
            <ThemeToggle />
          </div>
        </header>
        <div className="relative flex flex-1 flex-col p-4 pt-4 md:p-6">
          <div className="pointer-events-none absolute inset-x-12 top-0 h-20 rounded-full bg-primary/5 blur-3xl" />
          <div className="relative flex flex-1 flex-col gap-4">
            <PdfWorkerProvider>{children}</PdfWorkerProvider>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
