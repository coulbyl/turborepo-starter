"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Bell,
  Code2,
  FileText,
  FolderOpen,
  GitBranch,
  LayoutDashboard,
  Megaphone,
  Settings,
  Sliders,
  Users,
} from "lucide-react";
import { PageShell, type NavGroup, type NavItem } from "./page-shell";
import { AccountButton } from "./account-button";
import { NotificationBell } from "./notification-bell";
import { UserAvatar } from "./user-avatar";
import { useCurrentUser } from "@/domains/auth/context/current-user-context";
import { useUnreadCount } from "@/domains/notification/use-cases/use-notifications";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Super Admin",
  MEMBER: "Membre",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const currentUser = useCurrentUser();
  const pathname = usePathname();
  const isAdmin = currentUser.role === "ADMIN";
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  const navGroups = useMemo((): NavGroup[] => {
    const groups: NavGroup[] = [
      {
        items: [
          {
            label: "Tableau de bord",
            mobileLabel: "Dashboard",
            href: "/dashboard",
            active: pathname === "/dashboard",
            icon: LayoutDashboard,
          },
          {
            label: "Dossiers",
            href: "/dashboard/cases",
            active: pathname.startsWith("/dashboard/cases"),
            icon: FolderOpen,
          },
          {
            label: "Workflow",
            href: "/dashboard/workflow",
            active: pathname.startsWith("/dashboard/workflow"),
            icon: GitBranch,
          },
          {
            label: "Analytics",
            href: "/dashboard/analytics",
            active: pathname.startsWith("/dashboard/analytics"),
            icon: BarChart2,
          },
        ],
      },
      {
        label: "Configuration",
        items: [
          {
            label: "Rule Engine",
            href: "/dashboard/rules",
            active: pathname.startsWith("/dashboard/rules"),
            icon: Sliders,
          },
          {
            label: "Formulaires",
            href: "/dashboard/forms",
            active: pathname.startsWith("/dashboard/forms"),
            icon: FileText,
          },
          {
            label: "Équipe",
            href: "/dashboard/team",
            active: pathname.startsWith("/dashboard/team"),
            icon: Users,
          },
        ],
      },
      {
        label: "Développeur",
        items: [
          {
            label: "API & Dev",
            href: "/dashboard/developer",
            active: pathname.startsWith("/dashboard/developer"),
            icon: Code2,
          },
        ],
      },
    ];

    if (isAdmin) {
      groups.push({
        label: "Administration",
        items: [
          {
            label: "Utilisateurs",
            href: "/dashboard/users",
            active: pathname.startsWith("/dashboard/users"),
            icon: Users,
          },
          {
            label: "Annonces",
            href: "/dashboard/announcements",
            active: pathname.startsWith("/dashboard/announcements"),
            icon: Megaphone,
          },
        ],
      });
    }

    return groups;
  }, [isAdmin, pathname]);

  const pinnedNavItems = useMemo(
    (): NavItem[] => [
      {
        label: "Notifications",
        mobileLabel: "Notifs",
        href: "/dashboard/notifications",
        active: pathname.startsWith("/dashboard/notifications"),
        icon: Bell,
        badge: unreadCount,
      },
    ],
    [pathname, unreadCount],
  );

  const mobileNavItems = useMemo(
    (): NavItem[] => [
      {
        label: "Dashboard",
        mobileLabel: "Home",
        href: "/dashboard",
        active: pathname === "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Dossiers",
        href: "/dashboard/cases",
        active: pathname.startsWith("/dashboard/cases"),
        icon: FolderOpen,
      },
      {
        label: "Workflow",
        href: "/dashboard/workflow",
        active: pathname.startsWith("/dashboard/workflow"),
        icon: GitBranch,
      },
      {
        label: "Notifs",
        href: "/dashboard/notifications",
        active: pathname.startsWith("/dashboard/notifications"),
        icon: Bell,
        badge: unreadCount,
      },
      {
        label: "Paramètres",
        href: "/dashboard/params/account",
        active: pathname.startsWith("/dashboard/params"),
        icon: Settings,
      },
    ],
    [pathname, unreadCount],
  );

  const pageTitle = useMemo(() => {
    const all = navGroups.flatMap((g) => g.items);
    return all.find((item) => item.active)?.label;
  }, [navGroups]);

  return (
    <PageShell
      navGroups={navGroups}
      pinnedNavItems={pinnedNavItems}
      mobileNavItems={mobileNavItems}
      pageTitle={pageTitle}
      actions={
        <>
          <NotificationBell />
          <AccountButton currentUser={currentUser} />
        </>
      }
      sidebarFooter={
        <div className="flex items-center gap-2.5 rounded-lg border border-sidebar-border/50 bg-sidebar-accent/40 px-2.5 py-2">
          <UserAvatar
            avatarUrl={currentUser.avatarUrl}
            name={currentUser.fullName}
            size={30}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.75rem] font-semibold leading-tight text-sidebar-foreground">
              {currentUser.fullName}
            </p>
            <p className="truncate text-[0.65rem] leading-tight text-sidebar-foreground/50">
              {ROLE_LABEL[currentUser.role] ?? currentUser.role}
            </p>
          </div>
          <Link
            href="/dashboard/params/account"
            title="Paramètres"
            className="shrink-0 rounded-md p-1 text-sidebar-foreground/40 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Settings size={13} />
          </Link>
        </div>
      }
    >
      {children}
    </PageShell>
  );
}
