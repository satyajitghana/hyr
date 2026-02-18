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
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from "@/components/animate-ui/components/radix/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";
import { Logo } from "@/components/shared/logo";
import { useJobStore } from "@/lib/store/job-store";
import { ChevronsUpDown, User, Settings, ArrowLeft, LogOut, Sparkles, PenLine } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { HouseIcon } from "@/components/ui/house-icon";
import { FolderIcon } from "@/components/ui/folder-icon";
import { SparklesIcon } from "@/components/ui/sparkles-icon";
import { CompassIcon } from "@/components/ui/compass-icon";
import { ClipboardIcon } from "@/components/ui/clipboard-icon";
import { ZapIcon } from "@/components/ui/zap-icon";

const navItems = [
  { label: "Dashboard", href: "/app", Icon: HouseIcon },
  { label: "Resumes", href: "/app/resume", Icon: FolderIcon },
  { label: "Tailor", href: "/app/tailor", Icon: SparklesIcon },
  { label: "Compose", href: "/app/compose", Icon: PenLine },
  { label: "Jobs", href: "/app/jobs", Icon: CompassIcon },
  { label: "Applications", href: "/app/applications", Icon: ClipboardIcon, showBadge: true },
  { label: "Beast Mode", href: "/app/beast-mode", Icon: ZapIcon },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const applicationCount = useJobStore((s) => s.applications.length);
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-3 transition-[padding] duration-300 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2.5 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
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
                        {item.showBadge && applicationCount > 0 && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold tabular-nums text-primary">
                            {applicationCount}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip="Alex Johnson"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                      AJ
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Alex Johnson</span>
                    <span className="truncate text-xs text-muted-foreground">alex@email.com</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                        AJ
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Alex Johnson</span>
                      <span className="truncate text-xs text-muted-foreground">alex@email.com</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <Sparkles />
                  Upgrade to Pro
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <User />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Settings />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link href="/">
                  <DropdownMenuItem>
                    <ArrowLeft />
                    Back to Site
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem disabled>
                  <LogOut />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
