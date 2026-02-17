"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from "@/components/animate-ui/components/radix/sidebar";
import { Logo } from "@/components/shared/logo";
import { useJobStore } from "@/lib/store/job-store";

import { HouseIcon } from "@/components/ui/house-icon";
import { FolderIcon } from "@/components/ui/folder-icon";
import { SparklesIcon } from "@/components/ui/sparkles-icon";
import { CompassIcon } from "@/components/ui/compass-icon";
import { ClipboardIcon } from "@/components/ui/clipboard-icon";
import { ZapIcon } from "@/components/ui/zap-icon";
import { MoveLeftIcon } from "@/components/ui/move-left-icon";

const navItems = [
  { label: "Dashboard", href: "/app", Icon: HouseIcon },
  { label: "Resumes", href: "/app/resume", Icon: FolderIcon },
  { label: "Tailor", href: "/app/tailor", Icon: SparklesIcon },
  { label: "Jobs", href: "/app/jobs", Icon: CompassIcon },
  { label: "Applications", href: "/app/applications", Icon: ClipboardIcon, showBadge: true },
  { label: "Beast Mode", href: "/app/beast-mode", Icon: ZapIcon },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const applicationCount = useJobStore((s) => s.applications.length);
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-3 py-3 transition-[padding] duration-300 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2.5 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
        <Logo showText={!collapsed} size="sm" href="/app" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/app" &&
                    pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.Icon size={16} className="shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.showBadge && applicationCount > 0 && (
                      <SidebarMenuBadge>{applicationCount}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3 transition-[padding] duration-300 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to site">
              <Link href="/">
                <MoveLeftIcon size={16} className="shrink-0" />
                <span>Back to site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
