import { Page, PageContent } from "@starter/ui";
import { Settings } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentSession } from "@/domains/auth/use-cases/get-current-session";
import { AccountTabsClient } from "./account-tabs-client";

export default async function AccountSettingsPage() {
  const [locale, t, session] = await Promise.all([
    getLocale(),
    getTranslations("account"),
    getCurrentSession(),
  ]);

  return (
    <Page className="flex h-full flex-col">
      <div className="sticky top-0 z-20 mb-3 shrink-0 backdrop-blur supports-backdrop-filter:bg-panel-strong/95 sm:mb-4">
        <div className="flex items-center gap-3 rounded-[1.8rem] border border-border bg-panel-strong px-4 py-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] sm:px-6 sm:py-5">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-2xl border border-border bg-secondary text-accent shadow-xs">
            <Settings size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {t("account")}
            </p>
            <h1 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {t("title")}
            </h1>
          </div>
        </div>
      </div>

      <PageContent className="min-h-0 flex-1 overflow-y-auto rounded-[1.8rem] p-4 sm:p-5">
        <AccountTabsClient
          hasSession={session !== null}
          locale={(locale as "fr" | "en") ?? "fr"}
          notificationLabels={{
            eyebrow: t("notifications"),
            title: t("notifications"),
            description: t("notificationDescription"),
            availabilityHint: t("notificationAvailabilityHint"),
            statusLabel: t("notificationVisibleStatus"),
            items: [],
          }}
        />
      </PageContent>
    </Page>
  );
}
