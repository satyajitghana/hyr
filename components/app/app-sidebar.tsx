"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Wand2,
  Briefcase,
  ClipboardList,
  ArrowLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Logo } from "@/components/shared/logo";

const navItems = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Resumes", href: "/app/resume", icon: FileText },
  { label: "Tailor", href: "/app/tailor", icon: Wand2 },
  { label: "Jobs", href: "/app/jobs", icon: Briefcase },
  { label: "Applications", href: "/app/applications", icon: ClipboardList },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4">
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/app" &&
                    pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </Link>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
