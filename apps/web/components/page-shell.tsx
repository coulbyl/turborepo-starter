"use client";

import Link from "next/link";
import { type CSSProperties, type ReactNode } from "react";
import { cn } from "@identis/ui/cn";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@identis/ui";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  mobileLabel?: string;
  href: string;
  active?: boolean;
  icon: LucideIcon;
  badge?: number;
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
};

function NavMenuItems({ items }: { items: NavItem[] }) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={item.active}
            tooltip={item.label}
            className={cn(
              "h-9 rounded-lg px-2.5 text-[0.8125rem] font-medium",
              "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground",
            )}
          >
            <Link href={item.href}>
              <item.icon
                size={15}
                className={cn(
                  "shrink-0",
                  item.active
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground/50",
                )}
              />
              <span>{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="ml-auto inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[0.58rem] font-bold tabular-nums text-white">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function PageShell({
  navGroups,
  pinnedNavItems,
  mobileNavItems,
  actions,
  sidebarFooter,
  pageTitle,
  children,
}: {
  navGroups: NavGroup[];
  pinnedNavItems?: NavItem[];
  mobileNavItems?: NavItem[];
  actions?: ReactNode;
  sidebarFooter?: ReactNode;
  pageTitle?: string;
  children: ReactNode;
}) {
  const allNavItems = navGroups.flatMap((g) => g.items);
  const bottomNavItems = (mobileNavItems ?? allNavItems).slice(0, 5);

  return (
    <SidebarProvider
      className="overflow-hidden bg-background text-foreground"
      style={
        {
          "--sidebar-width": "15rem",
          "--sidebar-width-icon": "3rem",
        } as CSSProperties
      }
    >
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <Sidebar variant="inset" collapsible="offcanvas" className="border-r-0">
        {/* Logo */}
        <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#2563eb] text-[0.9rem] font-bold text-white">
              Id
            </div>
            <div className="min-w-0">
              <p className="text-[0.8125rem] font-bold leading-tight tracking-tight text-sidebar-foreground">
                Identis
              </p>
              <p className="text-[0.65rem] leading-tight text-sidebar-foreground/45">
                Plateforme KYC
              </p>
            </div>
          </Link>
        </SidebarHeader>

        {/* Nav */}
        <SidebarContent className="overflow-x-hidden px-2.5 py-2.5">
          {navGroups.map((group, i) => (
            <SidebarGroup key={i} className="mb-0.5 p-0">
              {group.label && (
                <SidebarGroupLabel className="mb-0.5 h-6 px-2 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/35">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <NavMenuItems items={group.items} />
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        {/* Pinned + footer */}
        {(pinnedNavItems?.length || sidebarFooter) && (
          <>
            <SidebarSeparator className="bg-sidebar-border/50" />
            <SidebarFooter className="gap-0 px-2.5 pt-2 pb-3">
              {pinnedNavItems?.length ? (
                <>
                  <NavMenuItems items={pinnedNavItems} />
                  {sidebarFooter && (
                    <SidebarSeparator className="my-2 bg-sidebar-border/50" />
                  )}
                </>
              ) : null}
              {sidebarFooter}
            </SidebarFooter>
          </>
        )}
      </Sidebar>

      {/* ── Content area ────────────────────────────────────────────── */}
      <SidebarInset className="flex h-dvh flex-col overflow-hidden bg-background">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-border/80 bg-panel-strong/95 backdrop-blur">
          <div className="flex w-full items-center justify-between gap-4 px-4 lg:px-5">
            <div className="flex min-w-0 items-center gap-2.5">
              <SidebarTrigger className="-ml-1 shrink-0 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground" />
              {pageTitle && (
                <span className="truncate text-sm font-semibold text-foreground">
                  {pageTitle}
                </span>
              )}
            </div>
            {actions && (
              <div className="flex shrink-0 items-center gap-1.5">
                {actions}
              </div>
            )}
          </div>
        </header>

        {/* Main */}
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
          <div className="mx-auto h-full w-full max-w-screen-2xl px-4 py-5 lg:px-6 lg:py-6">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 shrink-0 items-center border-t border-border/80 bg-panel-strong/98 px-3 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
          <div
            className="grid w-full gap-1"
            style={{
              gridTemplateColumns: `repeat(${bottomNavItems.length}, minmax(0, 1fr))`,
            }}
          >
            {bottomNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition-colors",
                  item.active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <div
                  className={cn(
                    "relative flex items-center justify-center rounded-lg p-1.5 transition-colors",
                    item.active ? "bg-primary/10" : "",
                  )}
                >
                  <item.icon size={18} />
                  {item.badge != null && item.badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive text-[0.5rem] font-bold text-white">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[0.62rem] font-medium leading-none">
                  {item.mobileLabel ?? item.label}
                </span>
              </Link>
            ))}
          </div>
        </nav>
      </SidebarInset>
    </SidebarProvider>
  );
}
