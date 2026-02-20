"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppBreadcrumb } from "@/components/app/app-breadcrumb";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { PdfWorkerProvider } from "@/components/providers/pdf-worker-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-gradient-to-b from-background via-background to-muted/20">
        <header className="sticky top-0 z-20 h-16 shrink-0 border-b border-border/60 bg-background/80 backdrop-blur transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="mx-auto flex h-full w-full max-w-6xl items-center gap-2 px-4 md:px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <AppBreadcrumb />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="relative flex flex-1 flex-col p-4 pt-4 md:p-6">
          <div className="pointer-events-none absolute inset-x-12 top-0 h-20 rounded-full bg-primary/5 blur-3xl" />
          <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4">
            <PdfWorkerProvider>{children}</PdfWorkerProvider>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
