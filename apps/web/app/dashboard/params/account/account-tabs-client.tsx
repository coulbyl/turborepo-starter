"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@identis/ui";
import {
  Bell,
  Globe,
  Monitor,
  ShieldCheck,
  User,
} from "lucide-react";
import { ProfileHeroSection } from "./components/profile-hero-section";
import { AppearanceSection } from "./components/appearance-section";
import { LanguageSection } from "./components/language-section";
import { NotificationsSection } from "./components/notifications-section";
import { SecuritySection } from "./components/security-section";

type NotificationItem = { key: string; label: string; help: string };

export function AccountTabsClient({
  hasSession,
  locale,
  notificationLabels,
}: {
  hasSession: boolean;
  locale: "fr" | "en";
  notificationLabels: {
    eyebrow: string;
    title: string;
    description: string;
    availabilityHint: string;
    statusLabel: string;
    items: NotificationItem[];
  };
}) {
  const tabs = [
    { value: "profil", label: "Profile", icon: User },
    { value: "apparence", label: "Appearance", icon: Monitor },
    { value: "langue", label: "Language", icon: Globe },
    { value: "securite", label: "Security", icon: ShieldCheck },
    { value: "notifications", label: "Notifications", icon: Bell },
  ] as const;

  return (
    <Tabs defaultValue="profil" className="gap-0">
      <div className="-mx-4 overflow-x-auto px-4 sm:-mx-5 sm:px-5">
        <TabsList
          variant="line"
          className="mb-5 w-max gap-0 border-b border-border pb-0"
        >
          {tabs.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="shrink-0 gap-1.5 rounded-none border-b-2 border-transparent px-3 pb-3 pt-1 text-sm data-[state=active]:border-accent data-[state=active]:text-accent"
            >
              <Icon size={14} />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="profil">
        <div className="flex flex-col gap-4">
          {hasSession ? <ProfileHeroSection /> : null}
        </div>
      </TabsContent>

      <TabsContent value="apparence">
        <AppearanceSection />
      </TabsContent>

      <TabsContent value="langue">
        <LanguageSection currentLocale={locale} />
      </TabsContent>

      <TabsContent value="securite">
        <SecuritySection />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationsSection labels={notificationLabels} />
      </TabsContent>
    </Tabs>
  );
}
