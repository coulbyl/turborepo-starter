import { AppShell } from "@/components/app-shell";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { getCurrentSession } from "@/domains/auth/use-cases/get-current-session";
import { getWorkspaces } from "@/domains/workspace/use-cases/get-workspaces";
import { CurrentWorkspaceProvider } from "@/domains/workspace/context/current-workspace-context";
import { CurrentUserProvider } from "@/domains/auth/context/current-user-context";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/auth/login");

  const workspaces = await getWorkspaces();

  // No workspace yet → onboarding
  if (workspaces.length === 0) {
    redirect("/dashboard/workspace/new");
  }

  // Default to first workspace (Sprint 2: persist selection in cookie)
  const activeWorkspace = workspaces[0]!;

  return (
    <CurrentUserProvider initialUser={session.user}>
      <CurrentWorkspaceProvider workspace={activeWorkspace}>
        <AppShell>{children}</AppShell>
        <PwaInstallBanner />
      </CurrentWorkspaceProvider>
    </CurrentUserProvider>
  );
}
