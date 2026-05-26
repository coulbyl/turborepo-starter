"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@identis/ui";
import {
  Bell,
  LayoutDashboard,
  Megaphone,
  Settings,
  Users,
} from "lucide-react";
import { PageShell, type NavGroup } from "./page-shell";
import { AccountButton } from "./account-button";
import { NotificationBell } from "./notification-bell";
import { UserAvatar } from "./user-avatar";
import { useCurrentUser } from "@/domains/auth/context/current-user-context";
import { useUnreadCount } from "@/domains/notification/use-cases/use-notifications";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  MEMBER: "Member",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const currentUser = useCurrentUser();
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const isAdmin = currentUser.role === "ADMIN";
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  const navGroups = useMemo((): NavGroup[] => {
    const adminItems = isAdmin
      ? [
          {
            label: tNav("users"),
            href: "/dashboard/users",
            active: pathname.startsWith("/dashboard/users"),
            icon: Users,
          },
          {
            label: tNav("announcements"),
            href: "/dashboard/announcements",
            active: pathname.startsWith("/dashboard/announcements"),
            icon: Megaphone,
          },
        ]
      : [];

    return [
      {
        items: [
          {
            label: tNav("dashboard"),
            mobileLabel: tNav("dashboard"),
            href: "/dashboard",
            active: pathname === "/dashboard",
            icon: LayoutDashboard,
          },
        ],
      },
      ...(adminItems.length > 0
        ? [{ label: tNav("navGroupAdmin"), items: adminItems }]
        : []),
    ];
  }, [isAdmin, pathname, tNav]);

  const pinnedNavItems = useMemo(
    () => [
      {
        label: tNav("notifications"),
        href: "/dashboard/notifications",
        active: pathname.startsWith("/dashboard/notifications"),
        icon: Bell,
        badge: unreadCount,
      },
    ],
    [pathname, tNav, unreadCount],
  );

  const pageTitle = useMemo(
    () => navGroups.flatMap((g) => g.items).find((item) => item.active)?.label,
    [navGroups],
  );

  const allNavItems = useMemo(
    () => navGroups.flatMap((g) => g.items),
    [navGroups],
  );

  const mobileNavItems = allNavItems.slice(0, 4);

  return (
    <PageShell
      navGroups={navGroups}
      pinnedNavItems={pinnedNavItems}
      mobileNavItems={mobileNavItems}
      pageTitle={pageTitle}
      actions={
        <div className="relative flex items-center gap-2">
          <NotificationBell />
          <AccountButton currentUser={currentUser} />
        </div>
      }
      sidebarFooter={
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 rounded-xl border border-sidebar-border/60 bg-sidebar-accent/50 px-3 py-2.5">
            <UserAvatar
              avatarUrl={currentUser.avatarUrl}
              username={currentUser.fullName}
              size={32}
              className="ring-1 ring-sidebar-border"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">
                  {currentUser.fullName}
                </p>
                <Badge
                  variant="neutral"
                  className="shrink-0 text-[0.62rem] text-sidebar-foreground/80"
                >
                  {ROLE_LABEL[currentUser.role] ?? currentUser.role}
                </Badge>
              </div>
              <p className="truncate text-xs text-sidebar-foreground/60">
                @{currentUser.username}
              </p>
            </div>
            <Link
              href="/dashboard/params/account"
              title="Account settings"
              className="shrink-0 rounded-lg p-1.5 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Settings size={15} />
            </Link>
          </div>
        </div>
      }
    >
      {children}
    </PageShell>
  );
}
