import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { StatCard } from "@identis/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@identis/ui/card";
import { Button } from "@identis/ui/components/button";
import { getCurrentSession } from "@/domains/auth/use-cases/get-current-session";
import { getWorkspaces } from "@/domains/workspace/use-cases/get-workspaces";
import { getWorkspaceStats } from "@/domains/workspace/use-cases/get-workspace-stats";
import { PageHeader } from "@/components/page-header";
import { RecentCasesTable } from "./components/recent-cases-table";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const [session, workspaces] = await Promise.all([
    getCurrentSession(),
    getWorkspaces(),
  ]);

  if (!session) redirect("/auth/login");
  if (workspaces.length === 0) redirect("/dashboard/workspace/new");

  const workspace = workspaces[0]!;
  const stats = await getWorkspaceStats(workspace.id);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title={`${greeting}, ${session.user.fullName.split(" ")[0]}`}
        description={`${workspace.name} · Vue d'ensemble`}
        action={
          <Button asChild>
            <Link href="/dashboard/cases/new">Nouveau dossier</Link>
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Solde wallet"
          value={`${stats.walletBalance.toLocaleString("fr-FR")} FCFA`}
          icon={<Wallet className="h-3 w-3" />}
          tone={stats.walletBalance < 2000 ? "warning" : "accent"}
          delta={
            stats.walletBalance < 2000 ? (
              <span className="text-xs text-amber-600">
                Solde bas — rechargez
              </span>
            ) : undefined
          }
        />
        <StatCard
          label="Dossiers ce mois"
          value={String(stats.casesThisMonth)}
          icon={<TrendingUp className="h-3 w-3" />}
          tone="accent"
          delta={
            <span className="text-xs text-muted-foreground">
              {stats.totalCases} au total
            </span>
          }
        />
        <StatCard
          label="En attente"
          value={String(stats.pendingCases)}
          icon={<Clock className="h-3 w-3" />}
          tone={stats.pendingCases > 0 ? "warning" : "neutral"}
          delta={
            <span className="text-xs text-muted-foreground">
              PENDING + EN RÉVISION
            </span>
          }
        />
        <StatCard
          label="Taux d'approbation"
          value={stats.approvalRate !== null ? `${stats.approvalRate}%` : "—"}
          icon={<CheckCircle2 className="h-3 w-3" />}
          tone={
            stats.approvalRate === null
              ? "neutral"
              : stats.approvalRate >= 70
                ? "success"
                : "warning"
          }
          delta={
            <span className="text-xs text-muted-foreground">
              {stats.approvalRate === null
                ? "Aucun dossier traité"
                : stats.approvalRate >= 70
                  ? "Bon taux"
                  : "À surveiller"}
            </span>
          }
        />
      </div>

      {/* Recent cases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">
            Derniers dossiers
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/cases" className="flex items-center gap-1">
              Voir tout <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <RecentCasesTable cases={stats.recentCases} />
        </CardContent>
      </Card>
    </div>
  );
}
