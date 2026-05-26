import { AppShell } from "@/components/app-shell";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { getCurrentSession } from "@/domains/auth/use-cases/get-current-session";
import { redirect } from "next/navigation";
import { CurrentUserProvider } from "@/domains/auth/context/current-user-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <CurrentUserProvider initialUser={session.user}>
      <AppShell>{children}</AppShell>
      <PwaInstallBanner />
    </CurrentUserProvider>
  );
}
